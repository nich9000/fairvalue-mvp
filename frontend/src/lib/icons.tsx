import { ReactNode } from 'react';

// Real brand marks (official Simple Icons path data), rendered as solid currentColor
// fills — logo shapes read correctly filled, not as line-strokes. The combo platform
// ("Amazon FBA / Shopify") has no single real logo, so it gets a generic layered-square glyph.
export const PLATFORM_LOGO_PATH: Record<string, string> = {
  'Amazon FBA':
    'M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z',
  Shopify:
    'M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z',
  BigCommerce:
    'M12.645 13.663h3.027c.861 0 1.406-.474 1.406-1.235 0-.717-.545-1.234-1.406-1.234h-3.027c-.1 0-.187.086-.187.172v2.125c.015.1.086.172.187.172zm0 4.896h3.128c.961 0 1.535-.488 1.535-1.35 0-.746-.545-1.35-1.535-1.35h-3.128c-.1 0-.187.087-.187.173v2.34c.015.115.086.187.187.187zM23.72.053l-8.953 8.93h1.464c2.281 0 3.63 1.435 3.63 3 0 1.235-.832 2.14-1.722 2.541-.143.058-.143.259.014.316 1.033.402 1.765 1.48 1.765 2.742 0 1.78-1.19 3.202-3.5 3.202h-6.342c-.1 0-.187-.086-.187-.172V13.85L.062 23.64c-.13.13-.043.359.143.359h23.631a.16.16 0 0 0 .158-.158V.182c.043-.158-.158-.244-.273-.13z',
};

export const PLATFORM_COMBO_GLYPH = (
  <>
    <rect x="2" y="13" width="9" height="9"></rect>
    <rect x="13" y="2" width="9" height="9"></rect>
    <path d="M15 13h5v2h-5zM15 17h7v2h-7z" strokeWidth="0"></path>
  </>
);

// WooCommerce's only Simple Icons mark is the full "WOOCOMMERCE" wordmark — squeezed into a
// square icon slot it reduces to an unrecognizable sliver, so it gets a generic cart glyph
// (same stroke-line treatment as the combo icon) instead of a broken brand mark.
export const WOOCOMMERCE_CART_GLYPH = (
  <>
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </>
);

export const PLATFORM_DEFAULT_GLYPH = (
  <>
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"></path>
    <circle cx="7" cy="7" r="1.5"></circle>
  </>
);

// Amazon FBA and Amazon FBM share the same logo (both are Amazon) — the "FBA"/"FBM" text
// label already distinguishes the fulfillment model, the icon just identifies the platform.
export function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  if (platform === 'Amazon FBA / Shopify') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flexShrink: 0, color: 'var(--color-neutral-500)' }}>
        {PLATFORM_COMBO_GLYPH}
      </svg>
    );
  }
  if (platform === 'WooCommerce') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--color-neutral-500)' }}>
        {WOOCOMMERCE_CART_GLYPH}
      </svg>
    );
  }
  const logoKey = platform.startsWith('Amazon') ? 'Amazon FBA' : platform;
  const d = PLATFORM_LOGO_PATH[logoKey];
  if (!d) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flexShrink: 0, color: 'var(--color-neutral-500)' }}>
        {PLATFORM_DEFAULT_GLYPH}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: 'var(--color-neutral-500)' }}>
      <path d={d}></path>
    </svg>
  );
}

// General-purpose buckets for the messy free-text niche_category field — 81 distinct raw
// values roll up into these 11 groups, each with its own line-icon glyph pulled from the
// Tabler icon set via the Iconify API (droplet/heartbeat/shirt/home/mountain/paw/puzzle/
// cpu/car/diamond/tag) so the whole set is one consistent, verified family.
export const CATEGORY_KEYWORDS: [string, string[]][] = [
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

export const CATEGORY_ICON_PATHS: Record<string, ReactNode> = {
  // tabler:droplet
  'Beauty & Personal Care': (
    <path d="M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0s3.262-5.708 1.566-8.546l-4.89-7.26c-.42-.625-1.287-.803-1.936-.397a1.4 1.4 0 0 0-.41.397l-4.893 7.26C4.24 13.715 4.9 17.318 7.502 19.423"></path>
  ),
  // tabler:heartbeat
  'Health & Wellness': (
    <>
      <path d="M19.5 13.572L12 21l-2.896-2.868m-6.117-8.104A5 5 0 0 1 12 7.006a5 5 0 1 1 7.5 6.572"></path>
      <path d="M3 13h2l2 3l2-6l1 3h3"></path>
    </>
  ),
  // tabler:shirt
  'Apparel & Fashion': <path d="m15 4l6 2v5h-3v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8H3V6l6-2a3 3 0 0 0 6 0"></path>,
  // tabler:home
  'Home & Kitchen': (
    <>
      <path d="M5 12H3l9-9l9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"></path>
      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path>
    </>
  ),
  // tabler:mountain
  'Sports & Outdoors': (
    <>
      <path d="M3 20h18L14.079 5.388a2.3 2.3 0 0 0-4.158 0z"></path>
      <path d="m7.5 11l2 2.5L12 11l2 3l2.5-2"></path>
    </>
  ),
  // tabler:paw
  'Pet Supplies': (
    <path d="M14.7 13.5c-1.1-2-1.441-2.5-2.7-2.5s-1.736.755-2.836 2.747c-.942 1.703-2.846 1.845-3.321 3.291c-.097.265-.145.677-.143.962c0 1.176.787 2 1.8 2c1.259 0 3-1 4.5-1s3.241 1 4.5 1c1.013 0 1.8-.823 1.8-2c0-.285-.049-.697-.146-.962c-.475-1.451-2.512-1.835-3.454-3.538m5.488-5.418A1 1 0 0 0 19.782 8h-.015c-.735.012-1.56.75-1.993 1.866c-.519 1.335-.28 2.7.538 3.052q.196.082.406.082c.739 0 1.575-.742 2.011-1.866c.516-1.335.273-2.7-.54-3.052zM9.474 9c.055 0 .109 0 .163-.011c.944-.128 1.533-1.346 1.32-2.722C10.754 4.97 9.91 4 9.025 4c-.055 0-.109 0-.163.011c-.944.128-1.533 1.346-1.32 2.722C7.746 8.026 8.59 9 9.475 9m6.981-2.267c.214-1.376-.375-2.594-1.32-2.722A1 1 0 0 0 14.974 4c-.885 0-1.728.97-1.93 2.267c-.214 1.376.375 2.594 1.32 2.722q.081.01.162.011c.885 0 1.73-.974 1.93-2.267M5.69 12.918c.816-.352 1.054-1.719.536-3.052C5.79 8.742 4.955 8 4.217 8q-.211 0-.407.082c-.816.352-1.054 1.719-.536 3.052C3.71 12.258 4.545 13 5.283 13q.211 0 .407-.082"></path>
  ),
  // tabler:device-gamepad-2 — swapped in for tabler:puzzle, which reads busy/tangled at 16-24px
  'Toys, Games & Hobbies': (
    <>
      <path d="M12 5h3.5a5 5 0 0 1 0 10H10l-4.015 4.227a2.3 2.3 0 0 1-3.923-2.035l1.634-8.173A5 5 0 0 1 8.6 5z"></path>
      <path d="m14 15l4.07 4.284a2.3 2.3 0 0 0 3.925-2.023l-1.6-8.232M8 9v2m-1-1h2m5 0h2"></path>
    </>
  ),
  // tabler:cpu
  Electronics: (
    <>
      <path d="M5 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"></path>
      <path d="M9 9h6v6H9zm-6 1h2m-2 4h2m5-11v2m4-2v2m7 5h-2m2 4h-2m-5 7v-2m-4 2v-2"></path>
    </>
  ),
  // tabler:car
  Automotive: (
    <>
      <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0m10 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"></path>
      <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9m-6-6h15m-6 0V6"></path>
    </>
  ),
  // tabler:diamond
  'Jewelry & Accessories': (
    <>
      <path d="M6 5h12l3 5l-8.5 9.5a.7.7 0 0 1-1 0L3 10z"></path>
      <path d="M10 12L8 9.8l.6-1"></path>
    </>
  ),
  // tabler:tag
  'Other / Lifestyle': (
    <>
      <path d="M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0-2 0"></path>
      <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592-5.592a2.41 2.41 0 0 0 0-3.408l-7.71-7.71A2 2 0 0 0 11.172 3H6a3 3 0 0 0-3 3"></path>
    </>
  ),
};

export function CategoryIcon({ niche, size = 14 }: { niche: string | null; size?: number }) {
  const bucket = categoryBucket(niche);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, color: 'var(--color-neutral-500)' }}
    >
      {CATEGORY_ICON_PATHS[bucket]}
    </svg>
  );
}

export function CategoryIconByBucket({ bucket, size = 14 }: { bucket: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, color: 'var(--color-neutral-500)' }}
    >
      {CATEGORY_ICON_PATHS[bucket]}
    </svg>
  );
}
