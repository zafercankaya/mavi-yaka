import http from 'http';

const CAMPAIGNS = [
  {
    slug: 'elektronik-indirimi',
    title: 'Elektronik Ürünlerde %30 İndirim',
    description: 'Tüm telefon, tablet ve bilgisayar aksesuarlarında büyük fırsat! Bu kampanyayı kaçırmayın.',
    image: 'https://picsum.photos/400/200?random=1',
    discount: 30,
    endDate: '2026-03-15',
  },
  {
    slug: 'kis-modasi',
    title: 'Kış Modası Büyük Kampanya - %50 ye varan',
    description: 'Sezon sonu kış koleksiyonunda büyük indirimler başladı.',
    image: 'https://picsum.photos/400/200?random=2',
    discount: 50,
    endDate: '2026-02-28',
  },
  {
    slug: 'spor-firsatlari',
    title: 'Spor Giyim ve Ekipman İndirimleri %35',
    description: 'Koşu ayakkabıları, spor kıyafetleri ve fitness ekipmanlarında fırsat.',
    image: 'https://picsum.photos/400/200?random=3',
    discount: 35,
    endDate: '2026-03-01',
  },
  {
    slug: 'kozmetik-festivali',
    title: 'Kozmetik Festivali - Seçili Ürünlerde %25',
    description: 'Makyaj, cilt bakım ve parfüm ürünlerinde özel indirimler.',
    image: 'https://picsum.photos/400/200?random=4',
    discount: 25,
    endDate: '2026-03-10',
  },
  {
    slug: 'ev-dekorasyon',
    title: 'Ev Dekorasyon Fırsatları - %40 İndirim',
    description: 'Mobilya, aydınlatma ve ev tekstilinde büyük kampanya.',
    image: 'https://picsum.photos/400/200?random=5',
    discount: 40,
    endDate: '2026-03-20',
  },
];

function listPage(): string {
  const cards = CAMPAIGNS.map(
    (c) => `
    <div class="campaign-card">
      <a class="campaign-link" href="/kampanya/${c.slug}">
        <img class="campaign-image" src="${c.image}" alt="${c.title}" />
        <h3 class="campaign-title">${c.title}</h3>
        <span class="campaign-discount">%${c.discount}</span>
        <span class="campaign-date">Son: ${c.endDate}</span>
      </a>
    </div>`,
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><title>Test Kampanyalar</title></head>
<body>
  <h1>Kampanyalar</h1>
  <div class="campaign-list">
    ${cards}
  </div>
</body>
</html>`;
}

function detailPage(slug: string): string | null {
  const c = CAMPAIGNS.find((c) => c.slug === slug);
  if (!c) return null;

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><title>${c.title}</title></head>
<body>
  <article class="campaign-detail">
    <h1 class="detail-title">${c.title}</h1>
    <img class="detail-image" src="${c.image}" alt="${c.title}" />
    <p class="detail-description">${c.description}</p>
    <div class="detail-meta">
      <span class="detail-discount">%${c.discount} İndirim</span>
      <span class="detail-end-date">${c.endDate}</span>
    </div>
  </article>
</body>
</html>`;
}

function rssFeed(): string {
  const items = CAMPAIGNS.map(
    (c) => `
    <item>
      <title>${c.title}</title>
      <link>http://localhost:4444/kampanya/${c.slug}</link>
      <description>${c.description}</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`,
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Kampanyalar RSS</title>
    <link>http://localhost:4444</link>
    <description>Test kampanya feed</description>
    ${items}
  </channel>
</rss>`;
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url === '/kampanyalar') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(listPage());
  } else if (url === '/rss') {
    res.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
    res.end(rssFeed());
  } else if (url.startsWith('/kampanya/')) {
    const slug = url.replace('/kampanya/', '');
    const html = detailPage(slug);
    if (html) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Test Crawl Server</h1><a href="/kampanyalar">Kampanyalar</a> | <a href="/rss">RSS</a>');
  }
});

const PORT = 4444;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`  Campaign list: http://localhost:${PORT}/kampanyalar`);
  console.log(`  RSS feed: http://localhost:${PORT}/rss`);
});
