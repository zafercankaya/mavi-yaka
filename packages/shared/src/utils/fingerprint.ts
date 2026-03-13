import { createHash } from 'crypto';
import { canonicalizeUrl } from './url';

export function generateFingerprint(sourceId: string, url: string): string {
  const canonical = canonicalizeUrl(url);
  return createHash('sha256')
    .update(`${sourceId}:${canonical}`)
    .digest('hex');
}

export function generateFallbackFingerprint(
  sourceId: string,
  title: string,
  startDate: string | null,
  endDate: string | null,
): string {
  const normalized = title.trim().toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha256')
    .update(`${sourceId}:${normalized}:${startDate ?? ''}:${endDate ?? ''}`)
    .digest('hex');
}
