import { CATEGORY_ICON_PATHS, CategoryIconByBucket, PlatformIcon } from '../lib/icons';

const ALL_PLATFORMS = ['Amazon FBA', 'Amazon FBM', 'Amazon FBA / Shopify', 'Shopify', 'WooCommerce', 'BigCommerce', 'Unknown Platform'];
const ALL_CATEGORIES = Object.keys(CATEGORY_ICON_PATHS);

function IconBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        title={label}
        style={{
          width: 48,
          height: 48,
          border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
      <div style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.3, maxWidth: 72 }} className="text-muted">
        {label}
      </div>
    </div>
  );
}

export default function IconTest() {
  return (
    <div className="bs" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-8)' }}>
        <h1>Icon set — test page</h1>
        <p className="text-muted">Dev-only reference, not linked from the nav. Every box below is 48×48px.</p>

        <h2 style={{ marginTop: 'var(--space-8)' }}>Platforms</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 80px)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          {ALL_PLATFORMS.map((p) => (
            <IconBox key={p} label={p}>
              <PlatformIcon platform={p} size={24} />
            </IconBox>
          ))}
        </div>

        <h2 style={{ marginTop: 'var(--space-8)' }}>Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 80px)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          {ALL_CATEGORIES.map((c) => (
            <IconBox key={c} label={c}>
              <CategoryIconByBucket bucket={c} size={24} />
            </IconBox>
          ))}
        </div>
      </div>
    </div>
  );
}
