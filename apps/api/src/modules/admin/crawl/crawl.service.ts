import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrawlStatus, Market } from '@prisma/client';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);
  // __dirname at runtime = .../apps/api/dist/modules/admin/crawl
  // 5 levels up = .../apps, then /crawler = .../apps/crawler
  private readonly crawlerDir = path.resolve(__dirname, '../../../../../crawler');

  private readonly MAX_CONCURRENT_CRAWLS = 3;

  constructor(private readonly prisma: PrismaService) {}

  async getLogs(filters: {
    sourceId?: string;
    brandId?: string;
    categoryId?: string;
    status?: string;
    market?: Market;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const where: any = {};
    if (filters.sourceId) where.sourceId = filters.sourceId;
    if (filters.categoryId && filters.brandId) {
      where.source = { brandId: filters.brandId, brand: { categoryId: filters.categoryId } };
    } else if (filters.categoryId) {
      where.source = { brand: { categoryId: filters.categoryId } };
    } else if (filters.brandId) {
      where.source = { brandId: filters.brandId };
    }
    if (filters.market) {
      where.source = { ...where.source, market: filters.market };
    }
    if (filters.status) where.status = filters.status;

    return this.prisma.crawlLog.findMany({
      where,
      include: {
        source: {
          select: {
            name: true,
            brandId: true,
            brand: { select: { name: true, categoryId: true, category: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: filters.sortOrder || 'desc' },
      take: filters.limit || 50,
    });
  }

  async deleteLogs(ids: string[]) {
    const result = await this.prisma.crawlLog.deleteMany({
      where: { id: { in: ids } },
    });
    return { deletedCount: result.count };
  }

  async getLog(id: string) {
    const log = await this.prisma.crawlLog.findUnique({
      where: { id },
      include: {
        source: { select: { name: true, brand: { select: { name: true } } } },
      },
    });
    if (!log) throw new NotFoundException('Crawl log bulunamadı');
    return log;
  }

  async getSourceForCrawl(sourceId: string) {
    const source = await this.prisma.crawlSource.findUnique({
      where: { id: sourceId },
      include: { brand: { select: { name: true } } },
    });
    if (!source) throw new NotFoundException('Kaynak bulunamadi');
    return source;
  }

  /**
   * Tek kaynak icin crawl tetikle.
   * Crawl log olusturur ve crawler'i child process olarak calistirir.
   */
  async triggerCrawl(sourceId: string) {
    const source = await this.getSourceForCrawl(sourceId);

    // Create log entry - crawler will update this log
    const log = await this.prisma.crawlLog.create({
      data: {
        sourceId: source.id,
        status: CrawlStatus.RUNNING,
        campaignsFound: 0,
        campaignsNew: 0,
        campaignsUpdated: 0,
        durationMs: 0,
      },
    });

    // Spawn crawler as child process (fire-and-forget)
    try {
      this.spawnCrawler(sourceId, log.id, source.name);
    } catch (err) {
      this.logger.error(`Failed to spawn crawler: ${(err as Error).message}`);
      await this.prisma.crawlLog.update({
        where: { id: log.id },
        data: { status: CrawlStatus.FAILED, errorMessage: `Spawn failed: ${(err as Error).message}` },
      });
    }

    return {
      logId: log.id,
      sourceId: source.id,
      sourceName: source.name,
      status: 'RUNNING',
      message: `Crawl başlatıldı: ${source.name}`,
    };
  }

  /**
   * Tum aktif kaynaklari crawl et — max 3 concurrent child process ile kuyruk sistemi.
   * Hemen response döner (fire-and-forget), arka planda sıralı spawn eder.
   */
  async triggerAllCrawls() {
    const activeSources = await this.prisma.crawlSource.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    // Tüm log'ları önceden oluştur
    const logs = await Promise.all(
      activeSources.map((source) =>
        this.prisma.crawlLog.create({
          data: {
            sourceId: source.id,
            status: CrawlStatus.RUNNING,
            campaignsFound: 0,
            campaignsNew: 0,
            campaignsUpdated: 0,
            durationMs: 0,
          },
        }),
      ),
    );

    const queue = activeSources.map((source, i) => ({
      source,
      logId: logs[i].id,
    }));

    // Arka planda max N concurrent olarak spawn et
    this.processQueue(queue);

    return {
      triggeredCount: activeSources.length,
      status: 'QUEUED',
      message: `${activeSources.length} kaynak kuyruğa alındı (max ${this.MAX_CONCURRENT_CRAWLS} eşzamanlı)`,
    };
  }

  /**
   * Kuyruktan max N concurrent child process spawn eder.
   * Her crawl tamamlandığında sıradaki başlar.
   */
  private processQueue(queue: { source: { id: string; name: string }; logId: string }[]) {
    let running = 0;
    let index = 0;
    let completed = 0;

    const next = () => {
      while (running < this.MAX_CONCURRENT_CRAWLS && index < queue.length) {
        const item = queue[index++];
        running++;

        this.logger.log(
          `[Queue] Spawning ${item.source.name} (${completed}/${queue.length} done, ${running} active)`,
        );

        this.spawnCrawler(item.source.id, item.logId, item.source.name, () => {
          running--;
          completed++;
          this.logger.log(
            `[Queue] Finished ${item.source.name} (${completed}/${queue.length} done, ${running} active)`,
          );
          next();
        });
      }

      if (running === 0 && index >= queue.length) {
        this.logger.log(`[Queue] All ${queue.length} crawls completed`);
      }
    };

    next();
  }

  /**
   * Crawler child process'i başlat
   */
  private spawnCrawler(sourceId: string, logId: string, sourceName: string, onDone?: () => void) {
    const scriptPath = path.resolve(this.crawlerDir, 'src/run-single.ts');
    // ts-node is hoisted to monorepo root node_modules
    const rootBin = path.resolve(this.crawlerDir, '../../node_modules/.bin');
    const tsNodeCmd = process.platform === 'win32' ? 'ts-node.cmd' : 'ts-node';
    const tsNodePath = path.join(rootBin, tsNodeCmd);

    this.logger.log(`Spawning crawler for: ${sourceName} (${sourceId}), log: ${logId}`);
    this.logger.log(`  crawlerDir: ${this.crawlerDir}`);
    this.logger.log(`  tsNode: ${tsNodePath}`);
    this.logger.log(`  script: ${scriptPath}`);

    const child = spawn(
      tsNodePath,
      [scriptPath, sourceId, logId],
      {
        cwd: this.crawlerDir,
        stdio: 'pipe',
        detached: false,
        env: { ...process.env },
        shell: process.platform === 'win32',
      },
    );

    child.stdout?.on('data', (data) => {
      this.logger.log(`[Crawler:${sourceName}] ${data.toString().trim()}`);
    });

    child.stderr?.on('data', (data) => {
      this.logger.warn(`[Crawler:${sourceName}] ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        this.logger.log(`[Crawler:${sourceName}] Completed successfully`);
      } else {
        this.logger.error(`[Crawler:${sourceName}] Exited with code ${code}`);
        // Mark log as failed if process crashed
        this.prisma.crawlLog.update({
          where: { id: logId },
          data: {
            status: CrawlStatus.FAILED,
            errorMessage: `Crawler process exited with code ${code}`,
          },
        }).catch(() => {});
      }
      onDone?.();
    });

    child.on('error', (err) => {
      this.logger.error(`[Crawler:${sourceName}] Spawn error: ${err.message}`);
      this.prisma.crawlLog.update({
        where: { id: logId },
        data: {
          status: CrawlStatus.FAILED,
          errorMessage: `Spawn error: ${err.message}`,
        },
      }).catch(() => {});
      onDone?.();
    });
  }
}
