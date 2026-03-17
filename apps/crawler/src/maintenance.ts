/**
 * Daily Maintenance Module — Runs at 09:00 UTC via scheduler
 *
 * Automated tasks:
 * 1. White-collar job cleanup (expire non-blue-collar listings)
 * 2. Expired deadline cleanup (deadline < now)
 * 3. Salary data validation (impossible salary values)
 * 4. Stale company deactivation (no active jobs 30+ days, no active sources)
 * 5. Company name suffix cleanup (country codes/names)
 * 6. Duplicate company merging
 * 7. Dead source detection (14+ days fatal fail)
 * 8. Orphan job listing expiration (deactivated source listings)
 * 9. 404 job listing detection (error page titles/images)
 * 10. Old crawl log cleanup (30+ days)
 * 11. WAF/bot expire
 * 12. Repeated image cleanup
 * 13. Invalid image cleanup
 * 14. Garbage title expire
 * 15. Foreign locale expire
 * 16. Stale log cleanup
 * 17. Job listing limit monitoring
 * 18. Health report
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
    whiteCollarExpired: number;
    deadlineExpired: number;
    invalidSalariesFixed: number;
    staleCompaniesDeactivated: number;
    brandsCleaned: number;
    brandsMerged: number;
    sourcesDeactivated: number;
    orphanListingsExpired: number;
    notFoundListingsExpired: number;
    oldLogsDeleted: number;
    wafListingsExpired: number;
    repeatedImagesCleaned: number;
    invalidImagesCleaned: number;
    garbageTitlesExpired: number;
    foreignLocaleExpired: number;
    staleLogsCleaned: number;
    nearLimitBrands: number;
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

/** Task 1: Expire white-collar job listings (non-blue-collar positions) */
async function expireWhiteCollarJobs(prisma: PrismaClient) {
  const WHITE_COLLAR_PATTERN = /\b(ceo|cto|cfo|coo|vice president|vp|director|software engineer|software developer|data scientist|consultant|analyst|lawyer|architect|professor)\b/i;

  const batchSize = 5000;
  let offset = 0;
  const expireIds: string[] = [];

  while (true) {
    const jobs = await prisma.jobListing.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (jobs.length === 0) break;

    for (const job of jobs) {
      if (job.title && WHITE_COLLAR_PATTERN.test(job.title)) {
        expireIds.push(job.id);
      }
    }

    offset += batchSize;
    if (jobs.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  const result = await prisma.jobListing.updateMany({
    where: { id: { in: expireIds } },
    data: { status: 'EXPIRED' },
  });

  return { count: result.count };
}

/** Task 2: Expire job listings with passed deadlines */
async function expirePassedDeadlines(prisma: PrismaClient) {
  const now = new Date();

  const result = await prisma.jobListing.updateMany({
    where: {
      status: 'ACTIVE',
      deadline: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });

  return { count: result.count };
}

/** Task 3: Fix impossible salary values (monthly salary < 1 or > 10,000,000) */
async function fixInvalidSalaries(prisma: PrismaClient) {
  let fixed = 0;

  // Fix salaryMin
  const minResult = await prisma.jobListing.updateMany({
    where: {
      OR: [
        { salaryMin: { lt: 1 } },
        { salaryMin: { gt: 10_000_000 } },
      ],
      salaryMin: { not: null },
    },
    data: { salaryMin: null },
  });
  fixed += minResult.count;

  // Fix salaryMax
  const maxResult = await prisma.jobListing.updateMany({
    where: {
      OR: [
        { salaryMax: { lt: 1 } },
        { salaryMax: { gt: 10_000_000 } },
      ],
      salaryMax: { not: null },
    },
    data: { salaryMax: null },
  });
  fixed += maxResult.count;

  return { count: fixed };
}

/** Task 4: Deactivate stale companies (no active jobs 30+ days, no active sources) */
async function deactivateStaleCompanies(prisma: PrismaClient) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Find active companies with no active sources AND no recent active job listings
  const staleCompanies = await prisma.company.findMany({
    where: {
      isActive: true,
      sources: { none: { isActive: true } },
      jobListings: { none: { status: 'ACTIVE' } },
    },
    select: {
      id: true,
      name: true,
      market: true,
      jobListings: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
        select: { updatedAt: true },
      },
    },
  });

  // Filter to only those whose most recent job listing update is 30+ days ago
  const toDeactivate = staleCompanies.filter(c => {
    if (c.jobListings.length === 0) return true; // No job listings at all
    return c.jobListings[0].updatedAt < thirtyDaysAgo;
  });

  if (toDeactivate.length === 0) return { count: 0 };

  await prisma.company.updateMany({
    where: { id: { in: toDeactivate.map(c => c.id) } },
    data: { isActive: false },
  });

  const markets = [...new Set(toDeactivate.map(c => c.market))].join(', ');
  return {
    count: toDeactivate.length,
    details: `Markets: ${markets}`,
  };
}

/** Task 5: Clean company names — remove country suffixes */
async function cleanBrandNames(prisma: PrismaClient) {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true, market: true },
    orderBy: [{ market: 'asc' }, { name: 'asc' }],
  });

  let cleaned = 0;
  let skipped = 0;

  for (const b of companies) {
    const cleanName = getCleanBrandName(b.name);
    if (!cleanName) continue;

    // Check for duplicate — skip if clean name already exists in same market
    const existing = await prisma.company.findFirst({
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

    await prisma.company.update({
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
  const allBrands = await prisma.company.findMany({
    select: { id: true, name: true, market: true, slug: true },
    orderBy: [{ market: 'asc' }, { name: 'asc' }],
  });

  // Build lookup: market::name_lower → company
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
          source: { companyId: { in: [source.id, target.id] } },
        },
      });
      if (runningLogs > 0) {
        console.log(`[Maintenance] Skipping merge "${source.name}" — active crawl detected`);
        continue;
      }

      // 1. Transfer crawl sources
      const sourceSources = await prisma.crawlSource.findMany({
        where: { companyId: source.id },
        select: { id: true, seedUrls: true },
      });

      const targetSources = await prisma.crawlSource.findMany({
        where: { companyId: target.id },
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
          data: { companyId: target.id },
        });
        // Delete remaining sources
        for (let i = 1; i < sourceSources.length; i++) {
          await prisma.jobListing.updateMany({
            where: { sourceId: sourceSources[i].id },
            data: { sourceId: sourceSources[0].id },
          });
          await prisma.crawlLog.deleteMany({ where: { sourceId: sourceSources[i].id } });
          await prisma.crawlSource.delete({ where: { id: sourceSources[i].id } });
        }
        // Delete remaining relations and source company
        await prisma.jobListing.deleteMany({ where: { companyId: source.id } });
        try { await prisma.followedCompany.deleteMany({ where: { companyId: source.id } }); } catch {}
        await prisma.company.delete({ where: { id: source.id } });
        merged++;
        continue;
      }

      // 2. Handle job listing conflicts (same canonicalUrl in both companies)
      const targetJobs = await prisma.jobListing.findMany({
        where: { companyId: target.id },
        select: { canonicalUrl: true },
      });
      const targetUrls = new Set(
        targetJobs.map(c => c.canonicalUrl).filter(Boolean),
      );

      if (targetUrls.size > 0) {
        const sourceJobs = await prisma.jobListing.findMany({
          where: { companyId: source.id },
          select: { id: true, canonicalUrl: true },
        });
        const conflictIds = sourceJobs
          .filter(c => c.canonicalUrl && targetUrls.has(c.canonicalUrl))
          .map(c => c.id);
        if (conflictIds.length > 0) {
          await prisma.jobListing.deleteMany({ where: { id: { in: conflictIds } } });
        }
      }

      // Move remaining job listings
      await prisma.jobListing.updateMany({
        where: { companyId: source.id },
        data: { companyId: target.id },
      });

      // 3. Delete source company's crawl sources
      for (const ss of sourceSources) {
        await prisma.jobListing.updateMany({
          where: { sourceId: ss.id },
          data: { sourceId: targetSources.length > 0 ? targetSources[0].id : undefined },
        });
        await prisma.crawlLog.deleteMany({ where: { sourceId: ss.id } });
        await prisma.crawlSource.delete({ where: { id: ss.id } });
      }

      // 4. Delete follows and source company
      try { await prisma.followedCompany.deleteMany({ where: { companyId: source.id } }); } catch {}
      await prisma.company.delete({ where: { id: source.id } });
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
      companyId: true,
      company: { select: { name: true, market: true } },
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

/** Task 5: Expire orphan job listings (listings of deactivated sources with no active source left) */
async function expireOrphanListings(prisma: PrismaClient) {
  // Find companies that have ACTIVE job listings but no active sources
  const companiesWithActiveJobs = await prisma.company.findMany({
    where: {
      jobListings: { some: { status: 'ACTIVE' } },
      sources: { none: { isActive: true } },
    },
    select: { id: true, name: true, market: true },
  });

  if (companiesWithActiveJobs.length === 0) return { count: 0 };

  const companyIds = companiesWithActiveJobs.map(b => b.id);

  // Only expire job listings whose aging window has passed (agingDays from their source)
  // Use a safe default of 30 days for sourceless job listings (iş ilanları kampanyalardan daha uzun yaşar)
  const agingCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await prisma.jobListing.updateMany({
    where: {
      companyId: { in: companyIds },
      status: 'ACTIVE',
      deadline: null, // deadline-based expiry is handled by aging.ts
      lastSeenAt: { lt: agingCutoff },
    },
    data: { status: 'EXPIRED' },
  });

  return {
    count: result.count,
    details: `${companiesWithActiveJobs.length} companies with no active sources`,
  };
}

/** Task 6: Detect and expire 404 job listings (error page titles/images) */
async function expire404Listings(prisma: PrismaClient) {
  // Process in batches to avoid memory issues
  const batchSize = 5000;
  let offset = 0;
  let totalExpired = 0;
  const expireIds: string[] = [];

  while (true) {
    const listings = await prisma.jobListing.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, imageUrl: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (listings.length === 0) break;

    for (const c of listings) {
      // Check title patterns
      if (c.title && ERROR_TITLE_PATTERNS.some(p => p.test(c.title!))) {
        expireIds.push(c.id);
        continue;
      }

      // Check image URL patterns
      if (c.imageUrl) {
        const hasErrorImage = ERROR_IMAGE_PATTERNS.some(p => p.test(c.imageUrl!));
        if (hasErrorImage) {
          expireIds.push(c.id);
        }
      }
    }

    offset += batchSize;
    if (listings.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  // Batch update
  const result = await prisma.jobListing.updateMany({
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

/** Task 8: Expire WAF/bot detection job listings ("Access Denied", "Cloudflare", etc.) */
async function expireWafListings(prisma: PrismaClient) {
  const batchSize = 5000;
  let offset = 0;
  const expireIds: string[] = [];

  while (true) {
    const listings = await prisma.jobListing.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (listings.length === 0) break;

    for (const c of listings) {
      if (c.title && WAF_TITLE_PATTERNS.some(p => p.test(c.title))) {
        expireIds.push(c.id);
      }
    }

    offset += batchSize;
    if (listings.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  const result = await prisma.jobListing.updateMany({
    where: { id: { in: expireIds } },
    data: { status: 'EXPIRED' },
  });

  return { count: result.count };
}

/** Task 9: Remove repeated image URLs (same URL in 10+ job listings of same company+country) */
async function cleanRepeatedImages(prisma: PrismaClient) {
  // Get all ACTIVE job listings with images, grouped by company+country
  const jobs = await prisma.jobListing.findMany({
    where: { status: 'ACTIVE', imageUrl: { not: null } },
    select: { id: true, companyId: true, country: true, imageUrl: true },
  });

  // Count image URL occurrences per company+country
  const urlCounts = new Map<string, Map<string, number>>();
  for (const c of jobs) {
    if (!c.imageUrl) continue;
    const key = `${c.companyId}::${c.country}`;
    if (!urlCounts.has(key)) urlCounts.set(key, new Map());
    const companyMap = urlCounts.get(key)!;
    companyMap.set(c.imageUrl, (companyMap.get(c.imageUrl) || 0) + 1);
  }

  // Find URLs that exceed threshold
  const repeatedUrls = new Map<string, Set<string>>(); // company::country → Set of repeated URLs
  for (const [key, companyMap] of urlCounts) {
    for (const [url, count] of companyMap) {
      if (count >= REPEATED_IMAGE_THRESHOLD) {
        if (!repeatedUrls.has(key)) repeatedUrls.set(key, new Set());
        repeatedUrls.get(key)!.add(url);
      }
    }
  }

  if (repeatedUrls.size === 0) return { count: 0 };

  // Clear repeated image URLs from job listings
  let cleaned = 0;
  for (const c of jobs) {
    if (!c.imageUrl) continue;
    const key = `${c.companyId}::${c.country}`;
    const badUrls = repeatedUrls.get(key);
    if (!badUrls || !badUrls.has(c.imageUrl)) continue;

    await prisma.jobListing.update({
      where: { id: c.id },
      data: { imageUrl: null },
    });
    cleaned++;
  }

  return {
    count: cleaned,
    details: `${repeatedUrls.size} company(s) had repeated images`,
  };
}

/** Task 10: Remove invalid image URLs (localhost, data:image, transparent, null path) */
async function cleanInvalidImages(prisma: PrismaClient) {
  const jobs = await prisma.jobListing.findMany({
    where: { status: 'ACTIVE', imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });

  let cleaned = 0;
  for (const c of jobs) {
    if (!c.imageUrl) continue;
    if (INVALID_IMAGE_PATTERNS.some(p => p.test(c.imageUrl!))) {
      await prisma.jobListing.update({
        where: { id: c.id },
        data: { imageUrl: null },
      });
      cleaned++;
    }
  }

  return { count: cleaned };
}

/** Task 11: Expire job listings with garbage/garbled titles */
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
    const listings = await prisma.jobListing.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, companyId: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (listings.length === 0) break;

    for (const c of listings) {
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
    if (listings.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  const result = await prisma.jobListing.updateMany({
    where: { id: { in: expireIds } },
    data: { status: 'EXPIRED' },
  });

  return { count: result.count };
}

/** Task 12: Expire job listings with foreign locale URLs (e.g. /en-us/ in TR market) */
async function expireForeignLocaleListings(prisma: PrismaClient) {
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
    const listings = await prisma.jobListing.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, canonicalUrl: true, sourceUrl: true, country: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (listings.length === 0) break;

    for (const c of listings) {
      const url = c.canonicalUrl || c.sourceUrl;
      if (!url) continue;

      const allowedLocales = MARKET_LOCALES[c.country];
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
    if (listings.length < batchSize) break;
  }

  if (expireIds.length === 0) return { count: 0 };

  const result = await prisma.jobListing.updateMany({
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

/** Task 14: Log companies exceeding 50 active job listing limit (monitoring only) */
async function checkListingLimits(prisma: PrismaClient) {
  const result = await prisma.jobListing.groupBy({
    by: ['companyId', 'country'],
    where: { status: 'ACTIVE' },
    _count: true,
    having: { companyId: { _count: { gt: 45 } } },
  });

  if (result.length === 0) return { count: 0 };

  // Get company names for logging
  const companyIds = result.map(r => r.companyId);
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true, market: true },
  });
  const companyMap = new Map(companies.map(b => [b.id, b]));

  const details = result
    .sort((a, b) => b._count - a._count)
    .slice(0, 10)
    .map(r => {
      const company = companyMap.get(r.companyId);
      return `${company?.name || '?'} (${r.country}): ${r._count}`;
    })
    .join(', ');

  console.log(`[Maintenance] Near-limit companies: ${details}`);

  return { count: result.length, details };
}

/** Task 15: Health report summary */
async function generateHealthReport(prisma: PrismaClient) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalBrands,
    totalActiveSources,
    totalInactiveSources,
    totalActiveListings,
    recentLogs,
    recentSuccess,
    recentFailed,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.crawlSource.count({ where: { isActive: true } }),
    prisma.crawlSource.count({ where: { isActive: false } }),
    prisma.jobListing.count({ where: { status: 'ACTIVE' } }),
    prisma.crawlLog.count({ where: { createdAt: { gt: sevenDaysAgo } } }),
    prisma.crawlLog.count({ where: { createdAt: { gt: sevenDaysAgo }, status: 'SUCCESS' } }),
    prisma.crawlLog.count({ where: { createdAt: { gt: sevenDaysAgo }, status: 'FAILED' } }),
  ]);

  const successRate = recentLogs > 0 ? Math.round((recentSuccess * 100) / recentLogs) : 0;

  const summary = [
    `Companies: ${totalBrands}`,
    `Sources: ${totalActiveSources} active / ${totalInactiveSources} inactive`,
    `Jobs: ${totalActiveListings} active`,
    `7d crawl: ${recentLogs} total, ${successRate}% success, ${recentFailed} failed`,
  ].join(' | ');

  console.log(`[Maintenance] Health: ${summary}`);

  return { count: 0, details: summary };
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
      whiteCollarExpired: 0,
      deadlineExpired: 0,
      invalidSalariesFixed: 0,
      staleCompaniesDeactivated: 0,
      brandsCleaned: 0,
      brandsMerged: 0,
      sourcesDeactivated: 0,
      orphanListingsExpired: 0,
      notFoundListingsExpired: 0,
      oldLogsDeleted: 0,
      wafListingsExpired: 0,
      repeatedImagesCleaned: 0,
      invalidImagesCleaned: 0,
      garbageTitlesExpired: 0,
      foreignLocaleExpired: 0,
      staleLogsCleaned: 0,
      nearLimitBrands: 0,
    },
  };

  // Task 1: White-collar job cleanup
  const t1 = await runTask('White-Collar Job Cleanup', () => expireWhiteCollarJobs(prisma));
  report.tasks.push(t1);
  report.summary.whiteCollarExpired = t1.count;

  // Task 2: Expired deadline cleanup
  const t2 = await runTask('Deadline Expiry', () => expirePassedDeadlines(prisma));
  report.tasks.push(t2);
  report.summary.deadlineExpired = t2.count;

  // Task 3: Salary data validation
  const t3 = await runTask('Salary Validation', () => fixInvalidSalaries(prisma));
  report.tasks.push(t3);
  report.summary.invalidSalariesFixed = t3.count;

  // Task 4: Stale company deactivation
  const t4 = await runTask('Stale Company Deactivation', () => deactivateStaleCompanies(prisma));
  report.tasks.push(t4);
  report.summary.staleCompaniesDeactivated = t4.count;

  // Task 5: Company name suffix cleanup
  const t5 = await runTask('Company Name Cleanup', () => cleanBrandNames(prisma));
  report.tasks.push(t5);
  report.summary.brandsCleaned = t5.count;

  // Task 6: Duplicate company merge (depends on Task 5)
  const t6 = await runTask('Duplicate Company Merge', () => mergeDuplicateBrands(prisma));
  report.tasks.push(t6);
  report.summary.brandsMerged = t6.count;

  // Task 7: Dead source deactivation (14d fatal fail)
  const t7 = await runTask('Dead Source Deactivation', () => deactivateDeadSources(prisma));
  report.tasks.push(t7);
  report.summary.sourcesDeactivated = t7.count;

  // Task 8: Orphan job listing expiry
  const t8 = await runTask('Orphan Job Listing Expiry', () => expireOrphanListings(prisma));
  report.tasks.push(t8);
  report.summary.orphanListingsExpired = t8.count;

  // Task 9: 404 job listing detection
  const t9 = await runTask('404 Job Listing Detection', () => expire404Listings(prisma));
  report.tasks.push(t9);
  report.summary.notFoundListingsExpired = t9.count;

  // Task 10: Old crawl log cleanup (30+ days)
  const t10 = await runTask('Old Log Cleanup', () => deleteOldCrawlLogs(prisma));
  report.tasks.push(t10);
  report.summary.oldLogsDeleted = t10.count;

  // Task 11: WAF/bot job listing expiry
  const t11 = await runTask('WAF/Bot Job Cleanup', () => expireWafListings(prisma));
  report.tasks.push(t11);
  report.summary.wafListingsExpired = t11.count;

  // Task 12: Repeated image URL cleanup (company+country scoped)
  const t12 = await runTask('Repeated Image Cleanup', () => cleanRepeatedImages(prisma));
  report.tasks.push(t12);
  report.summary.repeatedImagesCleaned = t12.count;

  // Task 13: Invalid image URL cleanup
  const t13 = await runTask('Invalid Image Cleanup', () => cleanInvalidImages(prisma));
  report.tasks.push(t13);
  report.summary.invalidImagesCleaned = t13.count;

  // Task 14: Garbage/garbled title expiry
  const t14 = await runTask('Garbage Title Cleanup', () => expireGarbageTitles(prisma));
  report.tasks.push(t14);
  report.summary.garbageTitlesExpired = t14.count;

  // Task 15: Foreign locale job listing expiry
  const t15 = await runTask('Foreign Locale Cleanup', () => expireForeignLocaleListings(prisma));
  report.tasks.push(t15);
  report.summary.foreignLocaleExpired = t15.count;

  // Task 16: Stale RUNNING log cleanup
  const t16 = await runTask('Stale Log Cleanup', () => cleanupStaleLogs(prisma));
  report.tasks.push(t16);
  report.summary.staleLogsCleaned = t16.count;

  // Task 17: Job listing limit monitoring
  const t17 = await runTask('Job Listing Limit Check', () => checkListingLimits(prisma));
  report.tasks.push(t17);
  report.summary.nearLimitBrands = t17.count;

  // Task 18: Health report
  const t18 = await runTask('Health Report', () => generateHealthReport(prisma));
  report.tasks.push(t18);

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
    stat.found += log.jobsFound;
    stat.new += log.jobsNew;
    stat.updated += log.jobsUpdated;
    marketMap.set(m, stat);
  }
  const marketStats = Array.from(marketMap.values()).sort((a, b) => b.new - a.new);

  // Count job listings expired today
  const jobsExpired = await prisma.jobListing.count({
    where: { status: 'EXPIRED', updatedAt: { gte: today, lt: dayEnd } },
  });

  // Totals
  const totalSources = logs.length;
  const sourcesSuccess = logs.filter(l => l.status === 'SUCCESS' || l.status === 'PARTIAL').length;
  const sourcesFailed = logs.filter(l => l.status === 'FAILED').length;
  const jobsFound = logs.reduce((s, l) => s + l.jobsFound, 0);
  const jobsNew = logs.reduce((s, l) => s + l.jobsNew, 0);
  const jobsUpdated = logs.reduce((s, l) => s + l.jobsUpdated, 0);
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
      jobsFound, jobsNew, jobsUpdated, jobsExpired,
      crawlDurationMs, maintenanceActions, maintenanceErrors,
      marketStats: marketStats as any, maintenanceTasks: maintenanceTasks as any,
    },
    update: {
      totalSources, sourcesSuccess, sourcesFailed,
      jobsFound, jobsNew, jobsUpdated, jobsExpired,
      crawlDurationMs, maintenanceActions, maintenanceErrors,
      marketStats: marketStats as any, maintenanceTasks: maintenanceTasks as any,
    },
  });

  console.log(`[Maintenance] Daily report saved: ${totalSources} sources, ${jobsNew} new, ${marketStats.length} markets`);
}
