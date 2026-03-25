/**
 * bulk-import-france-travail.ts — Bulk Import from France Travail (Pôle Emploi) API
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-france-travail.ts
 *
 * API: https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search
 * - Auth: OAuth2 client_credentials
 *   - Token URL: https://entreprise.francetravail.io/connexion/oauth2/access_token?realm=/partenaire
 *   - Scope: api_offresdemploiv2 o2dsoffre
 * - Pagination: range=0-149 (max 150 per request, max offset 3000)
 * - Rate limit: ~3 req/sec
 *
 * Env vars: FRANCE_TRAVAIL_CLIENT_ID, FRANCE_TRAVAIL_CLIENT_SECRET
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_BASE = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search';
const TOKEN_URL = 'https://entreprise.pole-emploi.fr/connexion/oauth2/access_token?realm=/partenaire';
const RESULTS_PER_PAGE = 150; // API max is 150
const MAX_OFFSET = 3000; // API hard limit
const REQUEST_DELAY_MS = 350; // ~3 req/sec
const REQUEST_TIMEOUT_MS = 20_000;

const CLIENT_ID = process.env.FRANCE_TRAVAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/[æ]/g, 'ae').replace(/[œ]/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── OAuth2 Token ────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'Missing FRANCE_TRAVAIL_CLIENT_ID or FRANCE_TRAVAIL_CLIENT_SECRET env vars',
    );
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'api_offresdemploiv2 o2dsoffre',
  });

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OAuth2 token error: HTTP ${resp.status} — ${text.substring(0, 200)}`);
  }

  const data = await resp.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 1500) * 1000,
  };

  console.log(`  [AUTH] Token acquired, expires in ${data.expires_in}s`);
  return cachedToken.token;
}

// ─── Sector detection (French) ───────────────────────────────────────

function detectSector(title: string, employer?: string): Sector {
  const t = `${title} ${employer || ''}`.toLowerCase();
  if (/logistique|transport|chauffeur|livreur|coursier|magasinier|manutention|entrepos|camion|routier|colis/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/production|usine|fabrication|industri|opérateur|machin|montage|assemblage|cnc/i.test(t)) return 'MANUFACTURING';
  if (/vend|caisse|commerce|magasin|boutique|rayon|supermarché|hypermarché|détail/i.test(t)) return 'RETAIL';
  if (/bâtiment|maçon|charpent|couvreur|béton|travaux|terrassement|gros[- ]?œuvre|carreleur|plâtri|peintre.*bâtiment|échafaud|coffr/i.test(t)) return 'CONSTRUCTION';
  if (/cuisin|restaurant|boulang|pâtiss|bouch|traiteur|serveur|barman|commis|plonge|gastronomie/i.test(t)) return 'FOOD_BEVERAGE';
  if (/auto|mécani.*auto|carrossier|dépannage|garage|véhicule/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|coutur|confection|tailleur|tissage/i.test(t)) return 'TEXTILE';
  if (/mines|énergie|électricité|solaire|éolien|nucléaire|centrale/i.test(t)) return 'MINING_ENERGY';
  if (/soignant|infirm|aide.*domicile|ehpad|hôpital|clinique|santé|médical/i.test(t)) return 'HEALTHCARE';
  if (/hôtel|hébergement|tourisme|réception|femme de chambre|blanchisserie/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/agricol|jardinier|paysagiste|horticul|viticul|élevage|forestier|pêche/i.test(t)) return 'AGRICULTURE';
  if (/sécurité|surveillance|gardien|vigile|agent.*prévention/i.test(t)) return 'SECURITY_SERVICES';
  if (/nettoyage|entretien|propreté|hygiène|agent.*entretien|concierge|gardiennage/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/métal|acier|soudeur|soudure|chaudronn|tôl|fonderie|forg|usinage|fraiseur|tourneur/i.test(t)) return 'METAL_STEEL';
  if (/chimi|pharma|plastique|caoutchouc|peinture.*industriel|laborat/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/télécom|fibre|câbl|réseau.*techni/i.test(t)) return 'TELECOMMUNICATIONS';
  if (/plombier|électricien|chauffagiste|climatisation|frigoriste|sanitaire/i.test(t)) return 'CONSTRUCTION';
  return 'OTHER';
}

// ─── French blue-collar search queries ───────────────────────────────

const SEARCH_QUERIES = [
  // Logistique & Transport
  'manutentionnaire', 'cariste', 'magasinier', 'préparateur de commandes',
  'chauffeur', 'chauffeur poids lourd', 'livreur', 'coursier',
  'agent de quai', 'emballeur',
  // BTP & Construction
  'ouvrier', 'maçon', 'charpentier', 'couvreur', 'peintre bâtiment',
  'plombier', 'électricien', 'carreleur', 'plâtrier', 'coffreur',
  'manoeuvre', 'terrassier', 'conducteur engin', 'grutier',
  // Industrie & Production
  'opérateur', 'opérateur de production', 'conducteur de ligne',
  'soudeur', 'monteur', 'mécanicien', 'technicien maintenance',
  'usineur', 'tourneur', 'fraiseur', 'chaudronnier', 'tôlier',
  // Restauration & Alimentation
  'cuisinier', 'commis de cuisine', 'serveur', 'plongeur',
  'boulanger', 'pâtissier', 'boucher', 'traiteur', 'barman',
  // Nettoyage & Entretien
  'agent d\'entretien', 'agent de nettoyage', 'femme de ménage',
  'agent de propreté', 'nettoyage industriel',
  // Sécurité
  'agent de sécurité', 'gardien', 'vigile', 'agent de surveillance',
  // Espaces verts & Agriculture
  'jardinier', 'paysagiste', 'ouvrier agricole', 'agent d\'entretien des espaces verts',
  // Santé & Aide à domicile
  'aide-soignant', 'agent de service hospitalier', 'aide à domicile',
  'auxiliaire de vie',
  // Hôtellerie
  'femme de chambre', 'valet de chambre', 'réceptionniste hôtel',
  'agent hôtelier',
  // Commerce (opérationnel)
  'employé libre service', 'caissier', 'manutention',
  // Divers métiers manuels
  'menuisier', 'serrurier', 'vitrier', 'couturier',
  'installateur', 'dépanneur', 'frigoriste', 'chauffagiste',
];

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'FR', name: { contains: 'France Travail' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'France Travail', market: 'FR' },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `france-travail-gov-fr-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'France Travail',
          slug: uniqueSlug,
          market: 'FR',
          sector: 'OTHER',
          websiteUrl: 'https://www.francetravail.fr',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'France Travail Job Listings',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'FR',
        companyId: company.id,
        seedUrls: ['https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── API fetch ───────────────────────────────────────────────────────

async function fetchJobs(query: string, rangeStart: number): Promise<{ results: any[]; total: number }> {
  const token = await getAccessToken();
  const rangeEnd = rangeStart + RESULTS_PER_PAGE - 1;

  const params = new URLSearchParams({
    motsCles: query,
    range: `${rangeStart}-${rangeEnd}`,
  });

  const url = `${API_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (resp.status === 206 || resp.ok) {
      // 206 = Partial Content (normal for paginated results)
      const data = await resp.json();
      const contentRange = resp.headers.get('Content-Range') || '';
      // Content-Range: offres 0-149/1234
      const totalMatch = contentRange.match(/\/(\d+)/);
      const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
      const results = data.resultats || [];
      return { results, total };
    }

    if (resp.status === 204) {
      // No content — no results for this query
      return { results: [], total: 0 };
    }

    throw new Error(`HTTP ${resp.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Salary parsing ──────────────────────────────────────────────────

function parseSalary(salaire: any): string | null {
  if (!salaire) return null;
  const parts: string[] = [];
  if (salaire.libelle) parts.push(salaire.libelle);
  if (salaire.commentaire) parts.push(salaire.commentaire);
  const text = parts.join(' — ').substring(0, 200);
  return text || null;
}

// ─── Main import ─────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  console.log(`\n🇫🇷 Mavi Yaka — France Travail Bulk Import`);
  console.log(`Queries: ${SEARCH_QUERIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('ERROR: Set FRANCE_TRAVAIL_CLIENT_ID and FRANCE_TRAVAIL_CLIENT_SECRET env vars');
    process.exit(1);
  }

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const query of SEARCH_QUERIES) {
    let rangeStart = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const { results, total } = await fetchJobs(query, rangeStart);

        stats.fetched += results.length;

        for (const offre of results) {
          const offreId = offre.id || '';
          if (!offreId || seen.has(offreId)) { stats.skipped++; continue; }
          seen.add(offreId);

          const title = offre.intitule || query;
          const employer = offre.entreprise?.nom || '';
          const description = offre.description || '';

          // Source URL
          const sourceUrl = offre.origineOffre?.urlOrigine
            || `https://candidat.francetravail.fr/offres/recherche/detail/${offreId}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`ft:${offreId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          // Location
          const lieu = offre.lieuTravail || {};
          const city = lieu.libelle || null;
          const state = lieu.libelle ? (lieu.libelle.split(' - ')[1] || null) : null;
          const lat = lieu.latitude ? parseFloat(lieu.latitude) : null;
          const lon = lieu.longitude ? parseFloat(lieu.longitude) : null;

          // Full title with employer
          const fullTitle = employer ? `${title} — ${employer}` : title;

          // Blue-collar filter
          const romeLabel = offre.appellationlibelle || offre.romeLibelle || '';
          const searchText = `${title} ${romeLabel}`;
          if (!isBlueCollar(searchText, description)) {
            stats.skipped++;
            continue;
          }

          // Salary
          const salary = parseSalary(offre.salaire);

          // Posted date
          const postedDate = offre.dateCreation
            ? new Date(offre.dateCreation) : null;

          // Build description
          const descParts: string[] = [];
          if (description) descParts.push(description);
          if (romeLabel) descParts.push(`Métier: ${romeLabel}`);
          if (employer) descParts.push(`Employeur: ${employer}`);
          if (city) descParts.push(`Lieu: ${city}`);
          if (offre.typeContrat) descParts.push(`Contrat: ${offre.typeContratLibelle || offre.typeContrat}`);
          if (offre.experienceLibelle) descParts.push(`Expérience: ${offre.experienceLibelle}`);
          if (salary) descParts.push(`Salaire: ${salary}`);

          batch.push({
            title: fullTitle.substring(0, 500),
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'FR' as Market,
            city: city?.substring(0, 200) || null,
            state: state?.substring(0, 200) || null,
            latitude: lat,
            longitude: lon,
            sector: detectSector(title, employer),
            salary: salary?.substring(0, 200) || null,
            description: descParts.join('\n\n').substring(0, 5000) || null,
            postedDate,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        // Pagination: API max offset is 3000
        const nextStart = rangeStart + RESULTS_PER_PAGE;
        hasMore = results.length === RESULTS_PER_PAGE && nextStart < MAX_OFFSET && nextStart < total;
        rangeStart = nextStart;

        await delay(REQUEST_DELAY_MS);

        if (results.length > 0 && rangeStart === RESULTS_PER_PAGE) {
          console.log(`  "${query}": ${total.toLocaleString()} total, fetching...`);
        }
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  Rate limited, waiting 60s...`);
          await delay(60_000);
        } else if (msg.includes('401') || msg.includes('403')) {
          console.warn(`  Auth error, refreshing token...`);
          cachedToken = null;
          await delay(2_000);
        } else {
          console.warn(`  "${query}" offset=${rangeStart}: ${msg.substring(0, 100)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Unique: ${seen.size.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

main().catch(console.error);
