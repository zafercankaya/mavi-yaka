const UTM_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'zanpid', 'msclkid',
  'ref', 'affiliate', 'tag',
];

export function canonicalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);

    // http → https
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
    }

    // Remove tracking params
    for (const param of UTM_PARAMS) {
      url.searchParams.delete(param);
    }

    // Sort remaining params
    url.searchParams.sort();

    // Remove trailing slash (except root)
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    // Remove fragment
    url.hash = '';

    // Lowercase hostname
    url.hostname = url.hostname.toLowerCase();

    return url.toString();
  } catch {
    return rawUrl;
  }
}
