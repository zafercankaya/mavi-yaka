import './config'; // Load env first
import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import { PrismaClient, Market } from '@prisma/client';
import { startScheduler, stopScheduler } from './scheduler';
import { crawlAllActive, crawlByMarkets } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const prisma = new PrismaClient();
let healthServer: Server | null = null;

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || '';
const ALL_MARKETS: Market[] = [
  'TR', 'US', 'UK', 'DE', 'IN', 'BR', 'ID', 'RU',
  'MX', 'JP', 'PH', 'TH', 'CA', 'AU', 'FR', 'IT',
  'ES', 'EG', 'SA', 'KR', 'AR', 'AE', 'VN', 'PL',
  'MY', 'CO', 'ZA', 'PT', 'NL', 'PK', 'SE',
];

// ── Crawl state ──
let isCrawling = false;
let crawlStartTime = 0;
let crawlingMarkets: string[] = [];
let crawlResults: Array<{ market: string; success: number; failed: number; newCampaigns: number }> = [];

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
  });
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function handleTrigger(req: IncomingMessage, res: ServerResponse) {
  // Auth check
  if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
    return json(res, 401, { error: 'Unauthorized' });
  }

  if (isCrawling) {
    return json(res, 409, {
      error: 'Crawl already running',
      markets: crawlingMarkets,
      elapsed: Math.round((Date.now() - crawlStartTime) / 1000) + 's',
    });
  }

  let markets: Market[] = [];
  try {
    const body = await readBody(req);
    const parsed = body ? JSON.parse(body) : {};
    if (parsed.markets && Array.isArray(parsed.markets)) {
      markets = parsed.markets
        .map((m: string) => m.toUpperCase())
        .filter((m: string) => ALL_MARKETS.includes(m as Market)) as Market[];
    }
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  if (markets.length === 0) {
    return json(res, 400, { error: 'No valid markets specified. Use {"markets":["KR","SA","EG","ES"]}' });
  }

  // Start crawl in background
  isCrawling = true;
  crawlStartTime = Date.now();
  crawlingMarkets = [...markets];
  crawlResults = [];

  json(res, 200, { status: 'started', markets, count: markets.length });

  // Run crawl (fire-and-forget, max 4 markets at a time in sequence groups)
  (async () => {
    console.log(`\n[Trigger] Manual crawl started: ${markets.join(', ')}`);
    try {
      const results = await crawlByMarkets(prisma, markets);

      // Summarize
      const totalSuccess = results.filter(r => r.status === 'SUCCESS' || r.status === 'PARTIAL').length;
      const totalFailed = results.filter(r => r.status === 'FAILED').length;
      const totalNewCampaigns = results.reduce((s, r) => s + r.jobsNew, 0);
      crawlResults = [{ market: markets.join(','), success: totalSuccess, failed: totalFailed, newCampaigns: totalNewCampaigns }];

      const elapsed = Math.round((Date.now() - crawlStartTime) / 60000);
      console.log(`[Trigger] Crawl complete in ${elapsed}min: ${totalSuccess} success, ${totalFailed} failed, ${totalNewCampaigns} new campaigns`);
    } catch (err) {
      console.error('[Trigger] Crawl error:', (err as Error).message);
    } finally {
      await closeBrowser();
      isCrawling = false;
    }
  })();
}

function handleStatus(res: ServerResponse) {
  const data: Record<string, unknown> = {
    crawling: isCrawling,
    uptime: Math.round(process.uptime()),
  };

  if (isCrawling) {
    data.markets = crawlingMarkets;
    data.startedAt = new Date(crawlStartTime).toISOString();
    data.elapsed = Math.round((Date.now() - crawlStartTime) / 1000) + 's';
  }

  if (crawlResults.length > 0) {
    data.lastResults = crawlResults;
  }

  json(res, 200, data);
}

async function main() {
  console.log('=== Mavi Yaka Crawler ===');
  console.log(`Mode: ${process.argv[2] || 'scheduler'}`);

  await prisma.$connect();
  console.log('Database connected');

  const mode = process.argv[2];

  if (mode === 'once') {
    // Run all active sources once and exit
    console.log('Running one-time crawl of all active sources...');
    const results = await crawlAllActive(prisma);

    console.log('\n--- Summary ---');
    for (const r of results) {
      console.log(`  ${r.sourceName}: ${r.status} (found=${r.jobsFound}, new=${r.jobsNew})`);
    }

    await closeBrowser();
    await prisma.$disconnect();
    process.exit(0);
  }

  // Default: scheduler mode
  await startScheduler(prisma);

  // HTTP server with health + trigger + status endpoints
  const PORT = parseInt(process.env.PORT || '10000', 10);
  healthServer = createServer(async (req, res) => {
    const url = req.url?.split('?')[0];

    if ((url === '/health' || url === '/') && req.method === 'GET') {
      json(res, 200, { status: 'ok', uptime: Math.round(process.uptime()) });
    } else if (url === '/trigger' && req.method === 'POST') {
      await handleTrigger(req, res);
    } else if (url === '/status' && req.method === 'GET') {
      handleStatus(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  healthServer.listen(PORT, () => {
    console.log(`Health server listening on port ${PORT}`);
  });

  console.log('Crawler is running. Press Ctrl+C to stop.');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down...');
    stopScheduler();
    if (healthServer) healthServer.close();
    await closeBrowser();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
