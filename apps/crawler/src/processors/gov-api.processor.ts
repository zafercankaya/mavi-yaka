/**
 * gov-api.processor.ts — Government Job Portal API Processor
 *
 * Specialized processor for government employment agency APIs.
 * Each market has a specific handler that knows the API format.
 *
 * All 31 markets have handlers. Actual data availability depends on
 * whether government portals expose public JSON APIs.
 *   Confirmed working: SE (Platsbanken), DE (Arbeitsagentur), RU (Trudvsem)
 *   API key required:  US (USAJobs), FR (France Travail), KR (WorkNet)
 */

import { RawJobData, Market } from '../pipeline/normalize';

const REQUEST_TIMEOUT_MS = 15_000;

// ─── Blue-collar job queries per market ──────────────────────────────

const BLUE_COLLAR_QUERIES: Record<string, { q: string; label: string }[]> = {
  SE: [
    { q: 'lagerarbetare', label: 'Warehouse' },
    { q: 'svetsare', label: 'Welder' },
    { q: 'lastbilschaufför', label: 'Truck Driver' },
    { q: 'städare', label: 'Cleaner' },
    { q: 'byggnadsarbetare', label: 'Construction' },
    { q: 'elektriker', label: 'Electrician' },
    { q: 'mekaniker', label: 'Mechanic' },
    { q: 'kock', label: 'Cook' },
    { q: 'montör', label: 'Assembler' },
    { q: 'maskinförare', label: 'Machine Operator' },
  ],
  DE: [
    { q: 'Lagerarbeiter', label: 'Warehouse' },
    { q: 'Schweisser', label: 'Welder' },
    { q: 'LKW-Fahrer', label: 'Truck Driver' },
    { q: 'Reinigungskraft', label: 'Cleaner' },
    { q: 'Produktionsmitarbeiter', label: 'Production' },
    { q: 'Elektriker', label: 'Electrician' },
    { q: 'Mechaniker', label: 'Mechanic' },
    { q: 'Koch', label: 'Cook' },
    { q: 'Bauarbeiter', label: 'Construction' },
    { q: 'Monteur', label: 'Assembler' },
  ],
  RU: [
    { q: 'грузчик', label: 'Loader' },
    { q: 'сварщик', label: 'Welder' },
    { q: 'водитель', label: 'Driver' },
    { q: 'уборщик', label: 'Cleaner' },
    { q: 'разнорабочий', label: 'General Worker' },
    { q: 'электрик', label: 'Electrician' },
    { q: 'слесарь', label: 'Fitter' },
    { q: 'повар', label: 'Cook' },
    { q: 'каменщик', label: 'Mason' },
    { q: 'маляр', label: 'Painter' },
  ],
  US: [
    { q: 'warehouse worker', label: 'Warehouse' },
    { q: 'welder', label: 'Welder' },
    { q: 'truck driver', label: 'Truck Driver' },
    { q: 'custodian', label: 'Custodian' },
    { q: 'construction worker', label: 'Construction' },
    { q: 'electrician', label: 'Electrician' },
    { q: 'mechanic', label: 'Mechanic' },
    { q: 'cook', label: 'Cook' },
    { q: 'maintenance worker', label: 'Maintenance' },
    { q: 'laborer', label: 'Laborer' },
  ],
  FR: [
    { q: 'manutention', label: 'Material Handling' },
    { q: 'soudeur', label: 'Welder' },
    { q: 'chauffeur poids lourd', label: 'Truck Driver' },
    { q: 'agent de nettoyage', label: 'Cleaner' },
    { q: 'ouvrier du bâtiment', label: 'Construction' },
    { q: 'électricien', label: 'Electrician' },
    { q: 'mécanicien', label: 'Mechanic' },
    { q: 'cuisinier', label: 'Cook' },
    { q: 'cariste', label: 'Forklift Operator' },
    { q: 'agent de production', label: 'Production' },
  ],
  // ─── 12 New Markets ───────────────────────────────────────────────
  EG: [
    { q: 'عامل مستودع', label: 'Warehouse Worker' },
    { q: 'سائق', label: 'Driver' },
    { q: 'عامل نظافة', label: 'Cleaner' },
    { q: 'عامل بناء', label: 'Construction Worker' },
    { q: 'حارس أمن', label: 'Security Guard' },
    { q: 'طباخ', label: 'Cook' },
    { q: 'كهربائي', label: 'Electrician' },
    { q: 'سباك', label: 'Plumber' },
    { q: 'لحام', label: 'Welder' },
    { q: 'ميكانيكي', label: 'Mechanic' },
  ],
  SA: [
    { q: 'عامل مستودعات', label: 'Warehouse Worker' },
    { q: 'سائق شاحنة', label: 'Truck Driver' },
    { q: 'عامل نظافة', label: 'Cleaner' },
    { q: 'عامل بناء', label: 'Construction Worker' },
    { q: 'حارس أمن', label: 'Security Guard' },
    { q: 'طباخ', label: 'Cook' },
    { q: 'فني كهرباء', label: 'Electrician' },
    { q: 'سباك', label: 'Plumber' },
    { q: 'لحام', label: 'Welder' },
    { q: 'فني تكييف', label: 'HVAC Technician' },
  ],
  AE: [
    { q: 'warehouse worker', label: 'Warehouse Worker' },
    { q: 'driver', label: 'Driver' },
    { q: 'cleaner', label: 'Cleaner' },
    { q: 'construction worker', label: 'Construction Worker' },
    { q: 'security guard', label: 'Security Guard' },
    { q: 'cook', label: 'Cook' },
    { q: 'electrician', label: 'Electrician' },
    { q: 'plumber', label: 'Plumber' },
    { q: 'welder', label: 'Welder' },
    { q: 'mechanic', label: 'Mechanic' },
  ],
  AR: [
    { q: 'operario de depósito', label: 'Warehouse Worker' },
    { q: 'chofer', label: 'Driver' },
    { q: 'limpieza', label: 'Cleaner' },
    { q: 'albañil', label: 'Construction Worker' },
    { q: 'vigilador', label: 'Security Guard' },
    { q: 'cocinero', label: 'Cook' },
    { q: 'electricista', label: 'Electrician' },
    { q: 'plomero', label: 'Plumber' },
    { q: 'soldador', label: 'Welder' },
    { q: 'mecánico', label: 'Mechanic' },
  ],
  ID: [
    { q: 'operator gudang', label: 'Warehouse Worker' },
    { q: 'supir', label: 'Driver' },
    { q: 'cleaning service', label: 'Cleaner' },
    { q: 'pekerja bangunan', label: 'Construction Worker' },
    { q: 'satpam', label: 'Security Guard' },
    { q: 'juru masak', label: 'Cook' },
    { q: 'teknisi listrik', label: 'Electrician' },
    { q: 'tukang las', label: 'Welder' },
    { q: 'mekanik', label: 'Mechanic' },
    { q: 'operator produksi', label: 'Production Operator' },
  ],
  TH: [
    { q: 'พนักงานคลังสินค้า', label: 'Warehouse Worker' },
    { q: 'พนักงานขับรถ', label: 'Driver' },
    { q: 'แม่บ้าน', label: 'Cleaner' },
    { q: 'คนงานก่อสร้าง', label: 'Construction Worker' },
    { q: 'รปภ', label: 'Security Guard' },
    { q: 'พ่อครัว', label: 'Cook' },
    { q: 'ช่างไฟฟ้า', label: 'Electrician' },
    { q: 'ช่างเชื่อม', label: 'Welder' },
    { q: 'ช่างยนต์', label: 'Mechanic' },
    { q: 'พนักงานผลิต', label: 'Production Worker' },
  ],
  PH: [
    { q: 'warehouse worker', label: 'Warehouse Worker' },
    { q: 'driver', label: 'Driver' },
    { q: 'janitor', label: 'Janitor' },
    { q: 'construction worker', label: 'Construction Worker' },
    { q: 'security guard', label: 'Security Guard' },
    { q: 'cook', label: 'Cook' },
    { q: 'electrician', label: 'Electrician' },
    { q: 'welder', label: 'Welder' },
    { q: 'mechanic', label: 'Mechanic' },
    { q: 'factory worker', label: 'Factory Worker' },
  ],
  VN: [
    { q: 'nhân viên kho', label: 'Warehouse Worker' },
    { q: 'tài xế', label: 'Driver' },
    { q: 'lao công', label: 'Cleaner' },
    { q: 'công nhân xây dựng', label: 'Construction Worker' },
    { q: 'bảo vệ', label: 'Security Guard' },
    { q: 'đầu bếp', label: 'Cook' },
    { q: 'thợ điện', label: 'Electrician' },
    { q: 'thợ hàn', label: 'Welder' },
    { q: 'thợ cơ khí', label: 'Mechanic' },
    { q: 'công nhân sản xuất', label: 'Production Worker' },
  ],
  MY: [
    { q: 'pekerja gudang', label: 'Warehouse Worker' },
    { q: 'pemandu lori', label: 'Truck Driver' },
    { q: 'pembersih', label: 'Cleaner' },
    { q: 'pekerja binaan', label: 'Construction Worker' },
    { q: 'pengawal keselamatan', label: 'Security Guard' },
    { q: 'tukang masak', label: 'Cook' },
    { q: 'juruteknik elektrik', label: 'Electrician' },
    { q: 'pengimpal', label: 'Welder' },
    { q: 'mekanik', label: 'Mechanic' },
    { q: 'operator pengeluaran', label: 'Production Operator' },
  ],
  PK: [
    { q: 'warehouse worker', label: 'Warehouse Worker' },
    { q: 'driver', label: 'Driver' },
    { q: 'cleaner', label: 'Cleaner' },
    { q: 'construction worker', label: 'Construction Worker' },
    { q: 'security guard', label: 'Security Guard' },
    { q: 'cook', label: 'Cook' },
    { q: 'electrician', label: 'Electrician' },
    { q: 'plumber', label: 'Plumber' },
    { q: 'welder', label: 'Welder' },
    { q: 'mechanic', label: 'Mechanic' },
  ],
  PT: [
    { q: 'operador de armazém', label: 'Warehouse Worker' },
    { q: 'motorista', label: 'Driver' },
    { q: 'empregado de limpeza', label: 'Cleaner' },
    { q: 'pedreiro', label: 'Construction Worker' },
    { q: 'vigilante', label: 'Security Guard' },
    { q: 'cozinheiro', label: 'Cook' },
    { q: 'eletricista', label: 'Electrician' },
    { q: 'canalizador', label: 'Plumber' },
    { q: 'soldador', label: 'Welder' },
    { q: 'mecânico', label: 'Mechanic' },
  ],
  ZA: [
    { q: 'warehouse worker', label: 'Warehouse Worker' },
    { q: 'driver', label: 'Driver' },
    { q: 'cleaner', label: 'Cleaner' },
    { q: 'construction worker', label: 'Construction Worker' },
    { q: 'security guard', label: 'Security Guard' },
    { q: 'cook', label: 'Cook' },
    { q: 'electrician', label: 'Electrician' },
    { q: 'plumber', label: 'Plumber' },
    { q: 'welder', label: 'Welder' },
    { q: 'mechanic', label: 'Mechanic' },
  ],
};

const MAX_RESULTS_PER_QUERY = 100;
const MAX_PAGES_PER_QUERY = 20; // paginate up to 20 pages per keyword
const API_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── SE: Platsbanken (JobTech) ──────────────────────────────────────

async function fetchSE(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.SE) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchJson(
          `https://jobsearch.api.jobtechdev.se/search?q=${encodeURIComponent(q)}&offset=${offset}&limit=${MAX_RESULTS_PER_QUERY}`,
          { headers: { accept: 'application/json' } },
        );

        const hits = data.hits || [];
        for (const hit of hits) {
          const id = hit.id || hit.webpage_url;
          if (seen.has(id)) continue;
          seen.add(id);

          results.push({
            title: hit.headline || hit.occupation?.label || q,
            description: hit.description?.text?.substring(0, 2000),
            sourceUrl: hit.webpage_url || `https://arbetsformedlingen.se/platsbanken/annonser/${hit.id}`,
            locationText: [hit.workplace_address?.municipality, hit.workplace_address?.region].filter(Boolean).join(', '),
            deadline: hit.application_deadline,
            postedDate: hit.publication_date,
            salaryText: hit.salary_description || undefined,
            jobTypeText: hit.working_hours_type?.label || undefined,
            experienceText: hit.experience_required === false ? 'No experience required' : undefined,
          });
        }

        const total = data.total?.value || 0;
        offset += MAX_RESULTS_PER_QUERY;
        // JobTech max offset = 2000
        hasMore = hits.length === MAX_RESULTS_PER_QUERY && offset < 2000 && offset < total;

        if (hasMore) await delay(API_DELAY_MS);
      } catch (e) {
        console.warn(`[GovAPI:SE] Query "${q}" offset=${offset} failed: ${(e as Error).message}`);
        hasMore = false;
      }
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:SE] Fetched ${results.length} jobs from Platsbanken`);
  return results;
}

// ─── DE: Bundesagentur für Arbeit ───────────────────────────────────

async function fetchDE(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.DE) {
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchJson(
          `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?was=${encodeURIComponent(q)}&page=${page}&size=${MAX_RESULTS_PER_QUERY}`,
          { headers: { 'X-API-Key': 'jobboerse-jobsuche' } },
        );

        const jobs = data.stellenangebote || [];
        for (const job of jobs) {
          const ref = job.refnr || job.hashId;
          if (seen.has(ref)) continue;
          seen.add(ref);

          results.push({
            title: job.titel || q,
            description: job.beruf || undefined,
            sourceUrl: job.externeUrl || `https://jobboerse.arbeitsagentur.de/vamJB/stellenangeboteFinden.html?execution=e1s1&d_${ref}`,
            locationText: job.arbeitsort?.ort ? `${job.arbeitsort.ort}, ${job.arbeitsort.region || ''}`.trim() : undefined,
            deadline: job.aktuelleVeroeffentlichungsdatum ? undefined : undefined,
            postedDate: job.eintrittsdatum || job.aktuelleVeroeffentlichungsdatum,
            salaryText: undefined, // DE API doesn't expose salary
            jobTypeText: job.arbeitszeitmodell?.join(', ') || undefined,
          });
        }

        const maxResults = data.maxErgebnisse || 0;
        page++;
        // Cap at MAX_PAGES_PER_QUERY pages to avoid very long crawls
        hasMore = jobs.length === MAX_RESULTS_PER_QUERY && page < MAX_PAGES_PER_QUERY && (page * MAX_RESULTS_PER_QUERY) < maxResults;

        if (hasMore) await delay(API_DELAY_MS);
      } catch (e) {
        console.warn(`[GovAPI:DE] Query "${q}" page=${page} failed: ${(e as Error).message}`);
        hasMore = false;
      }
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:DE] Fetched ${results.length} jobs from Jobbörse`);
  return results;
}

// ─── RU: Trudvsem (Работа в России) ────────────────────────────────

async function fetchRU(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.RU) {
    try {
      const data = await fetchJson(
        `http://opendata.trudvsem.ru/api/v1/vacancies?text=${encodeURIComponent(q)}&limit=${MAX_RESULTS_PER_QUERY}`,
      );

      const vacancies = data.results?.vacancies || [];
      for (const item of vacancies) {
        const v = item.vacancy;
        if (!v) continue;
        const id = v.id || v['job-name'];
        if (seen.has(id)) continue;
        seen.add(id);

        const salaryMin = v.salary_min || v.salary;
        const salaryMax = v.salary_max;
        const salaryText = salaryMin ? `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} RUB` : undefined;

        results.push({
          title: v['job-name'] || q,
          description: v.duty?.substring(0, 2000),
          sourceUrl: v.vac_url || `https://trudvsem.ru/vacancy/card/${v.id}`,
          locationText: [v.region?.name, v.addresses?.address?.[0]?.location].filter(Boolean).join(', '),
          deadline: v.term_date,
          postedDate: v.creation_date,
          salaryText,
          jobTypeText: v.schedule?.name || undefined,
          workModeText: v.employment?.name || undefined,
          experienceText: v.requirement?.experience ? `${v.requirement.experience} months` : undefined,
        });
      }
    } catch (e) {
      console.warn(`[GovAPI:RU] Query "${q}" failed: ${(e as Error).message}`);
    }
    await delay(1000); // RU API is slower, be gentle
  }

  console.log(`[GovAPI:RU] Fetched ${results.length} jobs from Trudvsem`);
  return results;
}

// ─── US: USAJobs ────────────────────────────────────────────────────

async function fetchUS(): Promise<RawJobData[]> {
  const apiKey = process.env.USAJOBS_API_KEY;
  const email = process.env.USAJOBS_EMAIL;
  if (!apiKey || !email) {
    console.warn('[GovAPI:US] USAJOBS_API_KEY or USAJOBS_EMAIL not set, skipping');
    return [];
  }

  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.US) {
    try {
      const data = await fetchJson(
        `https://data.usajobs.gov/api/Search?Keyword=${encodeURIComponent(q)}&ResultsPerPage=${MAX_RESULTS_PER_QUERY}&Fields=Full`,
        {
          headers: {
            Host: 'data.usajobs.gov',
            'User-Agent': email,
            'Authorization-Key': apiKey,
          },
        },
      );

      const items = data.SearchResult?.SearchResultItems || [];
      for (const item of items) {
        const mp = item.MatchedObjectDescriptor;
        if (!mp) continue;
        const id = mp.PositionID || mp.PositionURI;
        if (seen.has(id)) continue;
        seen.add(id);

        const loc = mp.PositionLocation?.[0];
        const salary = mp.PositionRemuneration?.[0];
        const salaryText = salary
          ? `$${salary.MinimumRange}-$${salary.MaximumRange} ${salary.RateIntervalCode}`
          : undefined;

        results.push({
          title: mp.PositionTitle || q,
          description: mp.UserArea?.Details?.MajorDuties?.join('\n')?.substring(0, 2000) || mp.QualificationSummary,
          requirements: mp.QualificationSummary,
          sourceUrl: mp.PositionURI || mp.ApplyURI?.[0],
          locationText: loc ? `${loc.CityName}, ${loc.CountrySubDivisionCode}` : undefined,
          deadline: mp.ApplicationCloseDate,
          postedDate: mp.PublicationStartDate,
          salaryText,
          jobTypeText: mp.PositionSchedule?.[0]?.Name || undefined,
          workModeText: mp.PositionOfferingType?.[0]?.Name || undefined,
        });
      }
    } catch (e) {
      console.warn(`[GovAPI:US] Query "${q}" failed: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:US] Fetched ${results.length} jobs from USAJobs`);
  return results;
}

// ─── FR: France Travail ─────────────────────────────────────────────

let frAccessToken: string | null = null;
let frTokenExpiry = 0;

async function getFranceToken(): Promise<string | null> {
  if (frAccessToken && Date.now() < frTokenExpiry) return frAccessToken;

  const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.warn('[GovAPI:FR] FRANCE_TRAVAIL_CLIENT_ID/SECRET not set, skipping');
    return null;
  }

  const resp = await fetch(
    'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&scope=api_offresdemploiv2 o2dsoffre`,
    },
  );
  const data: any = await resp.json();
  if (!data.access_token) {
    console.error('[GovAPI:FR] OAuth2 token failed:', JSON.stringify(data).substring(0, 200));
    return null;
  }

  frAccessToken = data.access_token;
  frTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return frAccessToken;
}

async function fetchFR(): Promise<RawJobData[]> {
  const token = await getFranceToken();
  if (!token) return [];

  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.FR) {
    try {
      const resp = await fetch(
        `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?motsCles=${encodeURIComponent(q)}&range=0-${MAX_RESULTS_PER_QUERY - 1}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data: any = await resp.json();

      for (const offre of data.resultats || []) {
        const id = offre.id;
        if (seen.has(id)) continue;
        seen.add(id);

        const salary = offre.salaire;
        let salaryText: string | undefined;
        if (salary?.libelle) salaryText = salary.libelle;
        else if (salary?.complement1) salaryText = salary.complement1;

        results.push({
          title: offre.intitule || q,
          description: offre.description?.substring(0, 2000),
          requirements: offre.competences?.map((c: any) => c.libelle).join(', '),
          sourceUrl: offre.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${id}`,
          locationText: offre.lieuTravail?.libelle,
          deadline: offre.dateLimiteParution,
          postedDate: offre.dateCreation,
          salaryText,
          jobTypeText: offre.typeContratLibelle || offre.natureContrat,
          workModeText: offre.dureeTravailLibelleConverti || undefined,
          experienceText: offre.experienceLibelle || undefined,
        });
      }
    } catch (e) {
      console.warn(`[GovAPI:FR] Query "${q}" failed: ${(e as Error).message}`);
    }
    await delay(400); // FR rate limit: 3 req/sec
  }

  console.log(`[GovAPI:FR] Fetched ${results.length} jobs from France Travail`);
  return results;
}

// ─── UK: Find a Job (DWP) ───────────────────────────────────────────

async function fetchUK(): Promise<RawJobData[]> {
  // DWP Find a Job API - public search endpoint
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'warehouse', 'driver', 'cleaner', 'labourer', 'security',
    'chef', 'electrician', 'plumber', 'welder', 'mechanic',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://findajob.dwp.gov.uk/api/search?q=${encodeURIComponent(q)}&d=10&pp=50&sty=F`,
      );
      for (const job of data?.jobs || data?.results || []) {
        const id = job.id || job.jobId || job.url;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.title || job.name || q,
          description: job.description?.substring(0, 2000),
          sourceUrl: job.url || `https://findajob.dwp.gov.uk/details/${id}`,
          locationText: job.location || job.locationName,
          salaryText: job.salary || job.pay,
          postedDate: job.datePosted || job.created,
          deadline: job.closingDate || job.expiryDate,
        });
      }
    } catch (e) {
      // Fallback: try GOV.UK jobs API
      if (q === queries[0]) console.warn(`[GovAPI:UK] DWP API unavailable: ${(e as Error).message}, trying GOV.UK`);
    }
    await delay(API_DELAY_MS);
  }

  // Fallback: GOV.UK Content API for job listings
  if (results.length === 0) {
    try {
      const data = await fetchJson(
        `https://www.gov.uk/api/search.json?filter_format=job&count=200&fields=title,link,description,public_timestamp,organisations`,
      );
      for (const r of data?.results || []) {
        results.push({
          title: r.title,
          description: r.description?.substring(0, 2000),
          sourceUrl: `https://www.gov.uk${r.link}`,
          postedDate: r.public_timestamp,
        });
      }
    } catch (_) { /* ignore */ }
  }

  console.log(`[GovAPI:UK] Fetched ${results.length} jobs`);
  return results;
}

// ─── CA: Job Bank Canada ────────────────────────────────────────────

async function fetchCA(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'warehouse worker', 'truck driver', 'cleaner', 'labourer', 'security guard',
    'cook', 'electrician', 'plumber', 'welder', 'carpenter',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=${encodeURIComponent(q)}&sort=D&fprov=&fskl=&fsal=`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.jobId || job.noc || job.id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.title || job.jobTitle || q,
          description: job.description?.substring(0, 2000),
          sourceUrl: job.url || `https://www.jobbank.gc.ca/jobsearch/jobposting/${id}`,
          locationText: job.location || job.city,
          salaryText: job.salary || job.wage,
          postedDate: job.datePosted || job.posted,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:CA] API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:CA] Fetched ${results.length} jobs from Job Bank`);
  return results;
}

// ─── AU: Australian JobSearch ───────────────────────────────────────

async function fetchAU(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'warehouse', 'driver', 'cleaner', 'labourer', 'security',
    'chef', 'electrician', 'plumber', 'welder', 'mechanic',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://jobsearch.gov.au/api/v1/search?keywords=${encodeURIComponent(q)}&pageSize=50&page=1`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.results || data?.jobs || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId || job.referenceNumber;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.title || job.name || q,
          description: job.description?.substring(0, 2000),
          sourceUrl: job.url || job.link || `https://jobsearch.gov.au/job/${id}`,
          locationText: job.location || job.suburb,
          salaryText: job.salary || job.pay,
          postedDate: job.datePosted || job.lodgedDate,
          deadline: job.closingDate,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:AU] API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:AU] Fetched ${results.length} jobs from JobSearch`);
  return results;
}

// ─── PL: CBOP (Centralna Baza Ofert Pracy) ─────────────────────────

async function fetchPL(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'magazynier', 'kierowca', 'sprzątaczka', 'pracownik budowlany', 'ochroniarz',
    'kucharz', 'elektryk', 'hydraulik', 'spawacz', 'mechanik',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://oferty.praca.gov.pl/portal/index.cbop/api/v1/offers?keyword=${encodeURIComponent(q)}&pageSize=50&page=1`,
        { headers: { Accept: 'application/json' } },
      );
      const offers = data?.offers || data?.results || data?.content || [];
      for (const offer of (Array.isArray(offers) ? offers : [])) {
        const id = offer.offerId || offer.id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: offer.jobTitle || offer.stanowisko || offer.title || q,
          description: (offer.description || offer.opis || '').substring(0, 2000),
          sourceUrl: offer.url || `https://oferty.praca.gov.pl/portal/index.cbop#/listaOfert/szczegoly/${id}`,
          locationText: offer.location || offer.miejscePracy || offer.city,
          salaryText: offer.salary || offer.wynagrodzenie,
          postedDate: offer.datePosted || offer.dataRozpoczeciaPrezentacji,
          deadline: offer.deadline || offer.dataZakonczeniaWaznosciOferty,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:PL] CBOP API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:PL] Fetched ${results.length} jobs from CBOP`);
  return results;
}

// ─── TR: İŞKUR ──────────────────────────────────────────────────────

async function fetchTR(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'garson', 'kurye', 'şoför', 'temizlik', 'depocu',
    'güvenlik', 'aşçı', 'elektrikçi', 'tesisatçı', 'kaynakçı',
  ];

  for (const q of queries) {
    try {
      // İŞKUR e-şube search API
      const data = await fetchJson(
        `https://esube.iskur.gov.tr/Ilan/IlanListesi.aspx/GetIlanlar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aranacakKelime: q, sayfaNo: 1, sayfaBuyuklugu: 50 }),
        },
      );
      const ilanlar = data?.d?.ilanlar || data?.ilanlar || data?.results || [];
      for (const ilan of (Array.isArray(ilanlar) ? ilanlar : [])) {
        const id = ilan.ilanNo || ilan.id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: ilan.meslekAdi || ilan.unvan || ilan.title || q,
          description: (ilan.aciklama || ilan.description || '').substring(0, 2000),
          sourceUrl: ilan.url || `https://esube.iskur.gov.tr/Ilan/IlanDetay/${id}`,
          locationText: ilan.il || ilan.sehir || ilan.location,
          salaryText: ilan.ucret || ilan.maas || ilan.salary,
          postedDate: ilan.yayinTarihi,
          deadline: ilan.sonBasvuruTarihi,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:TR] İŞKUR API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  // Fallback: try İŞKUR open data
  if (results.length === 0) {
    try {
      const data = await fetchJson(
        'https://media.iskur.gov.tr/65037/acik-is-ilanlari.json',
      );
      if (Array.isArray(data)) {
        for (const ilan of data.slice(0, 200)) {
          const id = ilan.ILAN_NO || ilan.id;
          if (!id || seen.has(String(id))) continue;
          seen.add(String(id));
          results.push({
            title: ilan.MESLEK_ADI || ilan.IS_TANIMI || 'İŞKUR İlanı',
            description: ilan.IS_TANIMI?.substring(0, 2000),
            sourceUrl: `https://esube.iskur.gov.tr/Ilan/IlanDetay/${id}`,
            locationText: ilan.IL_ADI || ilan.ILCE_ADI,
            salaryText: ilan.UCRET_ALT ? `${ilan.UCRET_ALT}-${ilan.UCRET_UST} TL` : undefined,
          });
        }
      }
    } catch (_) { /* ignore */ }
  }

  console.log(`[GovAPI:TR] Fetched ${results.length} jobs from İŞKUR`);
  return results;
}

// ─── NL: UWV Werk.nl ───────────────────────────────────────────────

async function fetchNL(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'magazijnmedewerker', 'chauffeur', 'schoonmaker', 'bouwvakker', 'beveiliger',
    'kok', 'elektricien', 'loodgieter', 'lasser', 'monteur',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://www.werk.nl/werkzoekenden/vacatures/api/v1/search?q=${encodeURIComponent(q)}&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const vacatures = data?.vacatures || data?.results || data?.content || [];
      for (const v of (Array.isArray(vacatures) ? vacatures : [])) {
        const id = v.vacatureId || v.id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: v.functieNaam || v.titel || v.title || q,
          description: (v.omschrijving || v.description || '').substring(0, 2000),
          sourceUrl: v.url || `https://www.werk.nl/werkzoekenden/vacatures/${id}`,
          locationText: v.standplaats || v.plaats || v.location,
          salaryText: v.salaris || v.salary,
          postedDate: v.publicatieDatum || v.datePosted,
          deadline: v.sluitingsDatum || v.deadline,
          jobTypeText: v.dienstverband || v.contractType,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:NL] Werk.nl API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:NL] Fetched ${results.length} jobs from Werk.nl`);
  return results;
}

// ─── BR: Portal Emprega Brasil / SINE ──────────────────────────────

async function fetchBR(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'operador de empilhadeira', 'motorista', 'auxiliar de limpeza', 'pedreiro', 'vigilante',
    'cozinheiro', 'eletricista', 'encanador', 'soldador', 'mecânico',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://empregabrasil.mte.gov.br/api/vagas?q=${encodeURIComponent(q)}&qtd=50`,
        { headers: { Accept: 'application/json' } },
      );
      const vagas = data?.vagas || data?.results || data?.content || [];
      for (const v of (Array.isArray(vagas) ? vagas : [])) {
        const id = v.codigoVaga || v.id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: v.titulo || v.cargo || v.descricao || q,
          description: (v.descricao || v.requisitos || '').substring(0, 2000),
          sourceUrl: v.url || `https://empregabrasil.mte.gov.br/vaga/${id}`,
          locationText: [v.municipio, v.uf].filter(Boolean).join(', '),
          salaryText: v.salario ? `R$ ${v.salario}` : undefined,
          postedDate: v.dataPublicacao,
          deadline: v.dataEncerramento,
          jobTypeText: v.tipoContrato,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:BR] Emprega Brasil API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:BR] Fetched ${results.length} jobs from Emprega Brasil`);
  return results;
}

// ─── JP: Hello Work (ハローワーク) ─────────────────────────────────

async function fetchJP(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    '倉庫作業', '運転手', '清掃員', '建設作業員', '警備員',
    '調理師', '電気工事士', '配管工', '溶接工', '整備士',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://www.hellowork.mhlw.go.jp/api/v1/search?keyword=${encodeURIComponent(q)}&count=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.求人情報 || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.求人番号 || job.id || job.jobId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.職種 || job.title || job.jobTitle || q,
          description: (job.仕事内容 || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://www.hellowork.mhlw.go.jp/servicef/130050.do?screenId=130050&action=commonDetailInfo&kyujinNumber=${id}`,
          locationText: job.就業場所 || job.勤務地 || job.location,
          salaryText: job.賃金 || job.salary,
          postedDate: job.受理日 || job.datePosted,
          deadline: job.紹介期限日 || job.deadline,
          jobTypeText: job.雇用形態 || job.employmentType,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:JP] HelloWork API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:JP] Fetched ${results.length} jobs from HelloWork`);
  return results;
}

// ─── IN: National Career Service ───────────────────────────────────

async function fetchIN(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'warehouse worker', 'driver', 'cleaner', 'construction worker', 'security guard',
    'cook', 'electrician', 'plumber', 'welder', 'mechanic',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://www.ncs.gov.in/api/v1/jobs/search?keyword=${encodeURIComponent(q)}&pageSize=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.jobId || job.id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.jobTitle || job.title || q,
          description: (job.jobDescription || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://www.ncs.gov.in/job-seeker/job-details/${id}`,
          locationText: [job.city, job.state].filter(Boolean).join(', '),
          salaryText: job.salary || job.ctc,
          postedDate: job.postedDate || job.datePosted,
          deadline: job.lastDate || job.deadline,
          jobTypeText: job.jobType || job.employmentType,
          experienceText: job.experience || job.minExperience,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:IN] NCS API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:IN] Fetched ${results.length} jobs from NCS`);
  return results;
}

// ─── KR: WorkNet (워크넷) ──────────────────────────────────────────

async function fetchKR(): Promise<RawJobData[]> {
  const apiKey = process.env.WORKNET_API_KEY;
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    '창고작업원', '운전기사', '청소원', '건설노동자', '경비원',
    '조리사', '전기기사', '배관공', '용접공', '정비사',
  ];

  for (const q of queries) {
    try {
      const url = apiKey
        ? `https://openapi.work.go.kr/opi/opi/opia/wantedApi.do?authKey=${apiKey}&keyword=${encodeURIComponent(q)}&display=50&returnType=json`
        : `https://www.work.go.kr/empInfo/empInfoSrch/list/dtlEmpSrchList.do?keyword=${encodeURIComponent(q)}&pageSize=50`;

      const data = await fetchJson(url, { headers: { Accept: 'application/json' } });
      const jobs = data?.wantedRoot?.wanted || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.wantedAuthNo || job.id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.wantedTitle || job.title || q,
          description: (job.jobCont || job.description || '').substring(0, 2000),
          sourceUrl: job.wantedInfoUrl || `https://www.work.go.kr/empInfo/empInfoSrch/detail/empDetailAuthView.do?wantedAuthNo=${id}`,
          locationText: job.workPlcNm || job.region,
          salaryText: job.sal || job.salary,
          postedDate: job.regDt,
          deadline: job.closeDt,
          jobTypeText: job.empTpNm || job.employmentType,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:KR] WorkNet API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:KR] Fetched ${results.length} jobs from WorkNet`);
  return results;
}

// ─── ES: SEPE / Empleate ───────────────────────────────────────────

async function fetchES(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'mozo de almacén', 'conductor', 'limpiador', 'albañil', 'vigilante',
    'cocinero', 'electricista', 'fontanero', 'soldador', 'mecánico',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://empleate.gob.es/empleate/api/ofertas?keyword=${encodeURIComponent(q)}&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const ofertas = data?.ofertas || data?.content || data?.results || [];
      for (const o of (Array.isArray(ofertas) ? ofertas : [])) {
        const id = o.id || o.codigoOferta;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: o.puesto || o.titulo || o.title || q,
          description: (o.descripcion || o.description || '').substring(0, 2000),
          sourceUrl: o.url || `https://empleate.gob.es/empleate/oferta/${id}`,
          locationText: [o.municipio, o.provincia].filter(Boolean).join(', '),
          salaryText: o.salario || o.salary,
          postedDate: o.fechaPublicacion,
          deadline: o.fechaFinPlazo,
          jobTypeText: o.tipoContrato || o.contractType,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:ES] SEPE API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:ES] Fetched ${results.length} jobs from SEPE`);
  return results;
}

// ─── IT: ANPAL / MyANPAL ──────────────────────────────────────────

async function fetchIT(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'magazziniere', 'autista', 'addetto pulizie', 'muratore', 'guardia giurata',
    'cuoco', 'elettricista', 'idraulico', 'saldatore', 'meccanico',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://myanpal.anpal.gov.it/api/v1/offerte?keyword=${encodeURIComponent(q)}&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const offerte = data?.offerte || data?.results || data?.content || [];
      for (const o of (Array.isArray(offerte) ? offerte : [])) {
        const id = o.id || o.codiceOfferta;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: o.qualifica || o.titolo || o.title || q,
          description: (o.descrizione || o.description || '').substring(0, 2000),
          sourceUrl: o.url || `https://myanpal.anpal.gov.it/offerta/${id}`,
          locationText: [o.comune, o.provincia].filter(Boolean).join(', '),
          salaryText: o.retribuzione || o.salary,
          postedDate: o.dataPubblicazione,
          deadline: o.dataScadenza,
          jobTypeText: o.tipoContratto || o.contractType,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:IT] ANPAL API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:IT] Fetched ${results.length} jobs from ANPAL`);
  return results;
}

// ─── MX: SNE (Servicio Nacional de Empleo) ─────────────────────────

async function fetchMX(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'almacenista', 'chofer', 'intendencia', 'albañil', 'guardia de seguridad',
    'cocinero', 'electricista', 'plomero', 'soldador', 'mecánico',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://empleo.gob.mx/api/vacantes?keyword=${encodeURIComponent(q)}&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const vacantes = data?.vacantes || data?.results || data?.data || [];
      for (const v of (Array.isArray(vacantes) ? vacantes : [])) {
        const id = v.id || v.claveVacante;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: v.puesto || v.titulo || v.title || q,
          description: (v.descripcion || v.description || '').substring(0, 2000),
          sourceUrl: v.url || `https://empleo.gob.mx/vacante/${id}`,
          locationText: [v.municipio, v.estado].filter(Boolean).join(', '),
          salaryText: v.salario ? `MX$ ${v.salario}` : undefined,
          postedDate: v.fechaPublicacion,
          deadline: v.fechaVigencia,
          jobTypeText: v.tipoContrato,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:MX] SNE API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:MX] Fetched ${results.length} jobs from SNE`);
  return results;
}

// ─── CO: Servicio de Empleo ────────────────────────────────────────

async function fetchCO(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();
  const queries = [
    'bodeguero', 'conductor', 'aseador', 'obrero de construcción', 'vigilante',
    'cocinero', 'electricista', 'plomero', 'soldador', 'mecánico',
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(
        `https://buscadorempleo.gov.co/api/v1/vacantes?keyword=${encodeURIComponent(q)}&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const vacantes = data?.vacantes || data?.results || data?.data || [];
      for (const v of (Array.isArray(vacantes) ? vacantes : [])) {
        const id = v.id || v.codigoVacante;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: v.cargo || v.titulo || v.title || q,
          description: (v.descripcion || v.description || '').substring(0, 2000),
          sourceUrl: v.url || `https://buscadorempleo.gov.co/vacante/${id}`,
          locationText: [v.municipio, v.departamento].filter(Boolean).join(', '),
          salaryText: v.salario ? `COP ${v.salario}` : undefined,
          postedDate: v.fechaPublicacion,
          deadline: v.fechaCierre,
          jobTypeText: v.tipoContrato,
        });
      }
    } catch (e) {
      if (q === queries[0]) console.warn(`[GovAPI:CO] Servicio de Empleo API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:CO] Fetched ${results.length} jobs from Servicio de Empleo`);
  return results;
}

// ─── EG: Manpower Egypt / Ta3mal ──────────────────────────────────

async function fetchEG(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  // Ta3mal.com (ILO-supported Egypt job portal) + Manpower portal
  for (const { q } of BLUE_COLLAR_QUERIES.EG) {
    // Try Ta3mal first (ILO-backed Arabic job portal)
    try {
      const data = await fetchJson(
        `https://www.ta3mal.com/api/jobs/search?q=${encodeURIComponent(q)}&page=1&per_page=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.job_id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.title || job.job_title || q,
          description: (job.description || job.details || '').substring(0, 2000),
          sourceUrl: job.url || `https://www.ta3mal.com/jobs/${id}`,
          locationText: job.location || job.city || job.governorate,
          salaryText: job.salary || job.compensation,
          postedDate: job.posted_at || job.created_at,
          deadline: job.deadline || job.expires_at,
          jobTypeText: job.job_type || job.employment_type,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.EG[0].q) console.warn(`[GovAPI:EG] Ta3mal API error: ${(e as Error).message}`);
    }

    // Also try Manpower Egypt
    try {
      const data = await fetchJson(
        `https://www.manpower.gov.eg/api/jobs?keyword=${encodeURIComponent(q)}&page=1&limit=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.title || job.jobTitle || q,
          description: (job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://www.manpower.gov.eg/job/${id}`,
          locationText: job.location || job.governorate,
          salaryText: job.salary,
          postedDate: job.postedDate || job.created_at,
          deadline: job.deadline,
        });
      }
    } catch (_) { /* ignore fallback errors */ }

    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:EG] Fetched ${results.length} jobs from Egypt portals`);
  return results;
}

// ─── SA: Jadarat (formerly Taqat) ────────────────────────────────

async function fetchSA(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.SA) {
    // Jadarat (jadarat.sa) — HRDF national job platform
    try {
      const data = await fetchJson(
        `https://jadarat.sa/api/job/search?keyword=${encodeURIComponent(q)}&page=1&size=50`,
        { headers: { Accept: 'application/json', 'Accept-Language': 'ar' } },
      );
      const jobs = data?.jobs || data?.results || data?.content || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId || job.advertisementId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.jobTitle || job.title || job.positionName || q,
          description: (job.jobDescription || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://jadarat.sa/app/jobs/${id}`,
          locationText: job.city || job.location || job.region,
          salaryText: job.salary ? `${job.salary} SAR` : undefined,
          postedDate: job.postedDate || job.createdDate,
          deadline: job.deadline || job.expiryDate,
          jobTypeText: job.employmentType || job.jobType,
          experienceText: job.experience || job.yearsOfExperience,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.SA[0].q) console.warn(`[GovAPI:SA] Jadarat API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:SA] Fetched ${results.length} jobs from Jadarat`);
  return results;
}

// ─── AE: MOHRE (Ministry of Human Resources) ────────────────────

async function fetchAE(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.AE) {
    // MOHRE job search
    try {
      const data = await fetchJson(
        `https://www.mohre.gov.ae/api/jobs/search?keyword=${encodeURIComponent(q)}&page=1&pageSize=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId || job.referenceNumber;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.jobTitle || job.title || q,
          description: (job.description || job.jobDescription || '').substring(0, 2000),
          sourceUrl: job.url || `https://www.mohre.gov.ae/en/job/${id}`,
          locationText: job.emirate || job.location || job.city,
          salaryText: job.salary ? `AED ${job.salary}` : undefined,
          postedDate: job.postedDate || job.publishDate,
          deadline: job.deadline || job.expiryDate,
          jobTypeText: job.jobType || job.contractType,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.AE[0].q) console.warn(`[GovAPI:AE] MOHRE API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:AE] Fetched ${results.length} jobs from MOHRE`);
  return results;
}

// ─── AR: Portal Empleo (Argentina) ───────────────────────────────

async function fetchAR(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.AR) {
    try {
      // Portal Empleo - Ministerio de Trabajo
      const data = await fetchJson(
        `https://portalempleo.trabajo.gob.ar/api/v1/ofertas?keyword=${encodeURIComponent(q)}&page=1&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const ofertas = data?.ofertas || data?.results || data?.data || [];
      for (const o of (Array.isArray(ofertas) ? ofertas : [])) {
        const id = o.id || o.ofertaId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: o.puesto || o.titulo || o.title || q,
          description: (o.descripcion || o.description || '').substring(0, 2000),
          sourceUrl: o.url || `https://portalempleo.trabajo.gob.ar/oferta/${id}`,
          locationText: [o.localidad, o.provincia].filter(Boolean).join(', '),
          salaryText: o.remuneracion ? `ARS ${o.remuneracion}` : undefined,
          postedDate: o.fechaPublicacion,
          deadline: o.fechaCierre || o.fechaVencimiento,
          jobTypeText: o.tipoContratacion || o.modalidad,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.AR[0].q) console.warn(`[GovAPI:AR] Portal Empleo API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:AR] Fetched ${results.length} jobs from Portal Empleo`);
  return results;
}

// ─── ID: Karirhub Kemnaker ───────────────────────────────────────

async function fetchID(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.ID) {
    try {
      // Karirhub — Ministry of Manpower Indonesia
      const data = await fetchJson(
        `https://karirhub.kemnaker.go.id/api/v1/lowongan?keyword=${encodeURIComponent(q)}&page=1&per_page=50`,
        { headers: { Accept: 'application/json' } },
      );
      const lowongan = data?.data || data?.lowongan || data?.results || [];
      for (const job of (Array.isArray(lowongan) ? lowongan : [])) {
        const id = job.id || job.lowongan_id;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.judul_lowongan || job.jabatan || job.title || q,
          description: (job.deskripsi || job.kualifikasi || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://karirhub.kemnaker.go.id/lowongan/${id}`,
          locationText: [job.kota, job.provinsi].filter(Boolean).join(', '),
          salaryText: job.gaji ? `Rp ${job.gaji}` : undefined,
          postedDate: job.tanggal_terbit || job.created_at,
          deadline: job.tanggal_berakhir || job.deadline,
          jobTypeText: job.tipe_pekerjaan || job.jenis_pekerjaan,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.ID[0].q) console.warn(`[GovAPI:ID] Karirhub API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:ID] Fetched ${results.length} jobs from Karirhub`);
  return results;
}

// ─── TH: DOE SmartJob (กรมการจัดหางาน) ─────────────────────────

async function fetchTH(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.TH) {
    try {
      // SmartJob — Department of Employment Thailand
      const data = await fetchJson(
        `https://smartjob.doe.go.th/api/jobs/search?keyword=${encodeURIComponent(q)}&page=1&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId || job.positionId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.positionName || job.title || job.jobTitle || q,
          description: (job.jobDetail || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://smartjob.doe.go.th/Job/Detail/${id}`,
          locationText: [job.district, job.province].filter(Boolean).join(', '),
          salaryText: job.salary || job.wage,
          postedDate: job.announcedDate || job.postedDate,
          deadline: job.closingDate || job.deadline,
          jobTypeText: job.employmentType || job.jobType,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.TH[0].q) console.warn(`[GovAPI:TH] SmartJob API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:TH] Fetched ${results.length} jobs from SmartJob`);
  return results;
}

// ─── PH: Phil-JobNet (DOLE) ─────────────────────────────────────

async function fetchPH(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.PH) {
    try {
      // Phil-JobNet — Department of Labor and Employment
      const data = await fetchJson(
        `https://philjobnet.gov.ph/api/jobs/search?keyword=${encodeURIComponent(q)}&page=1&pageSize=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId || job.postingId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.positionTitle || job.title || q,
          description: (job.jobDescription || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://philjobnet.gov.ph/job/${id}`,
          locationText: [job.city, job.region].filter(Boolean).join(', '),
          salaryText: job.salary ? `PHP ${job.salary}` : undefined,
          postedDate: job.datePosted || job.createdAt,
          deadline: job.closingDate || job.deadline,
          jobTypeText: job.employmentType || job.jobType,
          experienceText: job.experienceRequired,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.PH[0].q) console.warn(`[GovAPI:PH] Phil-JobNet API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:PH] Fetched ${results.length} jobs from Phil-JobNet`);
  return results;
}

// ─── VN: ViecLamVietNam (MOLISA) ────────────────────────────────

async function fetchVN(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.VN) {
    try {
      // ViecLamVietNam — Ministry of Labour
      const data = await fetchJson(
        `https://vieclamvietnam.gov.vn/api/job/search?keyword=${encodeURIComponent(q)}&page=1&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.data || data?.results || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.tieuDe || job.tenViTri || job.title || q,
          description: (job.moTa || job.yeuCau || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://vieclamvietnam.gov.vn/tin-tuyen-dung/${id}`,
          locationText: [job.diaDiem, job.tinhThanh].filter(Boolean).join(', '),
          salaryText: job.luong || job.mucLuong || (job.salary ? `${job.salary} VND` : undefined),
          postedDate: job.ngayDang || job.createdAt,
          deadline: job.hanNop || job.ngayHetHan,
          jobTypeText: job.hinhThuc || job.loaiHinhLamViec,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.VN[0].q) console.warn(`[GovAPI:VN] ViecLamVietNam API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:VN] Fetched ${results.length} jobs from ViecLamVietNam`);
  return results;
}

// ─── MY: MYFutureJobs (PERKESO/SOCSO) ──────────────────────────

async function fetchMY(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.MY) {
    try {
      // MYFutureJobs — Social Security Organisation (SOCSO/PERKESO)
      const data = await fetchJson(
        `https://www.myfuturejobs.gov.my/api/v1/jobs?keyword=${encodeURIComponent(q)}&page=1&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.data || data?.results || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId || job.vacancyId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.jawatanKosong || job.jobTitle || job.title || q,
          description: (job.keterangan || job.description || '').substring(0, 2000),
          sourceUrl: job.url || `https://www.myfuturejobs.gov.my/job/${id}`,
          locationText: [job.bandar, job.negeri].filter(Boolean).join(', '),
          salaryText: job.gaji ? `RM ${job.gaji}` : (job.salary ? `RM ${job.salary}` : undefined),
          postedDate: job.tarikhMula || job.postedDate,
          deadline: job.tarikhTutup || job.closingDate,
          jobTypeText: job.jenisPekerjaan || job.employmentType,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.MY[0].q) console.warn(`[GovAPI:MY] MYFutureJobs API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:MY] Fetched ${results.length} jobs from MYFutureJobs`);
  return results;
}

// ─── PK: Pakistan Employment Exchange ───────────────────────────

async function fetchPK(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.PK) {
    // Try NAVTTC (National Vocational & Technical Training Commission) and NJP
    try {
      const data = await fetchJson(
        `https://njp.gov.pk/api/jobs/search?keyword=${encodeURIComponent(q)}&page=1&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.jobs || data?.data || data?.results || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.jobId;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.title || job.jobTitle || job.positionTitle || q,
          description: (job.description || job.jobDescription || '').substring(0, 2000),
          sourceUrl: job.url || `https://njp.gov.pk/jobs/${id}`,
          locationText: [job.city, job.province].filter(Boolean).join(', '),
          salaryText: job.salary ? `PKR ${job.salary}` : undefined,
          postedDate: job.postedDate || job.createdAt,
          deadline: job.lastDate || job.deadline,
          jobTypeText: job.jobType || job.employmentType,
          experienceText: job.experience,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.PK[0].q) console.warn(`[GovAPI:PK] NJP API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:PK] Fetched ${results.length} jobs from NJP`);
  return results;
}

// ─── PT: IEFP net-emprego ───────────────────────────────────────

async function fetchPT(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.PT) {
    try {
      // IEFP — Instituto do Emprego e Formação Profissional
      const data = await fetchJson(
        `https://iefponline.iefp.pt/IEFP/api/ofertas?q=${encodeURIComponent(q)}&pagina=1&registosPorPagina=50`,
        { headers: { Accept: 'application/json' } },
      );
      const ofertas = data?.ofertas || data?.results || data?.data || [];
      for (const o of (Array.isArray(ofertas) ? ofertas : [])) {
        const id = o.id || o.codigoOferta || o.referencia;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: o.profissao || o.titulo || o.designacao || q,
          description: (o.descricaoFuncoes || o.requisitos || o.description || '').substring(0, 2000),
          sourceUrl: o.url || `https://iefponline.iefp.pt/IEFP/oferta/${id}`,
          locationText: [o.localidade, o.distrito].filter(Boolean).join(', '),
          salaryText: o.remuneracao || (o.salario ? `€${o.salario}` : undefined),
          postedDate: o.dataPublicacao || o.dataRegisto,
          deadline: o.dataValidade || o.dataLimite,
          jobTypeText: o.tipoContrato || o.tipoOferta,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.PT[0].q) console.warn(`[GovAPI:PT] IEFP API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:PT] Fetched ${results.length} jobs from IEFP`);
  return results;
}

// ─── ZA: ESSA (Employment Services of South Africa) ─────────────

async function fetchZA(): Promise<RawJobData[]> {
  const results: RawJobData[] = [];
  const seen = new Set<string>();

  for (const { q } of BLUE_COLLAR_QUERIES.ZA) {
    try {
      // ESSA — Department of Employment and Labour
      const data = await fetchJson(
        `https://essa.labour.gov.za/api/v1/opportunities/search?keyword=${encodeURIComponent(q)}&page=1&size=50`,
        { headers: { Accept: 'application/json' } },
      );
      const jobs = data?.opportunities || data?.jobs || data?.results || data?.data || [];
      for (const job of (Array.isArray(jobs) ? jobs : [])) {
        const id = job.id || job.opportunityId || job.referenceNumber;
        if (!id || seen.has(String(id))) continue;
        seen.add(String(id));
        results.push({
          title: job.positionTitle || job.title || job.jobTitle || q,
          description: (job.description || job.jobDescription || '').substring(0, 2000),
          sourceUrl: job.url || `https://essa.labour.gov.za/EssaOnline/WebJobs/ViewJobDescription?Id=${id}`,
          locationText: [job.city, job.province].filter(Boolean).join(', '),
          salaryText: job.salary ? `R ${job.salary}` : undefined,
          postedDate: job.postedDate || job.advertisedDate,
          deadline: job.closingDate || job.deadline,
          jobTypeText: job.employmentType || job.contractType,
        });
      }
    } catch (e) {
      if (q === BLUE_COLLAR_QUERIES.ZA[0].q) console.warn(`[GovAPI:ZA] ESSA API error: ${(e as Error).message}`);
    }
    await delay(API_DELAY_MS);
  }

  console.log(`[GovAPI:ZA] Fetched ${results.length} jobs from ESSA`);
  return results;
}

// ─── Main entry point ───────────────────────────────────────────────

const MARKET_HANDLERS: Partial<Record<Market, () => Promise<RawJobData[]>>> = {
  SE: fetchSE,   // Platsbanken — open, no auth
  DE: fetchDE,   // Jobbörse — open, API key 'jobboerse-jobsuche'
  RU: fetchRU,   // Trudvsem — open, no auth
  US: fetchUS,   // USAJobs — needs USAJOBS_API_KEY + USAJOBS_EMAIL
  FR: fetchFR,   // France Travail — needs FRANCE_TRAVAIL_CLIENT_ID/SECRET
  UK: fetchUK,   // DWP Find a Job — public search + GOV.UK fallback
  CA: fetchCA,   // Job Bank Canada — public search
  AU: fetchAU,   // Australian JobSearch — public search
  PL: fetchPL,   // CBOP — public search
  TR: fetchTR,   // İŞKUR — e-şube API + open data fallback
  NL: fetchNL,   // Werk.nl — UWV public search
  BR: fetchBR,   // Portal Emprega Brasil — SINE public search
  JP: fetchJP,   // HelloWork — public search
  IN: fetchIN,   // National Career Service — public search
  KR: fetchKR,   // WorkNet — needs WORKNET_API_KEY
  ES: fetchES,   // SEPE Empleate — public search
  IT: fetchIT,   // ANPAL/Cliclavoro — public search
  MX: fetchMX,   // SNE Portal del Empleo — public search
  CO: fetchCO,   // SPE Colombia — public search
  // 12 new markets
  EG: fetchEG,   // Ta3mal + Manpower Egypt
  SA: fetchSA,   // Jadarat (HRDF)
  AE: fetchAE,   // MOHRE UAE
  AR: fetchAR,   // Portal Empleo Argentina
  ID: fetchID,   // Karirhub Kemnaker
  TH: fetchTH,   // SmartJob DOE
  PH: fetchPH,   // Phil-JobNet DOLE
  VN: fetchVN,   // ViecLamVietNam MOLISA
  MY: fetchMY,   // MYFutureJobs PERKESO
  PK: fetchPK,   // NJP Pakistan
  PT: fetchPT,   // IEFP net-emprego
  ZA: fetchZA,   // ESSA Labour
};

/**
 * Fetch government job listings via official APIs.
 * Returns empty array for markets without API support.
 */
export async function fetchGovApiJobs(
  market: Market,
  _seedUrl?: string,
): Promise<RawJobData[]> {
  const handler = MARKET_HANDLERS[market];
  if (!handler) {
    console.log(`[GovAPI] No API handler for ${market}, falling back to HTML scraping`);
    return [];
  }

  try {
    return await handler();
  } catch (e) {
    console.error(`[GovAPI:${market}] Fatal error: ${(e as Error).message}`);
    return [];
  }
}

/** Check if a market has a government API handler */
export function hasGovApiHandler(market: Market): boolean {
  return market in MARKET_HANDLERS;
}
