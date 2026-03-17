import http from 'http';

const JOB_LISTINGS = [
  {
    slug: 'forklift-operatoru',
    title: 'Forklift Operatörü Aranıyor',
    description: 'Depo operasyonlarında deneyimli forklift operatörü aranmaktadır. Vardiyalı çalışma, sigorta ve servis imkanı.',
    image: 'https://picsum.photos/400/200?random=1',
    deadline: '2026-03-15',
  },
  {
    slug: 'kurye-alimi',
    title: 'Moto Kurye Alımı - Tam Zamanlı',
    description: 'İstanbul Avrupa yakasında görev yapacak moto kurye aranmaktadır. Ehliyet şartı.',
    image: 'https://picsum.photos/400/200?random=2',
    deadline: '2026-02-28',
  },
  {
    slug: 'guvenlik-gorevlisi',
    title: 'Güvenlik Görevlisi - Gece Vardiyası',
    description: 'AVM güvenlik departmanı için deneyimli güvenlik görevlisi aranmaktadır.',
    image: 'https://picsum.photos/400/200?random=3',
    deadline: '2026-03-01',
  },
  {
    slug: 'temizlik-personeli',
    title: 'Temizlik Personeli - Otel',
    description: '5 yıldızlı otelde çalışacak temizlik personeli alınacaktır. Tecrübe şartı aranmamaktadır.',
    image: 'https://picsum.photos/400/200?random=4',
    deadline: '2026-03-10',
  },
  {
    slug: 'kaynakci-alimi',
    title: 'Argon Kaynakçı Aranıyor - Acil',
    description: 'Metal atölyesinde çalışacak deneyimli argon kaynakçı aranmaktadır. Yüksek maaş + yemek.',
    image: 'https://picsum.photos/400/200?random=5',
    deadline: '2026-03-20',
  },
];

function listPage(): string {
  const cards = JOB_LISTINGS.map(
    (j) => `
    <div class="job-card">
      <a class="job-link" href="/ilan/${j.slug}">
        <img class="job-image" src="${j.image}" alt="${j.title}" />
        <h3 class="job-title">${j.title}</h3>
        <span class="job-deadline">Son Başvuru: ${j.deadline}</span>
      </a>
    </div>`,
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><title>Test İş İlanları</title></head>
<body>
  <h1>İş İlanları</h1>
  <div class="job-list">
    ${cards}
  </div>
</body>
</html>`;
}

function detailPage(slug: string): string | null {
  const j = JOB_LISTINGS.find((j) => j.slug === slug);
  if (!j) return null;

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><title>${j.title}</title></head>
<body>
  <article class="job-detail">
    <h1 class="detail-title">${j.title}</h1>
    <img class="detail-image" src="${j.image}" alt="${j.title}" />
    <p class="detail-description">${j.description}</p>
    <div class="detail-meta">
      <span class="detail-deadline">Son Başvuru: ${j.deadline}</span>
    </div>
  </article>
</body>
</html>`;
}

function rssFeed(): string {
  const items = JOB_LISTINGS.map(
    (j) => `
    <item>
      <title>${j.title}</title>
      <link>http://localhost:4444/ilan/${j.slug}</link>
      <description>${j.description}</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`,
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test İş İlanları RSS</title>
    <link>http://localhost:4444</link>
    <description>Test iş ilanı feed</description>
    ${items}
  </channel>
</rss>`;
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url === '/ilanlar') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(listPage());
  } else if (url === '/rss') {
    res.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
    res.end(rssFeed());
  } else if (url.startsWith('/ilan/')) {
    const slug = url.replace('/ilan/', '');
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
    res.end('<h1>Test Crawl Server</h1><a href="/ilanlar">İş İlanları</a> | <a href="/rss">RSS</a>');
  }
});

const PORT = 4444;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`  Job listing list: http://localhost:${PORT}/ilanlar`);
  console.log(`  RSS feed: http://localhost:${PORT}/rss`);
});
