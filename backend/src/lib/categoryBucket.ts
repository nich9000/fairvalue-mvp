// Mirrors frontend/src/lib/icons.tsx CATEGORY_KEYWORDS/categoryBucket — keep both in sync.
// General-purpose buckets for the messy free-text niche_category field.
const CATEGORY_KEYWORDS: [string, string[]][] = [
  ['Beauty & Personal Care', ['skincare', 'personal care', 'sunscreen', 'serum', 'perfume', 'moisturizer', 'makeup', 'lip', 'nail', 'haircare', 'cosmetic', 'complexion', 'eye', 'facemask', 'beauty']],
  ['Health & Wellness', ['supplement', 'health', 'wellness', 'fitness', 'medical']],
  ['Apparel & Fashion', ['apparel', 'shoe', 'top', 'streetwear', 'outerwear', 'jean', 'dress', 'clothing', 'basics', 'activewear', 'hat']],
  ['Home & Kitchen', ['home', 'kitchen', 'furniture', 'garden']],
  ['Sports & Outdoors', ['sport', 'outdoor']],
  ['Pet Supplies', ['pet']],
  ['Toys, Games & Hobbies', ['hobbies', 'hobby', 'gaming', 'toy', 'collectible', 'craft', 'music', 'photography']],
  ['Electronics', ['electronic']],
  ['Automotive', ['automotive']],
  ['Jewelry & Accessories', ['jewelry', 'watch', 'bag', 'leather']],
];

export function categoryBucket(niche: string | null): string {
  if (!niche) return 'Other / Lifestyle';
  const lower = niche.toLowerCase();
  for (const [bucket, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return bucket;
  }
  return 'Other / Lifestyle';
}
