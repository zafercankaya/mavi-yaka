/**
 * Fix sector assignments for existing job listings.
 * Re-runs detectSector on title+description and updates OTHER → correct sector.
 */
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sector keywords — must match normalize.ts SECTOR_KEYWORDS
const SECTOR_KEYWORDS = [
  { sector: 'LOGISTICS_TRANSPORTATION', keywords: [
    'logistics', 'transport', 'shipping', 'delivery', 'cargo', 'freight', 'warehouse', 'supply chain',
    'driver', 'truck driver', 'forklift', 'dock worker', 'dispatcher', 'courier', 'loader', 'picker packer',
    'lojistik', 'nakliye', 'kargo', 'depo', 'şoför', 'kurye',
    'logistik', 'spedition', 'lkw-fahrer', 'gabelstapler', 'kommissionierer',
    'motorista', 'empilhadeirista', 'estoquista', 'chofer', 'repartidor', 'almacenista',
    'chauffeur', 'cariste', 'manutentionnaire',
    'autista', 'carrellista', 'magazziniere',
  ]},
  { sector: 'MANUFACTURING', keywords: [
    'manufacturing', 'factory', 'production', 'assembly', 'industrial', 'machine operator', 'process worker',
    'üretim', 'fabrika', 'imalat', 'montaj', 'operatör',
    'produktion', 'fertigung', 'maschinenführer', 'produktionshelfer',
    'fabricación', 'fábrica', 'operador de producción',
    'fabrication', 'usine', 'opérateur',
    'fabbrica', 'produzione',
  ]},
  { sector: 'RETAIL', keywords: [
    'retail', 'store', 'shop', 'sales', 'cashier', 'merchandising', 'stock clerk', 'stocker',
    'perakende', 'mağaza', 'satış', 'kasiyer',
    'einzelhandel', 'verkäufer', 'comercio', 'tienda', 'vendedor',
  ]},
  { sector: 'CONSTRUCTION', keywords: [
    'construction', 'building', 'carpenter', 'mason', 'roofer', 'plumber', 'pipefitter',
    'painter', 'concrete', 'scaffolding', 'laborer', 'labourer', 'heavy equipment',
    'inşaat', 'şantiye', 'duvarcı', 'boyacı', 'tesisatçı',
    'bau', 'baustelle', 'maurer', 'zimmermann', 'klempner',
    'construcción', 'obra', 'albañil', 'carpintero', 'plomero',
    'bâtiment', 'chantier', 'maçon', 'menuisier', 'plombier',
    'edilizia', 'cantiere', 'muratore', 'idraulico',
  ]},
  { sector: 'FOOD_BEVERAGE', keywords: [
    'food', 'beverage', 'restaurant', 'catering', 'kitchen', 'bakery', 'cafe',
    'cook', 'chef', 'dishwasher', 'waiter', 'waitress', 'barista', 'bartender', 'butcher',
    'gıda', 'restoran', 'mutfak', 'aşçı', 'garson', 'kasap',
    'gastronomie', 'koch', 'bäcker', 'kellner',
    'cocinero', 'mesero', 'panadero',
    'cuisinier', 'boulanger', 'serveur',
    'cuoco', 'cameriere', 'pizzaiolo',
  ]},
  { sector: 'AUTOMOTIVE', keywords: [
    'automotive', 'automobile', 'car', 'vehicle', 'motor', 'mechanic', 'auto repair',
    'technician', 'tire', 'brake', 'engine',
    'otomotiv', 'tamirci',
    'kfz', 'mechaniker', 'werkstatt',
    'mecánico', 'taller',
    'mécanicien', 'garagiste',
    'meccanico', 'officina',
  ]},
  { sector: 'TEXTILE', keywords: [
    'textile', 'garment', 'apparel', 'clothing', 'sewing', 'tailor',
    'tekstil', 'konfeksiyon', 'dikiş', 'terzi',
  ]},
  { sector: 'MINING_ENERGY', keywords: [
    'mining', 'energy', 'oil', 'gas', 'power', 'electricity', 'solar', 'wind turbine',
    'madencilik', 'maden', 'enerji', 'petrol',
  ]},
  { sector: 'HEALTHCARE', keywords: [
    'healthcare', 'health', 'hospital', 'medical', 'clinic', 'nursing', 'caregiver',
    'nurse aide', 'orderly', 'dental',
    'sağlık', 'hastane', 'hemşire', 'hasta bakıcı',
    'krankenhaus', 'pflege', 'enfermero', 'infirmier',
  ]},
  { sector: 'HOSPITALITY_TOURISM', keywords: [
    'hotel', 'hospitality', 'tourism', 'resort', 'accommodation',
    'housekeeper', 'room attendant', 'bellboy', 'concierge',
    'otel', 'konaklama', 'turizm', 'kat görevlisi',
  ]},
  { sector: 'AGRICULTURE', keywords: [
    'agriculture', 'farming', 'farm', 'livestock', 'harvest', 'crop', 'greenhouse',
    'tarım', 'çiftlik', 'hayvancılık', 'seracılık',
  ]},
  { sector: 'SECURITY_SERVICES', keywords: [
    'security', 'guard', 'surveillance', 'patrol', 'watchman',
    'güvenlik', 'koruma', 'bekçi',
    'seguridad', 'vigilancia', 'sécurité', 'sicurezza',
  ]},
  { sector: 'FACILITY_MANAGEMENT', keywords: [
    'facility', 'cleaning', 'janitor', 'maintenance', 'housekeeping', 'cleaner', 'custodian',
    'groundskeeper', 'landscaper',
    'temizlik', 'hizmetli', 'bahçıvan',
    'reinigung', 'hausmeister', 'limpieza', 'jardinero', 'nettoyage', 'giardiniere',
  ]},
  { sector: 'METAL_STEEL', keywords: [
    'metal', 'steel', 'iron', 'welding', 'foundry', 'welder', 'blacksmith', 'sheet metal',
    'çelik', 'demir', 'kaynak', 'kaynakçı',
    'schweißer', 'soldador', 'soudeur', 'saldatore',
  ]},
  { sector: 'CHEMICALS_PLASTICS', keywords: [
    'chemical', 'plastic', 'polymer', 'rubber', 'petrochemical',
    'kimya', 'plastik',
  ]},
  { sector: 'ECOMMERCE_CARGO', keywords: [
    'ecommerce', 'e-commerce', 'fulfillment', 'packing', 'sorting',
    'e-ticaret', 'paketleme',
  ]},
  { sector: 'TELECOMMUNICATIONS', keywords: [
    'telecom', 'telecommunications', 'fiber', 'cable installer',
    'telekom', 'telekomünikasyon',
  ]},
];

function detectSector(text) {
  const lower = text.toLowerCase();
  let bestSector = null;
  let bestScore = 0;

  for (const { sector, keywords } of SECTOR_KEYWORDS) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSector = sector;
    }
  }

  return bestSector;
}

async function main() {
  // Get all OTHER sector jobs
  const jobs = await prisma.jobListing.findMany({
    where: { sector: 'OTHER', status: 'ACTIVE' },
    select: { id: true, title: true, description: true },
  });

  console.log(`Found ${jobs.length} jobs with sector=OTHER`);

  let updated = 0;
  const sectorCounts = {};

  for (const job of jobs) {
    const text = `${job.title} ${job.description || ''}`;
    const sector = detectSector(text);

    if (sector && sector !== 'OTHER') {
      await prisma.jobListing.update({
        where: { id: job.id },
        data: { sector },
      });
      updated++;
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;

      if (updated % 100 === 0) {
        console.log(`  Updated ${updated}...`);
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  console.log(`\nUpdated ${updated} / ${jobs.length} jobs`);
  console.log('\nSector distribution:');
  for (const [sector, count] of Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${sector}: ${count}`);
  }

  // Check remaining OTHER count
  const remaining = await prisma.jobListing.count({ where: { sector: 'OTHER', status: 'ACTIVE' } });
  console.log(`\nRemaining OTHER: ${remaining}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
