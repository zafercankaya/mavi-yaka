import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';
import { RawCampaignData } from '../pipeline/normalize';
import { REQUEST_TIMEOUT_MS } from '../config';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export async function fetchRssCampaigns(feedUrl: string): Promise<RawCampaignData[]> {
  console.log(`  Fetching RSS feed: ${feedUrl}`);

  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'IndirimAvcisi/1.0',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);

  const campaigns: RawCampaignData[] = [];

  // Handle RSS 2.0
  const rssItems = parsed?.rss?.channel?.item;
  if (rssItems) {
    const items = Array.isArray(rssItems) ? rssItems : [rssItems];
    for (const item of items) {
      const campaign = mapRssItem(item);
      if (campaign) campaigns.push(campaign);
    }
    console.log(`  Parsed ${campaigns.length} items from RSS feed`);
    return campaigns;
  }

  // Handle Atom
  const atomEntries = parsed?.feed?.entry;
  if (atomEntries) {
    const entries = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
    for (const entry of entries) {
      const campaign = mapAtomEntry(entry);
      if (campaign) campaigns.push(campaign);
    }
    console.log(`  Parsed ${campaigns.length} items from Atom feed`);
    return campaigns;
  }

  console.warn('  Unknown feed format');
  return [];
}

function mapRssItem(item: any): RawCampaignData | null {
  const title = item.title;
  if (!title) return null;

  const sourceUrl = item.link || item.guid || '';
  if (!sourceUrl) return null;

  const description = item.description || item['content:encoded'] || undefined;

  // Extract images from media:content, enclosure, or description HTML
  const imageUrls: string[] = [];
  if (item['media:content']?.['@_url']) {
    imageUrls.push(item['media:content']['@_url']);
  }
  if (item['media:thumbnail']?.['@_url']) {
    imageUrls.push(item['media:thumbnail']['@_url']);
  }
  if (item.enclosure?.['@_url'] && item.enclosure?.['@_type']?.startsWith('image/')) {
    imageUrls.push(item.enclosure['@_url']);
  }
  // Extract images from HTML description
  if (imageUrls.length === 0 && description) {
    const $ = cheerio.load(description);
    $('img[src]').each((_i, el) => {
      const src = $(el).attr('src');
      if (src && src.startsWith('http')) imageUrls.push(src);
    });
  }

  const startDate = item.pubDate || undefined;

  return { title, description, sourceUrl, imageUrls, startDate };
}

function mapAtomEntry(entry: any): RawCampaignData | null {
  const title = entry.title?.['#text'] || entry.title;
  if (!title) return null;

  let sourceUrl = '';
  if (Array.isArray(entry.link)) {
    const alt = entry.link.find((l: any) => l['@_rel'] === 'alternate');
    sourceUrl = alt?.['@_href'] || entry.link[0]?.['@_href'] || '';
  } else {
    sourceUrl = entry.link?.['@_href'] || '';
  }
  if (!sourceUrl) return null;

  const description = entry.summary?.['#text'] || entry.summary || entry.content?.['#text'] || undefined;
  const startDate = entry.published || entry.updated || undefined;

  // Extract images from Atom entry
  const imageUrls: string[] = [];
  if (entry['media:content']?.['@_url']) {
    imageUrls.push(entry['media:content']['@_url']);
  }
  if (entry['media:thumbnail']?.['@_url']) {
    imageUrls.push(entry['media:thumbnail']['@_url']);
  }
  if (Array.isArray(entry.link)) {
    const enclosure = entry.link.find(
      (l: any) => l['@_rel'] === 'enclosure' && l['@_type']?.startsWith('image/'),
    );
    if (enclosure?.['@_href']) imageUrls.push(enclosure['@_href']);
  }

  return { title, description, sourceUrl, startDate, imageUrls };
}
