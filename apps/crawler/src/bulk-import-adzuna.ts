/**
 * bulk-import-adzuna.ts — Bulk Import from Adzuna API (18 countries)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-adzuna.ts [market|ALL]
 * Example: npx ts-node --transpile-only src/bulk-import-adzuna.ts US
 *          npx ts-node --transpile-only src/bulk-import-adzuna.ts ALL
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const ADZUNA_APP_ID = '0c703aa9';
const ADZUNA_APP_KEY = '101c85d3d6493adf7544e427be6c9118';
const RESULTS_PER_PAGE = 50; // Adzuna max
const MAX_PAGES = 50; // 50 pages × 50 = 2,500 per keyword
const REQUEST_DELAY_MS = 250;
const REQUEST_TIMEOUT_MS = 20_000;

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
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Sector detection (multilingual) ─────────────────────────────────

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|lager|logist|driver|chauffeur|courier|delivery|shipping|freight|forklift|truck|postal|packer/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|fabrik|usine|fábrica|produktion|operario|operador/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop assistant|vendeur|verkäuf|cajero|loja|einzelhandel|supermarket/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|bauarbeiter|maçon|albañil|pedreiro/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista|cuisinier|cocinero|cozinheiro/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop|kfz|mécanicien|mecánico|mecânico/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment|confection|costur/i.test(t)) return 'TEXTILE';
  if (/mining|energy|solar|wind|oil|gas|electricity|bergbau|énergie|energía|mineração/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|healthcare|hospital|care|carer|pflege|infirmier|enfermero|enfermeiro|clinic/i.test(t)) return 'HEALTHCARE';
  if (/hotel|hospitality|housekeeper|tourism|reception|concierge|chambre|camarero|hotelaria/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agriculture|garden|harvest|landscap|agri|jardinier|agricultor|agrícola/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|bouncer|wachschutz|sécurité|seguridad|segurança|vigilante/i.test(t)) return 'SECURITY_SERVICES';
  if (/cleaning|janitor|facility|maintenance|caretaker|hausmeis|nettoyage|limpieza|limpeza/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metal|steel|weld|smith|cnc|machin|foundry|schweiß|soudeur|soldador|torneiro/i.test(t)) return 'METAL_STEEL';
  if (/chemi|pharma|plastic|rubber|paint|labor|chimie|químic/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/e-commerce|parcel|package|last.mile/i.test(t)) return 'ECOMMERCE_CARGO';
  if (/telecom|cable|fiber|network|antenna/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Market configs ──────────────────────────────────────────────────

interface MarketConfig {
  adzunaCode: string;
  market: Market;
  keywords: string[];
}

const MARKET_CONFIGS: MarketConfig[] = [
  {
    adzunaCode: 'us', market: 'US',
    keywords: [
      // Warehouse & Logistics
      'warehouse worker', 'forklift operator', 'truck driver', 'delivery driver', 'package handler',
      'dock worker', 'shipping receiver', 'order picker', 'material handler', 'CDL driver',
      // Cleaning & Facility
      'janitor', 'housekeeper', 'custodian', 'groundskeeper', 'maintenance technician',
      'building maintenance', 'window cleaner', 'pest control', 'HVAC technician',
      // Food & Hospitality
      'cook', 'dishwasher', 'food service', 'baker', 'butcher', 'line cook', 'prep cook',
      'barista', 'busser', 'hotel housekeeper', 'laundry attendant',
      // Retail & Cashier
      'cashier', 'stock clerk', 'store associate', 'grocery stocker', 'retail associate',
      // Construction & Trades
      'construction worker', 'laborer', 'electrician', 'plumber', 'welder', 'carpenter',
      'roofer', 'painter', 'concrete worker', 'ironworker', 'pipefitter', 'mason',
      'drywall installer', 'insulation worker', 'tile setter', 'glazier', 'scaffolder',
      // Manufacturing & Machine
      'machine operator', 'assembly line', 'CNC operator', 'press operator', 'quality inspector',
      'production worker', 'packaging operator', 'meatpacker',
      // Auto & Mechanic
      'mechanic', 'auto technician', 'diesel mechanic', 'tire technician', 'body shop',
      // Healthcare Support
      'nursing aide', 'home health aide', 'caregiver', 'patient care technician',
      // Security & Other
      'security guard', 'landscaper', 'mover', 'farmworker', 'animal caretaker',
      'garbage collector', 'recycling worker', 'solar installer', 'cable technician',
    ],
  },
  {
    adzunaCode: 'gb', market: 'UK',
    keywords: [
      // Warehouse & Logistics
      'warehouse operative', 'forklift driver', 'hgv driver', 'van driver', 'picker packer',
      'goods in', 'despatch', 'parcel sorter', 'delivery driver', 'courier',
      // Cleaning & Facility
      'cleaner', 'caretaker', 'groundskeeper', 'maintenance engineer', 'handyman',
      'window cleaner', 'pest control',
      // Food & Hospitality
      'kitchen porter', 'chef', 'commis chef', 'baker', 'butcher', 'barista',
      'waiting staff', 'bar staff', 'hotel housekeeper', 'kitchen assistant',
      // Construction & Trades
      'labourer', 'bricklayer', 'plumber', 'electrician', 'welder', 'scaffolder',
      'roofer', 'painter decorator', 'plasterer', 'tiler', 'joiner', 'glazier',
      'groundworker', 'steel fixer', 'demolition', 'CSCS card',
      // Manufacturing
      'factory worker', 'machine operator', 'production operative', 'CNC operator',
      'packer', 'quality inspector', 'assembly worker',
      // Auto & Mechanic
      'mechanic', 'MOT tester', 'tyre fitter', 'vehicle technician', 'body shop',
      // Healthcare & Care
      'care assistant', 'support worker', 'healthcare assistant', 'carer',
      // Security & Other
      'security officer', 'door supervisor', 'farm worker', 'refuse collector',
      'postman', 'bin man', 'landscape gardener', 'tree surgeon',
    ],
  },
  {
    adzunaCode: 'de', market: 'DE',
    keywords: [
      // Lager & Logistik
      'Lagerarbeiter', 'Staplerfahrer', 'Berufskraftfahrer', 'Kommissionierer', 'Lkw Fahrer',
      'Kurierfahrer', 'Paketzusteller', 'Versandmitarbeiter', 'Lagerhelfer',
      // Reinigung & Gebäude
      'Reinigungskraft', 'Hausmeister', 'Gebäudereiniger', 'Facility Manager',
      // Gastronomie
      'Koch', 'Küchenhilfe', 'Kellner', 'Bäcker', 'Fleischer', 'Konditor',
      'Servicekraft', 'Spülkraft', 'Barkeeper',
      // Bau & Handwerk
      'Bauarbeiter', 'Dachdecker', 'Maler', 'Maurer', 'Zimmermann', 'Fliesenleger',
      'Gerüstbauer', 'Estrichleger', 'Betonbauer', 'Straßenbauer', 'Tiefbauer',
      // Produktion & Maschine
      'Produktionsmitarbeiter', 'Maschinenführer', 'CNC Fräser', 'CNC Dreher',
      'Produktionshelfer', 'Verpackungsmitarbeiter', 'Montierer',
      // Metall & Schweißen
      'Schweißer', 'Schlosser', 'Zerspanungsmechaniker', 'Industriemechaniker',
      'Werkzeugmechaniker', 'Metallbauer', 'Dreher',
      // Elektro & Technik
      'Elektriker', 'Elektroniker', 'Monteur', 'Mechatroniker', 'Kältetechniker',
      'Anlagenmechaniker', 'Heizungsmonteur',
      // Pflege & Betreuung
      'Altenpfleger', 'Pflegehelfer', 'Krankenpfleger', 'Betreuungskraft',
      // Sicherheit & Sonstige
      'Sicherheitsmitarbeiter', 'Gärtner', 'Landschaftsgärtner', 'Tierpfleger',
      'Müllwerker', 'Straßenreiniger', 'Forstarbeiter',
    ],
  },
  {
    adzunaCode: 'fr', market: 'FR',
    keywords: [
      // Logistique & Entrepôt
      'manutentionnaire', 'cariste', 'chauffeur poids lourd', 'préparateur commandes',
      'magasinier', 'livreur', 'agent logistique', 'emballeur',
      // Nettoyage & Entretien
      'agent entretien', 'agent propreté', 'femme ménage', 'gardien immeuble',
      // Restauration & Hôtellerie
      'cuisinier', 'serveur', 'boulanger', 'boucher', 'pâtissier', 'commis cuisine',
      'plongeur', 'barman', 'femme chambre', 'valet chambre',
      // BTP & Construction
      'maçon', 'couvreur', 'peintre bâtiment', 'plombier', 'électricien', 'menuisier',
      'charpentier', 'carreleur', 'plâtrier', 'ferronnier', 'coffreur', 'grutier',
      'conducteur engins', 'manoeuvre',
      // Industrie & Production
      'ouvrier production', 'opérateur machine', 'agent fabrication', 'conditionneur',
      'soudeur', 'monteur', 'tourneur', 'fraiseur', 'chaudronnier',
      // Mécanique
      'mécanicien', 'mécanicien automobile', 'carrossier', 'technicien maintenance',
      // Santé & Aide
      'aide soignant', 'aide domicile', 'auxiliaire vie', 'brancardier',
      // Sécurité & Autres
      'agent sécurité', 'jardinier', 'paysagiste', 'agent déchets', 'éboueur',
      'conducteur bus', 'chauffeur taxi', 'agriculteur', 'ouvrier agricole',
    ],
  },
  {
    adzunaCode: 'br', market: 'BR',
    keywords: [
      // Logística & Armazém
      'auxiliar logística', 'operador empilhadeira', 'motorista', 'entregador',
      'separador', 'conferente', 'auxiliar expedição', 'estoquista',
      // Limpeza & Manutenção
      'auxiliar limpeza', 'zelador', 'porteiro', 'faxineiro', 'jardineiro',
      // Alimentação & Hotelaria
      'cozinheiro', 'garçom', 'padeiro', 'açougueiro', 'confeiteiro',
      'auxiliar cozinha', 'barman', 'camareira', 'copeiro',
      // Construção Civil
      'pedreiro', 'pintor', 'servente obras', 'carpinteiro', 'armador',
      'encanador', 'azulejista', 'gesseiro', 'impermeabilizador',
      // Indústria & Produção
      'operador produção', 'operador máquina', 'auxiliar produção', 'embalador',
      'soldador', 'montador', 'torneiro', 'fresador',
      // Elétrica & Técnico
      'eletricista', 'mecânico', 'mecânico industrial', 'técnico manutenção',
      'serralheiro', 'funileiro', 'caldeireiro',
      // Saúde & Cuidados
      'cuidador', 'auxiliar enfermagem', 'atendente hospitalar',
      // Segurança & Outros
      'vigilante', 'segurança patrimonial', 'agricultor', 'operador colheitadeira',
      'cobrador ônibus', 'motorista ônibus', 'reciclador',
    ],
  },
  {
    adzunaCode: 'mx', market: 'MX',
    keywords: [
      // Logística & Almacén
      'almacenista', 'montacarguista', 'chofer', 'repartidor', 'empacador',
      'auxiliar almacén', 'operador logístico', 'estibador',
      // Limpieza & Mantenimiento
      'auxiliar limpieza', 'intendente', 'jardinero', 'velador', 'conserje',
      // Alimentos & Hotelería
      'cocinero', 'mesero', 'panadero', 'carnicero', 'tortillero',
      'ayudante cocina', 'barman', 'camarista', 'lavalozas',
      // Construcción
      'albañil', 'pintor', 'plomero', 'electricista', 'carpintero', 'herrero',
      'yesero', 'impermeabilizador', 'fierrero', 'ayudante obra',
      // Producción & Manufactura
      'operador producción', 'operador maquinaria', 'ayudante general',
      'obrero', 'soldador', 'mecánico industrial', 'empaquetador',
      // Mecánica
      'mecánico', 'mecánico automotriz', 'técnico mantenimiento', 'hojalatero',
      // Seguridad & Otros
      'guardia seguridad', 'vigilante', 'agricultor', 'jornalero',
      'conductor camión', 'operador grúa', 'barrendero',
    ],
  },
  {
    adzunaCode: 'ca', market: 'CA',
    keywords: [
      // Warehouse & Logistics
      'warehouse worker', 'forklift operator', 'truck driver', 'delivery driver',
      'order picker', 'shipping receiver', 'material handler', 'dock worker',
      // Cleaning & Facility
      'janitor', 'housekeeper', 'caretaker', 'groundskeeper', 'maintenance worker',
      // Food & Hospitality
      'cook', 'dishwasher', 'baker', 'butcher', 'line cook', 'kitchen helper',
      'barista', 'hotel housekeeper', 'laundry attendant',
      // Construction & Trades
      'construction labourer', 'electrician', 'plumber', 'welder', 'carpenter',
      'roofer', 'painter', 'ironworker', 'concrete finisher', 'scaffolder',
      'heavy equipment operator', 'millwright',
      // Manufacturing
      'machine operator', 'assembly worker', 'production worker', 'CNC operator',
      'quality inspector', 'packaging worker',
      // Auto & Mechanic
      'mechanic', 'auto technician', 'heavy duty mechanic', 'body shop',
      // Healthcare Support
      'personal support worker', 'care aide', 'nursing aide',
      // Security & Other
      'security guard', 'landscaper', 'farm worker', 'arborist', 'mover',
      'garbage collector', 'snow removal', 'cable technician',
    ],
  },
  {
    adzunaCode: 'es', market: 'ES',
    keywords: [
      // Logística & Almacén
      'mozo almacén', 'carretillero', 'conductor', 'repartidor', 'empaquetador',
      'preparador pedidos', 'auxiliar logístico', 'estibador',
      // Limpieza & Mantenimiento
      'limpiador', 'conserje', 'mantenimiento edificios', 'jardinero',
      // Restauración & Hostelería
      'cocinero', 'camarero', 'panadero', 'carnicero', 'pastelero',
      'pinche cocina', 'friegaplatos', 'barman', 'camarera pisos',
      // Construcción
      'albañil', 'pintor', 'fontanero', 'electricista', 'carpintero',
      'soldador', 'ferrallista', 'encofrador', 'yesero', 'cristalero',
      'gruista', 'peón construcción',
      // Industria & Producción
      'operario producción', 'operario fábrica', 'empacador', 'montador',
      'tornero', 'fresador', 'calderero', 'soldador industrial',
      // Mecánica
      'mecánico', 'mecánico automóvil', 'chapista', 'técnico mantenimiento',
      // Seguridad & Otros
      'vigilante seguridad', 'peón', 'jornalero', 'agricultor',
      'conductor autobús', 'barrendero', 'recolector',
    ],
  },
  {
    adzunaCode: 'au', market: 'AU',
    keywords: [
      // Warehouse & Logistics
      'warehouse worker', 'forklift driver', 'truck driver', 'delivery driver',
      'picker packer', 'storeperson', 'dock hand', 'courier',
      // Cleaning & Facility
      'cleaner', 'groundskeeper', 'maintenance worker', 'handyman', 'caretaker',
      // Food & Hospitality
      'cook', 'kitchen hand', 'baker', 'butcher', 'barista', 'chef',
      'food and beverage', 'hotel housekeeper', 'dishwasher',
      // Construction & Trades
      'labourer', 'electrician', 'plumber', 'welder', 'carpenter', 'roofer',
      'painter', 'concreter', 'scaffolder', 'steel fixer', 'bricklayer',
      'heavy equipment operator', 'crane operator', 'rigger', 'boilermaker',
      // Manufacturing
      'machine operator', 'factory worker', 'production worker', 'packer',
      'CNC operator', 'quality inspector', 'process worker',
      // Auto & Mechanic
      'mechanic', 'diesel fitter', 'panel beater', 'auto electrician',
      // Healthcare & Care
      'aged care worker', 'disability support worker', 'nursing assistant',
      // Security & Other
      'security officer', 'landscaper', 'farmhand', 'fruit picker',
      'station hand', 'tree lopper', 'pest controller',
    ],
  },
  {
    adzunaCode: 'in', market: 'IN',
    keywords: [
      // Warehouse & Logistics
      'warehouse helper', 'driver', 'delivery boy', 'loader', 'packer',
      'forklift operator', 'godown keeper', 'material handler', 'courier boy',
      // Cleaning & Facility
      'cleaner', 'housekeeping', 'sweeper', 'office boy', 'peon', 'watchman',
      // Food & Hospitality
      'cook', 'kitchen helper', 'tandoor chef', 'baker', 'waiter',
      'room attendant', 'steward', 'dishwasher',
      // Construction & Trades
      'construction worker', 'mason', 'painter', 'plumber', 'electrician',
      'welder', 'carpenter', 'fitter', 'bar bender', 'scaffolder', 'helper',
      'crane operator', 'tile mason', 'shuttering carpenter',
      // Manufacturing
      'factory worker', 'machine operator', 'production operator', 'assembly operator',
      'CNC operator', 'packaging helper', 'store keeper',
      // Auto & Mechanic
      'mechanic', 'auto mechanic', 'diesel mechanic', 'motor winder',
      // Healthcare & Care
      'ward boy', 'nursing assistant', 'patient attendant',
      // Security & Other
      'security guard', 'gardener', 'farm labourer', 'dairy worker',
      'cable technician', 'lineman', 'pump operator',
    ],
  },
  {
    adzunaCode: 'it', market: 'IT',
    keywords: [
      // Logistica & Magazzino
      'magazziniere', 'carrellista', 'autista', 'corriere', 'facchino',
      'addetto spedizioni', 'mulettista', 'picker',
      // Pulizia & Manutenzione
      'addetto pulizie', 'portiere', 'giardiniere', 'manutentore',
      // Ristorazione & Ospitalità
      'cuoco', 'cameriere', 'panettiere', 'macellaio', 'pasticciere',
      'aiuto cuoco', 'lavapiatti', 'barista', 'cameriera ai piani',
      // Edilizia & Costruzioni
      'muratore', 'imbianchino', 'idraulico', 'elettricista', 'carpentiere',
      'saldatore', 'ferraiolo', 'piastrellista', 'cartongessista',
      'gruista', 'manovale', 'operaio edile',
      // Industria & Produzione
      'operaio produzione', 'operatore macchina', 'addetto confezionamento',
      'montatore', 'tornitore', 'fresatore', 'saldatore industriale',
      // Meccanica
      'meccanico', 'meccanico auto', 'carrozziere', 'manutentore meccanico',
      // Sicurezza & Altro
      'guardia giurata', 'addetto sicurezza', 'operaio agricolo', 'bracciante',
      'autista bus', 'netturbino', 'spazzino',
    ],
  },
  {
    adzunaCode: 'nl', market: 'NL',
    keywords: [
      // Magazijn & Logistiek
      'magazijnmedewerker', 'heftruckchauffeur', 'vrachtwagenchauffeur', 'orderpicker',
      'inpakker', 'bezorger', 'koerier', 'expeditiemedewerker',
      // Schoonmaak & Onderhoud
      'schoonmaker', 'conciërge', 'onderhoudsmonteur', 'tuinman', 'glazenwasser',
      // Horeca
      'kok', 'kelner', 'bakker', 'slager', 'barista', 'keukenhulp',
      'afwasser', 'bediening', 'kamermeisje',
      // Bouw & Techniek
      'bouwvakker', 'schilder', 'loodgieter', 'elektricien', 'timmerman',
      'lasser', 'metselaar', 'dakdekker', 'tegelzetter', 'stukadoor',
      'betonvlechter', 'kraanmachinist', 'grondwerker',
      // Productie & Industrie
      'productiemedewerker', 'machine operator', 'inpakmedewerker', 'monteur',
      'CNC operator', 'kwaliteitscontroleur', 'assemblagemedewerker',
      // Techniek
      'monteur', 'automonteur', 'installatiemonteur', 'servicemonteur',
      // Beveiliging & Overig
      'beveiliger', 'hovenier', 'chauffeur', 'vuilnisman', 'postbode',
      'agrarisch medewerker', 'melkveehouder',
    ],
  },
  {
    adzunaCode: 'pl', market: 'PL',
    keywords: [
      // Magazyn & Logistyka
      'magazynier', 'operator wózka', 'kierowca', 'dostawca', 'pakowacz',
      'kompletowacz', 'sortowacz', 'spedytor',
      // Sprzątanie & Utrzymanie
      'sprzątaczka', 'konserwator', 'ogrodnik', 'dozorca', 'szatniarz',
      // Gastronomia & Hotelarstwo
      'kucharz', 'kelner', 'piekarz', 'rzeźnik', 'cukiernik',
      'pomoc kuchenna', 'barman', 'pokojówka', 'zmywak',
      // Budownictwo
      'murarz', 'malarz', 'hydraulik', 'elektryk', 'cieśla',
      'spawacz', 'dekarz', 'glazurnik', 'tynkarz', 'zbrojarz',
      'operator koparki', 'robotnik budowlany', 'pomocnik',
      // Produkcja & Przemysł
      'pracownik produkcji', 'operator maszyn', 'monter', 'tokarz', 'frezer',
      'ślusarz', 'lakiernik', 'pakowacz', 'kontroler jakości',
      // Mechanika
      'mechanik', 'mechanik samochodowy', 'blacharz', 'wulkanizator',
      // Ochrona & Inne
      'ochroniarz', 'pracownik gospodarczy', 'rolnik', 'leśnik',
      'kierowca autobusu', 'śmieciarz', 'instalator',
    ],
  },
  {
    adzunaCode: 'za', market: 'ZA',
    keywords: [
      // Warehouse & Logistics
      'warehouse worker', 'forklift operator', 'driver', 'delivery driver',
      'picker packer', 'dispatch clerk', 'freight handler', 'courier',
      // Cleaning & Facility
      'cleaner', 'general worker', 'groundsman', 'maintenance worker', 'handyman',
      // Food & Hospitality
      'cook', 'chef', 'baker', 'butcher', 'waiter', 'kitchen assistant',
      'barista', 'room attendant', 'dishwasher',
      // Construction & Trades
      'builder', 'bricklayer', 'painter', 'plumber', 'electrician',
      'welder', 'carpenter', 'tiler', 'roofer', 'scaffolder',
      'plant operator', 'construction labourer',
      // Manufacturing & Mining
      'machine operator', 'factory worker', 'production worker', 'packer',
      'boilermaker', 'fitter and turner', 'miner', 'drill operator',
      // Auto & Mechanic
      'mechanic', 'diesel mechanic', 'panel beater', 'auto electrician',
      // Healthcare & Care
      'caregiver', 'nursing assistant', 'home based carer',
      // Security & Other
      'security guard', 'security officer', 'gardener', 'farmworker',
      'housekeeper', 'labourer', 'petrol attendant', 'refuse collector',
    ],
  },
  {
    adzunaCode: 'at', market: 'DE', // Austria → DE market (German-speaking)
    keywords: [
      'Lagerarbeiter', 'Staplerfahrer', 'Berufskraftfahrer', 'Reinigungskraft',
      'Koch', 'Produktionsmitarbeiter', 'Elektriker', 'Schweißer', 'Monteur',
      'Bauarbeiter', 'Installateur', 'Maler', 'Dachdecker', 'Schlosser',
      'Kommissionierer', 'Kellner', 'Bäcker', 'Fleischer', 'Altenpfleger',
      'Maurer', 'Zimmerer', 'Spengler', 'Fliesenleger', 'Gerüstbauer',
    ],
  },
  {
    adzunaCode: 'ch', market: 'DE', // Switzerland → DE market
    keywords: [
      'Lagerarbeiter', 'Staplerfahrer', 'Chauffeur', 'Reinigungskraft',
      'Koch', 'Produktionsmitarbeiter', 'Elektriker', 'Schweisser', 'Monteur',
      'Bauarbeiter', 'Sanitärinstallateur', 'Maler', 'Dachdecker', 'Schlosser',
      'Kommissionierer', 'Serviceangestellter', 'Bäcker', 'Metzger', 'Pflegehelfer',
      'Maurer', 'Zimmermann', 'Spengler', 'Plattenleger', 'Landschaftsgärtner',
    ],
  },
  {
    adzunaCode: 'sg', market: 'MY', // Singapore → MY market
    keywords: [
      'warehouse worker', 'driver', 'cleaner', 'cook', 'factory worker',
      'security guard', 'packer', 'mechanic', 'electrician', 'labourer',
      'delivery rider', 'kitchen assistant', 'technician', 'welder',
      'production operator', 'forklift operator', 'landscaper', 'housekeeper',
      'plumber', 'construction worker', 'painter', 'aircon technician',
    ],
  },
  {
    adzunaCode: 'nz', market: 'AU', // NZ → AU market
    keywords: [
      'warehouse worker', 'truck driver', 'cleaner', 'cook', 'labourer',
      'electrician', 'plumber', 'mechanic', 'farmhand', 'factory worker',
      'forklift operator', 'picker packer', 'builder', 'painter', 'welder',
      'scaffolder', 'roofer', 'landscaper', 'security guard', 'fruit picker',
      'dairy farm worker', 'tractor driver', 'fencer',
    ],
  },
];

// ─── Stats ───────────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

// ─── Source lookup/creation ──────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `adzuna-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  // Find existing Adzuna source
  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Adzuna' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    // Find or create Adzuna company for this market
    let company = await prisma.company.findFirst({
      where: { name: 'Adzuna', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Adzuna',
          slug: `adzuna-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.adzuna.com',
        },
      });
    }

    // Create CrawlSource
    const created = await prisma.crawlSource.create({
      data: {
        name: `Adzuna ${market} Job Listings`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: [`https://api.adzuna.com/v1/api/jobs/${market.toLowerCase()}/search`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Import for a single market ─────────────────────────────────────

async function importMarket(config: MarketConfig, stats: ImportStats): Promise<number> {
  const source = await getOrCreateSource(config.market);
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of config.keywords) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${config.adzunaCode}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what=${encodeURIComponent(keyword)}&results_per_page=${RESULTS_PER_PAGE}&content-type=application/json`;
        const data = await fetchJson(url);

        const results = data.results || [];
        stats.fetched += results.length;

        for (const job of results) {
          const id = String(job.id || '');
          if (!id || seen.has(id)) { stats.skipped++; continue; }
          seen.add(id);

          const title = job.title || keyword;
          const sourceUrl = job.redirect_url || `https://www.adzuna.com/details/${id}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`adzuna:${config.adzunaCode}:${id}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const city = job.location?.area?.slice(-1)?.[0] || null;
          const state = job.location?.area?.slice(-2)?.[0] || null;
          const lat = job.latitude || null;
          const lon = job.longitude || null;

          // Blue-collar filter — reject white-collar jobs
          const desc = job.description?.substring(0, 5000) || null;
          if (!isBlueCollar(title, desc)) {
            stats.skipped++;
            continue;
          }

          batch.push({
            title,
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: config.market,
            city,
            state,
            latitude: lat,
            longitude: lon,
            sector: detectSector(title, desc),
            description: desc,
            postedDate: job.created ? new Date(job.created) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 1000) {
            const result = await flushBatch(batch);
            stats.inserted += result.inserted;
            stats.updated += result.updated;
            batch = [];
          }
        }

        const totalAvailable = data.count || 0;
        hasMore = results.length === RESULTS_PER_PAGE && page < MAX_PAGES && (page * RESULTS_PER_PAGE) < totalAvailable;
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          // Rate limited — wait and retry
          console.warn(`  [${config.adzunaCode.toUpperCase()}] Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  [${config.adzunaCode.toUpperCase()}] "${keyword}" p${page}: ${msg.substring(0, 80)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result.inserted;
    stats.updated += result.updated;
  }

  return seen.size;
}

// ─── Batch upsert ────────────────────────────────────────────────────

async function flushBatch(batch: any[]): Promise<{ inserted: number; updated: number }> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  return flushBatchUpsert(prisma, batch);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const target = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🔵 Mavi Yaka — Adzuna Bulk Import`);
  console.log(`Target: ${target}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };

  const configs = target === 'ALL'
    ? MARKET_CONFIGS
    : MARKET_CONFIGS.filter(c => c.adzunaCode.toUpperCase() === target || c.market === target);

  if (configs.length === 0) {
    console.error(`No config found for "${target}"`);
    return;
  }

  try {
    for (const config of configs) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[${config.adzunaCode.toUpperCase()} → ${config.market}] Starting... (${config.keywords.length} keywords)`);

      const unique = await importMarket(config, stats);
      console.log(`[${config.adzunaCode.toUpperCase()} → ${config.market}] Done: ${unique.toLocaleString()} unique`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Updated: ${stats.updated.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
