/**
 * gov-api.processor.ts — Government Job Portal API Processor
 *
 * Specialized processor for government employment agency APIs.
 * Each market has a specific handler that knows the API format.
 *
 * Supported markets:
 *   API (no auth):  SE (Platsbanken), DE (Arbeitsagentur), RU (Trudvsem)
 *   API (with key): US (USAJobs), FR (France Travail)
 *   Open Data:      PL (CBOP)
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
};

const MAX_RESULTS_PER_QUERY = 50;
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
    try {
      const data = await fetchJson(
        `https://jobsearch.api.jobtechdev.se/search?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS_PER_QUERY}`,
        { headers: { accept: 'application/json' } },
      );

      for (const hit of data.hits || []) {
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
    } catch (e) {
      console.warn(`[GovAPI:SE] Query "${q}" failed: ${(e as Error).message}`);
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
    try {
      const data = await fetchJson(
        `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?was=${encodeURIComponent(q)}&size=${MAX_RESULTS_PER_QUERY}`,
        { headers: { 'X-API-Key': 'jobboerse-jobsuche' } },
      );

      for (const job of data.stellenangebote || []) {
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
    } catch (e) {
      console.warn(`[GovAPI:DE] Query "${q}" failed: ${(e as Error).message}`);
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
  const data = await resp.json();
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
      const data = await resp.json();

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

// ─── Main entry point ───────────────────────────────────────────────

const MARKET_HANDLERS: Partial<Record<Market, () => Promise<RawJobData[]>>> = {
  SE: fetchSE,   // Platsbanken — open, no auth (~482 jobs)
  DE: fetchDE,   // Jobbörse — open, API key 'jobboerse-jobsuche' (~500 jobs)
  RU: fetchRU,   // Trudvsem — open, no auth (~121 jobs, slow)
  US: fetchUS,   // USAJobs — needs USAJOBS_API_KEY + USAJOBS_EMAIL
  FR: fetchFR,   // France Travail — needs FRANCE_TRAVAIL_CLIENT_ID/SECRET
  // UK, CA, AU, PL, TR — APIs require auth or endpoints not publicly available
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
