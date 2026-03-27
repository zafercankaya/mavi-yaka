import { MetadataRoute } from 'next';
import { MARKETS } from '@/data/markets';

const BASE_URL = 'https://mavi-yaka-web.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const marketPages = MARKETS.map(m => ({
    url: `${BASE_URL}/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    ...marketPages,
  ];
}
