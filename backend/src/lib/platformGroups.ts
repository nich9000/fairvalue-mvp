// "Amazon FBA / Shopify" isn't a platform of its own — it's a handful of multi-channel
// businesses that run on both. Rather than a 6th sidebar bucket, those listings count toward
// (and are matched by) both "Amazon FBA" and "Shopify", so the filter list stays to 5 platforms.
export const PLATFORM_DISPLAY_GROUPS: Record<string, string[]> = {
  'Amazon FBA': ['Amazon FBA', 'Amazon FBA / Shopify'],
  Shopify: ['Shopify', 'Amazon FBA / Shopify'],
};

export function platformDisplayBuckets(rawPlatform: string): string[] {
  const buckets = Object.entries(PLATFORM_DISPLAY_GROUPS)
    .filter(([, rawValues]) => rawValues.includes(rawPlatform))
    .map(([display]) => display);
  return buckets.length ? buckets : [rawPlatform];
}

// Expands requested display-platform names ("Amazon FBA", "Shopify") into the raw DB values
// they should match, since a multi-channel listing's raw platform is the combined string.
export function expandPlatformDisplayNames(requested: string[]): string[] {
  const rawValues = new Set<string>();
  for (const p of requested) {
    if (PLATFORM_DISPLAY_GROUPS[p]) PLATFORM_DISPLAY_GROUPS[p].forEach((v) => rawValues.add(v));
    else rawValues.add(p);
  }
  return Array.from(rawValues);
}
