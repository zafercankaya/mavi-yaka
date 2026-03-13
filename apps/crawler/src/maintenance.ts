/**
 * Daily Maintenance Module — Runs at 09:00 UTC via scheduler
 *
 * 8 automated tasks:
 * 1. Amazon source deactivation
 * 2. Brand name suffix cleanup (country codes/names)
 * 3. Duplicate brand merging
 * 4. Dead source detection (14+ days fatal fail)
 * 5. Orphan campaign expiration (deactivated source campaigns)
 * 6. 404 campaign detection (error page titles/images)
 * 7. Old crawl log cleanup (30+ days)
 * 8. Health report
 */
import { PrismaClient, CrawlStatus } from '@prisma/client';

// ─── Types ──────────────────────────────────────────────

interface TaskResult {
  name: string;
  status: 'OK' | 'SKIPPED' | 'ERROR';
  count: number;
  duration: number;
  details?: string;
}

interface MaintenanceReport {
  timestamp: Date;
  tasks: TaskResult[];
  summary: {
    amazonDeactivated: number;
    brandsCleaned: number;
    brandsMerged: number;
    sourcesDeactivated: number;
    orphanCampaignsExpired: number;
    notFoundCampaignsExpired: number;
    oldLogsDeleted: number;
    wafCampaignsExpired: number;
    repeatedImagesCleaned: number;
    invalidImagesCleaned: number;
    garbageTitlesExpired: number;
    foreignLocaleExpired: number;
    staleLogsCleaned: number;
    nearLimitBrands: number;
    fakePromoCodesCleaned: number;
  };
}

// ─── Constants ──────────────────────────────────────────

const COUNTRY_NAME_SUFFIXES = [
  'United Kingdom', 'United States', 'South Korea', 'New Zealand',
  'United Arab Emirates',
  'India', 'Turkey', 'Germany', 'Brazil', 'Indonesia', 'Russia', 'Mexico',
  'Japan', 'Philippines', 'Thailand', 'Canada', 'Australia', 'France',
  'España', 'China', 'Korea', 'Singapore', 'Malaysia', 'Vietnam',
  'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Egypt', 'Nigeria',
  'South Africa', 'Kenya', 'Ghana', 'Morocco', 'Argentina', 'Colombia',
  'Chile', 'Peru', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay',
  'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Poland', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark',
  'Finland', 'Austria', 'Switzerland', 'Portugal', 'Greece', 'Ireland',
  'Czech Republic', 'Romania', 'Hungary', 'Ukraine',
  'UAE', 'Emirates',
  // Turkish
  'Türkiye', 'Hindistan', 'Almanya', 'Brezilya', 'Endonezya', 'Rusya',
  'Meksika', 'Japonya', 'Filipinler', 'Tayland', 'Kanada', 'Avustralya',
  'Fransa', 'İtalya', 'Mısır', 'Güney Afrika', 'Kolombiya', 'İsveç',
  'Portekiz', 'Hollanda', 'Birleşik Arap Emirlikleri',
  // Local names
  'Deutschland', 'Brasil', 'México', 'Россия',
  // Spanish
  'Spain', 'Corea del Sur', 'Arabia Saudita', 'Espagne', 'Argentine',
  // French
  'Arabie saoudite', 'Egypte',
  // German
  'Ägypten', 'Argentinien',
  // Korean
  '한국',
];

const ISO_CODE_SUFFIXES = [
  'TR', 'US', 'DE', 'UK', 'BR', 'MX', 'JP', 'PH', 'TH',
  'AU', 'FR', 'IT', 'ID', 'RU', 'CA', 'IN',
  'ES', 'EG', 'SA', 'KR', 'AR',
  'AE', 'VN', 'PL', 'MY', 'CO', 'ZA', 'PT', 'NL', 'PK', 'SE',
];

const BRAND_NAME_EXCEPTIONS = new Set([
  'air india', 'garuda indonesia', 'air france', 'air canada',
  'bella italia', 'italia', 'alitalia', 'piazza italia', 'self italia',
  'virgin australia', 'tourism australia', 'silk oil of morocco',
  'faces canada', 'canada goose', 'canada dry', 'pizza pizza canada',
  'national bank of canada',
  'bank of india', 'state bank of india', 'life insurance corporation of india',
  'oil india', 'coal india', 'food corporation of india',
  'air india express', 'carvana india',
  'banco do brasil', 'banco de chile',
  'holland america',
  'pru life uk',
  'deutsche bank', 'deutsche telekom', 'deutsche post', 'deutsche bahn',
  'china mobile', 'bank of china',
  'tour de france', 'kent ro', 'brew tea co', 'fantasy in',
  'thomas cook india', 'santander brasil',
  'chubb life indonesia', 'allianz indonesia', 'allianz brasil', 'allianz méxico',
  'allianz italia', 'axa italia', 'generali italia', 'ing italia',
  'prudential indonesia', 'mapfre brasil', 'zurich brasil', 'zurich indonesia',
  'axa seguros méxico', 'aig méxico', 'aon méxico',
  'generali indonesia', 'sompo insurance indonesia', 'tokio marine indonesia',
  'fwd insurance indonesia', 'great eastern indonesia', 'msig indonesia',
  'cigna indonesia', 'home credit indonesia', 'manulife indonesia', 'seabank indonesia',
  'ergo россия', 'latam airlines brasil',
  'egypt air', 'egyptair', 'bank of egypt',
  'saudi aramco', 'saudi telecom', 'stc saudi',
  'korean air', 'air korea',
  'aerolineas argentinas', 'aerolíneas argentinas', 'banco de la nacion argentina',
  'el corte ingles', 'el corte inglés',
  'emirates', 'emirates airline', 'fly emirates', 'emirates nbd', 'pan emirates',
  'avianca colombia', 'banco de colombia', 'bancolombia',
  'south african airways', 'south african breweries',
  'vietnam airlines', 'vietjet air',
  'lot polish airlines',
  'klm royal dutch airlines',
  'tap air portugal', 'tap portugal',
]);

const FATAL_ERROR_PATTERNS = [
  'ERR_NAME_NOT_RESOLVED',
  'ERR_CERT_AUTHORITY_INVALID',
  'ERR_CERT_DATE_INVALID',
  'ERR_CERT_COMMON_NAME_INVALID',
  'ERR_CONNECTION_REFUSED',
  'ENOTFOUND',
  'ERR_SSL',
];

const ERROR_TITLE_PATTERNS = [
  /\bpage\s*not\s*found\b/i,
  /\b404\s*(not\s*found|error|page)?\b/i,
  /^404$/,
  /\bsayfa\s*bulunamad[ıi]\b/i,
  /\bseite\s*nicht\s*gefunden\b/i,
  /\bpage\s*introuvable\b/i,
  /\bpagina\s*non\s*trovata\b/i,
  /\bp[áa]gina\s*n[ãa]o\s*encontrada\b/i,
  /\bp[áa]gina\s*no\s*encontrada\b/i,
  /\bページが見つかりません/i,
  /\bстраница\s*не\s*найдена\b/i,
  /\bhalaman\s*tidak\s*ditemukan\b/i,
  /\bไม่พบหน้า/i,
  /\b페이지를?\s*찾을\s*수\s*없/i,
  /\bالصفحة\s*غير\s*موجودة/i,
];

const ERROR_IMAGE_PATTERNS = [
  /\/errors?\/(not[_-]?found|404)/i,
  /\/error[_-]?404/i,
  /\/404[_-]?(error|page|not[_-]?found)/i,
  /\/page[_-]?not[_-]?found/i,
  /\/not[_-]?found\.(png|jpg|jpeg|svg|webp|gif)/i,
  /\/404\.(png|jpg|jpeg|svg|webp|gif)/i,
  /error-page/i,
];

const WAF_TITLE_PATTERNS = [
  /\baccess\s*denied\b/i,
  /\brobot\s*or\s*human\b/i,
  /\bjust\s*a\s*moment\b/i,
  /\battention\s*required\b/i,
  /\bcloudflare\b/i,
  /\bplease\s*wait\b.*\bredirect/i,
  /\bcaptcha\b/i,
  /\bverification\s*required\b/i,
  /\bblocked\b.*\bsecurity\b/i,
  /\b403\s*forbidden\b/i,
  /\bnur\s*einen\s*moment\b/i,         // DE
  /잠시만\s*기다리/i,                    // KR
];

const INVALID_IMAGE_PATTERNS = [
  /^https?:\/\/(localhost|127\.0\.0\.1)/i,
  /^data:image\//i,
  /\/transparent\.(png|gif|svg)/i,
  /\/null\//i,
  /apple-touch-icon/i,
  /TRANSPARENT_IMAGE/i,
];

const REPEATED_IMAGE_THRESHOLD = 10;
const STALE_LOG_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

const DEAD_SOURCE_THRESHOLD_DAYS = 14;
const OLD_LOG_RETENTION_DAYS = 30;
const MIN_CONSECUTIVE_FAILURES = 2;

// ─── Helper Functions ───────────────────────────────────

function getCleanBrandName(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (BRAND_NAME_EXCEPTIONS.has(lower)) return null;

  for (const suffix of COUNTRY_NAME_SUFFIXES) {
    if (lower.endsWith(' ' + suffix.toLowerCase())) {
      const clean = name.substring(0, name.length - suffix.length - 1).trim();
      return clean.length >= 2 ? clean : null;
    }
    // Check " (Suffix)" pattern
    const parenSuffix = ' (' + suffix.toLowerCase() + ')';
    if (lower.endsWith(parenSuffix)) {
      const clean = name.substring(0, name.length - parenSuffix.length).trim();
      return clean.length >= 2 ? clean : null;
    }
  }

  for (const code of ISO_CODE_SUFFIXES) {
    if (name.endsWith(' ' + code)) {
      const clean = name.substring(0, name.length - code.length - 1).trim();
      return clean.length >= 2 ? clean : null;
    }
  }

  return null;
}

function hasFatalError(errorMessage: string | null): boolean {
  if (!errorMessage) return false;
  return FATAL_ERROR_PATTERNS.some(p => errorMessage.includes(p));
}

async function runTask(
  name: string,
  fn: () => Promise<{ count: number; details?: string }>,
): Promise<TaskResult> {
  const start = Date.now();
  try {
    const { count, details } = await fn();
    return {
      name,
      status: count > 0 ? 'OK' : 'SKIPPED',
      count,
      duration: Date.now() - start,
      details,
    };
  } catch (err) {
    return {
      name,
      status: 'ERROR',
      count: 0,
      duration: Date.now() - start,
      details: (err as Error).message,
    };
  }
}

// ─── Task Implementations ───────────────────────────────

/** Task 1: Deactivate any active Amazon e-commerce sources (except Cafe Amazon) */
async function deactivateAmazonSources(prisma: PrismaClient) {
  const sources = await prisma.crawlSource.findMany({
    where: {
      isActive: true,
      brand: { name: { contains: 'Amazon', mode: 'insensitive' } },
    },
    select: {
      id: true,
      name: true,
      brand: { select: { name: true, market: true } },
    },
  });

  // Filter out Cafe Amazon (different company)
  const toDeactivate = sources.filter(
    s => !s.brand.name.toLowerCase().includes('cafe amazon'),
  );

  if (toDeactivate.length === 0) return { count: 0 };

  await prisma.crawlSource.updateMany({
    where: { id: { in: toDeactivate.map(s => s.id) } },
    data: { isActive: false },
  });

  const markets = [...new Set(toDeactivate.map(s => s.brand.market))].join(', ');
  return {
    count: toDeactivate.length,
    details: `Deactivated in: ${markets}`,
  };
}

/** Task 2: Clean brand names — remove country suffixes */
async function cleanBrandNames(prisma: PrismaClient) {
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true, market: true },
    orderBy: [{ market: 'asc' }, { name: 'asc' }],
  });

  let cleaned = 0;
  let skipped = 0;

  for (const b of brands) {
    const cleanName = getCleanBrandName(b.name);
    if (!cleanName) continue;

    // Check for duplicate — skip if clean name already exists in same market
    const existing = await prisma.brand.findFirst({
      where: {
        name: { equals: cleanName, mode: 'insensitive' },
        market: b.market,
        id: { not: b.id },
      },
      select: { id: true },
    });

    if (existing) {
      skipped++;
      continue; // Task 3 (merge) will handle this
    }

    await prisma.brand.update({
      where: { id: b.id },
      data: { name: cleanName },
    });
    cleaned++;
  }

  return {
    count: cleaned,
    details: skipped > 0 ? `${skipped} skipped (duplicates, will merge)` : undefined,
  };
}

/** Task 3: Merge duplicate brands (suffix brand → clean brand in same market) */
async function mergeDuplicateBrands(prisma: PrismaClient) {
  const allBrands = await prisma.brand.findMany({
    select: { id: true, name: true, market: true, slug: true },
    orderBy: [{ market: 'asc' }, { name: 'asc' }],
  });

  // Build lookup: market::name_lower → brand
  const brandLookup = new Map<string, typeof allBrands[0]>();
  for (const b of allBrands) {
    brandLookup.set(`${b.market}::${b.name.toLowerCase()}`, b);
  }

  const merges: Array<{ source: typeof allBrands[0]; target: typeof allBrands[0] }> = [];

  for (const b of allBrands) {
    const cleanName = getCleanBrandName(b.name);
    if (!cleanName) continue;

    const target = brandLookup.get(`${b.market}::${cleanName.toLowerCase()}`);
    if (!target || target.id === b.id) continue;

    merges.push({ source: b, target });
  }

  if (merges.length === 0) return { count: 0 };

  let merged = 0;

  for (const { source, target } of merges) {
    try {
      // Safety: skip if either brand has a currently running crawl
      const runningLogs = await prisma.crawlLog.count({
        where: {
          status: CrawlStatus.RUNNING,
          source: { brandId: { in: [source.id, target.id] } },
        },
      });
      if (runningLogs > 0) {
        console.log(`[Maintenance] Skipping merge "${source.name}" — active crawl detected`);
        continue;
      }

      // 1. Transfer crawl sources
      const sourceSources = await prisma.crawlSource.findMany({
        where: { brandId: source.id },
        select: { id: true, seedUrls: true },
      });

      const targetSources = await prisma.crawlSource.findMany({
        where: { brandId: target.id },
        select: { id: true, seedUrls: true },
      });

      const targetUrlSet = new Set(targetSources.flatMap(s => s.seedUrls));

      // Collect new URLs from source brand
      const newUrls: string[] = [];
      for (const ss of sourceSources) {
        for (const u of ss.seedUrls) {
          if (!targetUrlSet.has(u)) newUrls.push(u);
        }
      }

      // Append new URLs to target's first source (if target has one)
      if (newUrls.length > 0 && targetSources.length > 0) {
        const mainSource = targetSources[0];
        const combined = [...new Set([...mainSource.seedUrls, ...newUrls])];
        await prisma.crawlSource.update({
          where: { id: mainSource.id },
          data: { seedUrls: combined },
        });
      } else if (newUrls.length > 0 && targetSources.length === 0) {
        // Transfer first source to target brand
        await prisma.crawlSource.update({
          where: { id: sourceSources[0].id },
          data: { brandId: target.id },
        });
        // Delete remaining sources
        for (let i = 1; i < sourceSources.length; i++) {
          await prisma.campaign.updateMany({
            where: { sourceId: sourceSources[i].id },
            data: { sourceId: sourceSources[0].id },
          });
          await prisma.crawlLog.deleteMany({ where: { sourceId: sourceSources[i].id } });
          await prisma.crawlSource.delete({ where: { id: sourceSources[i].id } });
        }
        // Delete remaining relations and source brand
        await prisma.campaign.deleteMany({ where: { brandId: source.id } });
        try { await prisma.follow.deleteMany({ where: { brandId: source.id } }); } catch {}
        await prisma.brand.delete({ where: { id: source.id } });
        merged++;
        continue;
      }

      // 2. Handle campaign conflicts (same canonicalUrl in both brands)
      const targetCampaigns = await prisma.campaign.findMany({
        where: { brandId: target.id },
        select: { canonicalUrl: true },
      });
      const targetUrls = new Set(
        targetCampaigns.map(c => c.canonicalUrl).filter(Boolean),
      );

      if (targetUrls.size > 0) {
        const sourceCampaigns = await prisma.campaign.findMany({
          where: { brandId: source.id },
          select: { id: true, canonicalUrl: true },
        });
        const conflictIds = sourceCampaigns
          .filter(c => c.canonicalUrl && targetUrls.has(c.canonicalUrl))
          .map(c => c.id);
        if (conflictIds.length > 0) {
          await prisma.campaign.deleteMany({ where: { id: { in: conflictIds } } });
        }
      }

      // Move remaining campaigns
      await prisma.campaign.updateMany({
        where: { brandId: source.id },
        data: { brandId: target.id },
      });

      // 3. Delete source brand's crawl sources
      for (const ss of sourceSources) {
        await prisma.campaign.updateMany({
          where: { sourceId: ss.id },
          data: { sourceId: targetSources.length > 0 ? targetSources[0].id : undefined },
        });
        await prisma.crawlLog.deleteMany({ where: { sourceId: ss.id } });
        await prisma.crawlSource.delete({ where: { id: ss.id } });
      }

      // 4. Delete follows and source brand
      try { await prisma.follow.deleteMany({ where: { brandId: source.id } }); } catch {}
      await prisma.brand.delete({ where: { id: source.id } });
      merged++;
    } catch (err) {
      console.error(`[Maintenance] Merge failed: "${source.name}" → "${target.name}": ${(err as Error).message}`);
    }
  }

  return { count: merged };
}

/** Task 4: Detect and deactivate dead sources (14+ days fatal failures) */
async function deactivateDeadSources(prisma: PrismaClient) {
  const cutoff = new Date(Date.now() - DEAD_SOURCE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      brandId: true,
      brand: { select: { name: true, market: true } },
      crawlLogs: {
        where: { createdAt: { gt: cutoff } },
        orderBy: { createdAt: 'desc' as const },
        take: 3,
        select: { status: true, errorMessage: true },
      },
    },
  });

  const toDeactivate: string[] = [];

  for (const s of sources) {
    if (s.crawlLogs.length < MIN_CONSECUTIVE_FAILURES) continue;

    // Skip if currently running
    const isRunning = s.crawlLogs.some(l => l.status === CrawlStatus.RUNNING);
    if (isRunning) continue;

    // Skip if any success in recent logs
    const hasSuccess = s.crawlLogs.some(
      l => l.status === CrawlStatus.SUCCESS || l.status === CrawlStatus.PARTIAL,
    );
    if (hasSuccess) continue;

    // All logs must be FAILED with fatal error
    const allFatal = s.crawlLogs.every(l => hasFatalError(l.errorMessage));
    if (!allFatal) continue;

    toDeactivate.push(s.id);
  }

  if (toDeactivate.length === 0) return { count: 0 };

  await prisma.crawlSource.updateMany({
    where: { id: { in: toDeactivate } },
    data: { isActive: false },
  });

  return {
    count: toDeactivate.length,
    details: `Fatal errors: DNS/SSL/CERT (${DEAD_SOURCE_THRESHOLD_DAYS}d threshold)`,
  };
}

/** Task 5: Expire orphan campaigns (campaigns of deactivated sources with no active source left) */
async function expireOrphanCampaigns(prisma: PrismaClient) {
  // Find brands that have ACTIVE campaigns but no active sources
  const brandsWithActiveCampaigns = await prisma.brand.findMany({
    where: {
      campaigns: { some: { status: 'ACTIVE' } },
      sources: { none: { isActive: true } },
    },
    select: { id: true, name: true, market: true },
  });

  if (brandsWithActiveCampaigns.length === 0) return { count: 0 };

  const brandIds = brandsWithActiveCampaigns.map(b => b.id);

  // Only expire campaigns whose aging window has passed (agingDays from their source)
  // Use a safe default of 14 days for sourceless campaigns
  const agingCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const result = await prisma.campaign.updateMany({
    where: {
      brandId: { in: brandIds },
      status: 'ACTIVE',
      endDate: null, // endDate-based expiry is handled by aging.ts
      lastSeenAt: { lt: agingCutoff },
    },
    data: { status: 'EXPIRED' },
  });

  return {
    count: result.count,
    details: `${brandsWithActiveCampaigns.length} brands with no active sources`,
  };
}

/** Task 6: Detect and expire 404 campaigns (error page titles/images) */
async function expire404Campaigns(prisma: PrismaClient) {
  // Process in batches to avoid memory issues
  const batchSize = 5000;
  let offset = 0;
  let totalExpired = 0;
  const expireIds: string[] = [];

  while (true) {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, imageUrls: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (campaigns.length === 0) break;

    for (const c of campaigns) {
      // Check title patterns
      if (c.title && ERROR_TITLE_PATTERNS.some(p => p.test(c.title!))) {
        expireIds.push(c.id);
        continue;
      }

      // Check image URL patterns
      if (c.imageUrls && c.imageUrls.length > 0) {
        const hasErrorImage = c.imageUrls.some(
          url => ERROR_IMAGE_PATTERNS.some(p => p.test(url)),
        );
        if (hasErrorImage) {
          expireIds.push(c.id);
        }
      }
    }

    offset += batchSize;
    if (campaigns.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  // Batch update
  const result = await prisma.campaign.updateMany({
    where: { id: { in: expireIds } },
    data: { status: 'EXPIRED' },
  });

  totalExpired = result.count;
  return { count: totalExpired };
}

/** Task 7: Delete old crawl logs (30+ days) */
async function deleteOldCrawlLogs(prisma: PrismaClient) {
  const cutoff = new Date(Date.now() - OLD_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.crawlLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return { count: result.count };
}

/** Task 8: Expire WAF/bot detection campaigns ("Access Denied", "Cloudflare", etc.) */
async function expireWafCampaigns(prisma: PrismaClient) {
  const batchSize = 5000;
  let offset = 0;
  const expireIds: string[] = [];

  while (true) {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (campaigns.length === 0) break;

    for (const c of campaigns) {
      if (c.title && WAF_TITLE_PATTERNS.some(p => p.test(c.title))) {
        expireIds.push(c.id);
      }
    }

    offset += batchSize;
    if (campaigns.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  const result = await prisma.campaign.updateMany({
    where: { id: { in: expireIds } },
    data: { status: 'EXPIRED' },
  });

  return { count: result.count };
}

/** Task 9: Remove repeated image URLs (same URL in 10+ campaigns of same brand+market) */
async function cleanRepeatedImages(prisma: PrismaClient) {
  // Get all ACTIVE campaigns with images, grouped by brand+market
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE', imageUrls: { isEmpty: false } },
    select: { id: true, brandId: true, market: true, imageUrls: true },
  });

  // Count image URL occurrences per brand+market
  const urlCounts = new Map<string, Map<string, number>>();
  for (const c of campaigns) {
    const key = `${c.brandId}::${c.market}`;
    if (!urlCounts.has(key)) urlCounts.set(key, new Map());
    const brandMap = urlCounts.get(key)!;
    for (const url of c.imageUrls) {
      brandMap.set(url, (brandMap.get(url) || 0) + 1);
    }
  }

  // Find URLs that exceed threshold
  const repeatedUrls = new Map<string, Set<string>>(); // brand::market → Set of repeated URLs
  for (const [key, brandMap] of urlCounts) {
    for (const [url, count] of brandMap) {
      if (count >= REPEATED_IMAGE_THRESHOLD) {
        if (!repeatedUrls.has(key)) repeatedUrls.set(key, new Set());
        repeatedUrls.get(key)!.add(url);
      }
    }
  }

  if (repeatedUrls.size === 0) return { count: 0 };

  // Remove repeated URLs from campaigns
  let cleaned = 0;
  for (const c of campaigns) {
    const key = `${c.brandId}::${c.market}`;
    const badUrls = repeatedUrls.get(key);
    if (!badUrls) continue;

    const filtered = c.imageUrls.filter(url => !badUrls.has(url));
    if (filtered.length < c.imageUrls.length) {
      await prisma.campaign.update({
        where: { id: c.id },
        data: { imageUrls: filtered },
      });
      cleaned++;
    }
  }

  return {
    count: cleaned,
    details: `${repeatedUrls.size} brand(s) had repeated images`,
  };
}

/** Task 10: Remove invalid image URLs (localhost, data:image, transparent, null path) */
async function cleanInvalidImages(prisma: PrismaClient) {
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE', imageUrls: { isEmpty: false } },
    select: { id: true, imageUrls: true },
  });

  let cleaned = 0;
  for (const c of campaigns) {
    const filtered = c.imageUrls.filter(
      url => !INVALID_IMAGE_PATTERNS.some(p => p.test(url)),
    );
    if (filtered.length < c.imageUrls.length) {
      await prisma.campaign.update({
        where: { id: c.id },
        data: { imageUrls: filtered },
      });
      cleaned++;
    }
  }

  return { count: cleaned };
}

/** Task 11: Expire campaigns with garbage/garbled titles */
async function expireGarbageTitles(prisma: PrismaClient) {
  const batchSize = 5000;
  let offset = 0;
  const expireIds: string[] = [];

  const GARBAGE_PATTERNS = [
    /^\/[a-z0-9_/-]+$/i,                     // URL path as title: "/sale", "/cupom-quero10"
    /^#[a-z-]+::?(before|after)/i,           // CSS pseudo-element: "#category::before"
    /^\.css-[a-z0-9]+\{/i,                   // CSS class definition: ".css-zvlevn{overflow..."
    /\{overflow:\s*hidden/i,                  // CSS fragment
    /^(login|sign\s*in|sign\s*up)\s/i,       // Login page titles
  ];

  while (true) {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, brandId: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (campaigns.length === 0) break;

    for (const c of campaigns) {
      if (!c.title) continue;

      // Check garbage patterns
      if (GARBAGE_PATTERNS.some(p => p.test(c.title))) {
        expireIds.push(c.id);
        continue;
      }

      // Check repeated brand name: "idealoidealo"
      if (c.title.length >= 6) {
        const half = Math.floor(c.title.length / 2);
        const first = c.title.substring(0, half).toLowerCase();
        const second = c.title.substring(half).toLowerCase();
        if (first === second && first.length >= 3) {
          expireIds.push(c.id);
        }
      }
    }

    offset += batchSize;
    if (campaigns.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  const result = await prisma.campaign.updateMany({
    where: { id: { in: expireIds } },
    data: { status: 'EXPIRED' },
  });

  return { count: result.count };
}

/** Task 12: Expire campaigns with foreign locale URLs (e.g. /en-us/ in TR market) */
async function expireForeignLocaleCampaigns(prisma: PrismaClient) {
  // Market → allowed locale prefixes
  const MARKET_LOCALES: Record<string, string[]> = {
    TR: ['tr', 'tr-tr'],
    US: ['en', 'en-us'],
    DE: ['de', 'de-de', 'de-at', 'de-ch'],
    UK: ['en', 'en-gb'],
    IN: ['en', 'en-in', 'hi'],
    BR: ['pt', 'pt-br'],
    ID: ['id', 'id-id'],
    RU: ['ru', 'ru-ru'],
    MX: ['es', 'es-mx'],
    JP: ['ja', 'ja-jp'],
    PH: ['en', 'en-ph'],
    TH: ['th', 'th-th'],
    CA: ['en', 'en-ca', 'fr', 'fr-ca'],
    AU: ['en', 'en-au'],
    FR: ['fr', 'fr-fr'],
    IT: ['it', 'it-it'],
    ES: ['es', 'es-es'],
    EG: ['ar', 'en', 'ar-eg'],
    SA: ['ar', 'en', 'ar-sa'],
    KR: ['ko', 'ko-kr'],
    AR: ['es', 'es-ar'],
    AE: ['ar', 'en', 'ar-ae'],
    VN: ['vi', 'vi-vn'],
    PL: ['pl', 'pl-pl'],
    MY: ['ms', 'en', 'ms-my'],
    CO: ['es', 'es-co'],
    ZA: ['en', 'en-za'],
    PT: ['pt', 'pt-pt'],
    NL: ['nl', 'nl-nl'],
    PK: ['en', 'ur', 'en-pk'],
    SE: ['sv', 'sv-se'],
  };

  const localeUrlPattern = /\/([a-z]{2}(?:-[a-z]{2})?)(?:\/|$)/i;

  const batchSize = 5000;
  let offset = 0;
  const expireIds: string[] = [];

  while (true) {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, canonicalUrl: true, sourceUrl: true, market: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (campaigns.length === 0) break;

    for (const c of campaigns) {
      const url = c.canonicalUrl || c.sourceUrl;
      if (!url) continue;

      const allowedLocales = MARKET_LOCALES[c.market];
      if (!allowedLocales) continue;

      // Extract locale from URL path (e.g., /en-us/deals → en-us)
      try {
        const pathname = new URL(url).pathname;
        const match = pathname.match(localeUrlPattern);
        if (match) {
          const urlLocale = match[1].toLowerCase();
          // Only check if it looks like a locale (not a short path segment like /p/ or /s/)
          if (urlLocale.length >= 2 && urlLocale.includes('-')) {
            if (!allowedLocales.includes(urlLocale)) {
              expireIds.push(c.id);
            }
          }
        }
      } catch {
        // Invalid URL, skip
      }
    }

    offset += batchSize;
    if (campaigns.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  const result = await prisma.campaign.updateMany({
    where: { id: { in: expireIds } },
    data: { status: 'EXPIRED' },
  });

  return { count: result.count };
}

/** Task 13: Clean up stale RUNNING crawl logs (10+ minutes old) */
async function cleanupStaleLogs(prisma: PrismaClient) {
  const threshold = new Date(Date.now() - STALE_LOG_THRESHOLD_MS);

  const result = await prisma.crawlLog.updateMany({
    where: {
      status: CrawlStatus.RUNNING,
      createdAt: { lt: threshold },
    },
    data: {
      status: CrawlStatus.FAILED,
      errorMessage: 'Stale: cleaned by daily maintenance',
    },
  });

  return { count: result.count };
}

/** Task 14: Log brands exceeding 50 active campaign limit (monitoring only) */
async function checkCampaignLimits(prisma: PrismaClient) {
  const result = await prisma.campaign.groupBy({
    by: ['brandId', 'market'],
    where: { status: 'ACTIVE' },
    _count: true,
    having: { brandId: { _count: { gt: 45 } } },
  });

  if (result.length === 0) return { count: 0 };

  // Get brand names for logging
  const brandIds = result.map(r => r.brandId);
  const brands = await prisma.brand.findMany({
    where: { id: { in: brandIds } },
    select: { id: true, name: true, market: true },
  });
  const brandMap = new Map(brands.map(b => [b.id, b]));

  const details = result
    .sort((a, b) => b._count - a._count)
    .slice(0, 10)
    .map(r => {
      const brand = brandMap.get(r.brandId);
      return `${brand?.name || '?'} (${r.market}): ${r._count}`;
    })
    .join(', ');

  console.log(`[Maintenance] Near-limit brands: ${details}`);

  return { count: result.length, details };
}

/** Task 15: Health report summary */
async function generateHealthReport(prisma: PrismaClient) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalBrands,
    totalActiveSources,
    totalInactiveSources,
    totalActiveCampaigns,
    recentLogs,
    recentSuccess,
    recentFailed,
  ] = await Promise.all([
    prisma.brand.count(),
    prisma.crawlSource.count({ where: { isActive: true } }),
    prisma.crawlSource.count({ where: { isActive: false } }),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.crawlLog.count({ where: { createdAt: { gt: sevenDaysAgo } } }),
    prisma.crawlLog.count({ where: { createdAt: { gt: sevenDaysAgo }, status: 'SUCCESS' } }),
    prisma.crawlLog.count({ where: { createdAt: { gt: sevenDaysAgo }, status: 'FAILED' } }),
  ]);

  const successRate = recentLogs > 0 ? Math.round((recentSuccess * 100) / recentLogs) : 0;

  const summary = [
    `Brands: ${totalBrands}`,
    `Sources: ${totalActiveSources} active / ${totalInactiveSources} inactive`,
    `Campaigns: ${totalActiveCampaigns} active`,
    `7d crawl: ${recentLogs} total, ${successRate}% success, ${recentFailed} failed`,
  ].join(' | ');

  console.log(`[Maintenance] Health: ${summary}`);

  return { count: 0, details: summary };
}

/** Task 16: Detect and cleanup fake/invalid promo codes (prices, CSS artifacts, SKUs) */
async function cleanupFakePromoCodes(prisma: PrismaClient) {
  const PRICE_RE = [
    /[€$₺£¥₹₽₩฿]/,
    /^\d+[.,]\d{2}$/,
    /^\d{1,3}([.,]\d{3})+/,
    /^(R\$|RP|RM|RS\.?|KR|SAR|AED)\s?\d/i,
    /^(FROM|DESDE|AB)\s/i,
    /^A\s+PARTIR/i,
  ];
  const CSS_RE = [
    /^(QUICK[-_]?FILTER|PRODUCT[-_]?LIST|PRICE[-_]?(ASC|DESC)|SILENT\d+LOADING|INFO[-_]?BLOCK|TEXT[-_]?BLOCK)/i,
    /[-_](FILTER|ORDER|BLOCK|SORT|LOADING)$/i,
  ];
  const JUNK_WORDS = new Set([
    'PRICE', 'SIZE', 'MULTIPLE', 'ALL', 'CATALOG', 'MANUFACTURER', 'FILTER',
    'SORT', 'ORDER', 'VIEW', 'LIST', 'GRID', 'LOAD', 'LOADING', 'SEARCH',
    'PROMOCODE', 'PROMOCIONAL', 'KOPIERT', 'REBAJAS', 'UNTUK', 'DISKON',
    'WIOSNA', 'RABAT', 'EMAIL', 'PREMIUM', 'SAMSUNG', 'SONY',
  ]);

  function isFake(code: string): boolean {
    const c = code.trim().toUpperCase();
    if (PRICE_RE.some(p => p.test(c))) return true;
    if (/^\d+([.,]\d+)*$/.test(c)) return true;
    if (/^\d{4,},\d{4,}/.test(c)) return true;
    if (CSS_RE.some(p => p.test(c))) return true;
    if (JUNK_WORDS.has(c)) return true;
    if (/^[A-Z]{2,}\d{4,}/.test(c) && !/[AEIOU]/.test(c.replace(/\d/g, ''))) return true;
    // Long random strings (12+ chars, consonant/vowel ratio > 4:1)
    if (c.length >= 12) {
      const letters = c.replace(/[^A-Z]/g, '');
      const consonants = letters.replace(/[AEIOU]/g, '').length;
      const vowels = letters.length - consonants;
      if (letters.length >= 4 && (vowels === 0 || consonants / vowels > 4)) return true;
    }
    return false;
  }

  const campaigns = await prisma.campaign.findMany({ where: { status: 'ACTIVE', promoCode: { not: null } }, select: { id: true, promoCode: true } });
  const fakes = campaigns.filter(c => c.promoCode && isFake(c.promoCode));
  if (fakes.length === 0) return { count: 0 };
  for (const c of fakes) {
    await prisma.campaign.update({ where: { id: c.id }, data: { promoCode: null } });
  }
  return { count: fakes.length, details: fakes.length + ' fake promo codes removed' };
}
// ─── Main Entry Point ───────────────────────────────────

export async function runDailyMaintenance(prisma: PrismaClient): Promise<MaintenanceReport> {
  console.log('[Maintenance] Starting daily maintenance...');

  // Safety: check if any crawl is still running — wait up to 15 min
  const maxWaitMs = 15 * 60 * 1000;
  const waitStart = Date.now();
  while (Date.now() - waitStart < maxWaitMs) {
    const runningCount = await prisma.crawlLog.count({
      where: { status: CrawlStatus.RUNNING },
    });
    if (runningCount === 0) break;
    console.log(`[Maintenance] Waiting for ${runningCount} running crawl(s) to finish...`);
    await new Promise(resolve => setTimeout(resolve, 30_000)); // 30s poll
  }

  // If still running after 15 min, proceed anyway (stale log cleanup will handle them)
  const stillRunning = await prisma.crawlLog.count({
    where: { status: CrawlStatus.RUNNING },
  });
  if (stillRunning > 0) {
    console.warn(`[Maintenance] Proceeding with ${stillRunning} crawl(s) still running (possibly stale)`);
  }

  const report: MaintenanceReport = {
    timestamp: new Date(),
    tasks: [],
    summary: {
      amazonDeactivated: 0,
      brandsCleaned: 0,
      brandsMerged: 0,
      sourcesDeactivated: 0,
      orphanCampaignsExpired: 0,
      notFoundCampaignsExpired: 0,
      oldLogsDeleted: 0,
      wafCampaignsExpired: 0,
      repeatedImagesCleaned: 0,
      invalidImagesCleaned: 0,
      garbageTitlesExpired: 0,
      foreignLocaleExpired: 0,
      staleLogsCleaned: 0,
      nearLimitBrands: 0,
      fakePromoCodesCleaned: 0,
    },
  };

  // Task 1: Amazon source deactivation
  const t1 = await runTask('Amazon Deactivation', () => deactivateAmazonSources(prisma));
  report.tasks.push(t1);
  report.summary.amazonDeactivated = t1.count;

  // Task 2: Brand name suffix cleanup
  const t2 = await runTask('Brand Name Cleanup', () => cleanBrandNames(prisma));
  report.tasks.push(t2);
  report.summary.brandsCleaned = t2.count;

  // Task 3: Duplicate brand merge (depends on Task 2)
  const t3 = await runTask('Duplicate Brand Merge', () => mergeDuplicateBrands(prisma));
  report.tasks.push(t3);
  report.summary.brandsMerged = t3.count;

  // Task 4: Dead source deactivation (14d fatal fail)
  const t4 = await runTask('Dead Source Deactivation', () => deactivateDeadSources(prisma));
  report.tasks.push(t4);
  report.summary.sourcesDeactivated = t4.count;

  // Task 5: Orphan campaign expiry
  const t5 = await runTask('Orphan Campaign Expiry', () => expireOrphanCampaigns(prisma));
  report.tasks.push(t5);
  report.summary.orphanCampaignsExpired = t5.count;

  // Task 6: 404 campaign detection
  const t6 = await runTask('404 Campaign Detection', () => expire404Campaigns(prisma));
  report.tasks.push(t6);
  report.summary.notFoundCampaignsExpired = t6.count;

  // Task 7: Old crawl log cleanup (30+ days)
  const t7 = await runTask('Old Log Cleanup', () => deleteOldCrawlLogs(prisma));
  report.tasks.push(t7);
  report.summary.oldLogsDeleted = t7.count;

  // Task 8: WAF/bot campaign expiry
  const t8 = await runTask('WAF/Bot Campaign Cleanup', () => expireWafCampaigns(prisma));
  report.tasks.push(t8);
  report.summary.wafCampaignsExpired = t8.count;

  // Task 9: Repeated image URL cleanup (brand+market scoped)
  const t9 = await runTask('Repeated Image Cleanup', () => cleanRepeatedImages(prisma));
  report.tasks.push(t9);
  report.summary.repeatedImagesCleaned = t9.count;

  // Task 10: Invalid image URL cleanup
  const t10 = await runTask('Invalid Image Cleanup', () => cleanInvalidImages(prisma));
  report.tasks.push(t10);
  report.summary.invalidImagesCleaned = t10.count;

  // Task 11: Garbage/garbled title expiry
  const t11 = await runTask('Garbage Title Cleanup', () => expireGarbageTitles(prisma));
  report.tasks.push(t11);
  report.summary.garbageTitlesExpired = t11.count;

  // Task 12: Foreign locale campaign expiry
  const t12 = await runTask('Foreign Locale Cleanup', () => expireForeignLocaleCampaigns(prisma));
  report.tasks.push(t12);
  report.summary.foreignLocaleExpired = t12.count;

  // Task 13: Stale RUNNING log cleanup
  const t13 = await runTask('Stale Log Cleanup', () => cleanupStaleLogs(prisma));
  report.tasks.push(t13);
  report.summary.staleLogsCleaned = t13.count;

  // Task 14: Campaign limit monitoring
  const t14 = await runTask('Campaign Limit Check', () => checkCampaignLimits(prisma));
  report.tasks.push(t14);
  report.summary.nearLimitBrands = t14.count;

  // Task 15: Health report
  const t15 = await runTask('Health Report', () => generateHealthReport(prisma));
  report.tasks.push(t15);

  // Print summary
  const active = report.tasks.filter(t => t.status === 'OK');
  const errors = report.tasks.filter(t => t.status === 'ERROR');
  const totalDuration = report.tasks.reduce((sum, t) => sum + t.duration, 0);

  console.log(`[Maintenance] Complete in ${(totalDuration / 1000).toFixed(1)}s:`);
  for (const t of report.tasks) {
    const icon = t.status === 'OK' ? '✓' : t.status === 'SKIPPED' ? '·' : '✗';
    const countStr = t.count > 0 ? ` (${t.count})` : '';
    const detailStr = t.details ? ` — ${t.details}` : '';
    console.log(`  ${icon} ${t.name}${countStr}${detailStr} [${t.duration}ms]`);
  }

  if (errors.length > 0) {
    console.error(`[Maintenance] ${errors.length} task(s) failed!`);
  }

  return report;
}

// ─── Daily Report Persistence ──────────────────────────

interface MarketStat {
  market: string;
  sources: number;
  success: number;
  failed: number;
  found: number;
  new: number;
  updated: number;
}

/**
 * Aggregate today's crawl logs + maintenance results into a single DailyReport row.
 * Called after runDailyMaintenance() in the scheduler.
 */
export async function saveDailyReport(prisma: PrismaClient, maintenanceReport?: MaintenanceReport) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Fetch today's crawl logs with market info
  const logs = await prisma.crawlLog.findMany({
    where: { createdAt: { gte: today, lt: dayEnd } },
    include: { source: { select: { market: true } } },
  });

  // Group by market
  const marketMap = new Map<string, MarketStat>();
  for (const log of logs) {
    const m = log.source.market;
    const stat = marketMap.get(m) || { market: m, sources: 0, success: 0, failed: 0, found: 0, new: 0, updated: 0 };
    stat.sources++;
    if (log.status === 'SUCCESS' || log.status === 'PARTIAL') stat.success++;
    if (log.status === 'FAILED') stat.failed++;
    stat.found += log.campaignsFound;
    stat.new += log.campaignsNew;
    stat.updated += log.campaignsUpdated;
    marketMap.set(m, stat);
  }
  const marketStats = Array.from(marketMap.values()).sort((a, b) => b.new - a.new);

  // Count campaigns expired today
  const campaignsExpired = await prisma.campaign.count({
    where: { status: 'EXPIRED', updatedAt: { gte: today, lt: dayEnd } },
  });

  // Totals
  const totalSources = logs.length;
  const sourcesSuccess = logs.filter(l => l.status === 'SUCCESS' || l.status === 'PARTIAL').length;
  const sourcesFailed = logs.filter(l => l.status === 'FAILED').length;
  const campaignsFound = logs.reduce((s, l) => s + l.campaignsFound, 0);
  const campaignsNew = logs.reduce((s, l) => s + l.campaignsNew, 0);
  const campaignsUpdated = logs.reduce((s, l) => s + l.campaignsUpdated, 0);
  const crawlDurationMs = logs.reduce((s, l) => s + (l.durationMs || 0), 0);

  // Maintenance
  const maintenanceActions = maintenanceReport
    ? maintenanceReport.tasks.reduce((s, t) => s + t.count, 0)
    : 0;
  const maintenanceErrors = maintenanceReport
    ? maintenanceReport.tasks.filter(t => t.status === 'ERROR').length
    : 0;
  const maintenanceTasks = maintenanceReport?.tasks || [];

  // Upsert — same day re-run updates instead of duplicating
  await prisma.dailyReport.upsert({
    where: { date: today },
    create: {
      date: today, totalSources, sourcesSuccess, sourcesFailed,
      campaignsFound, campaignsNew, campaignsUpdated, campaignsExpired,
      crawlDurationMs, maintenanceActions, maintenanceErrors,
      marketStats: marketStats as any, maintenanceTasks: maintenanceTasks as any,
    },
    update: {
      totalSources, sourcesSuccess, sourcesFailed,
      campaignsFound, campaignsNew, campaignsUpdated, campaignsExpired,
      crawlDurationMs, maintenanceActions, maintenanceErrors,
      marketStats: marketStats as any, maintenanceTasks: maintenanceTasks as any,
    },
  });

  console.log(`[Maintenance] Daily report saved: ${totalSources} sources, ${campaignsNew} new, ${marketStats.length} markets`);
}
