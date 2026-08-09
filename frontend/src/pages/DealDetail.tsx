import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Auth from '../components/Auth';
import Nav from '../components/Nav';
import Toast from '../components/Toast';
import { getListingDetail, ListingDetail, saveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple, valueScoreLabel } from '../lib/format';

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
};

const MARKETPLACE_HOMEPAGE: Record<string, string> = {
  empire_flippers: 'https://empireflippers.com',
};

function timeAgo(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return 'today';
  if (days < 2) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    getListingDetail(id)
      .then((data) => {
        setListing(data);
        setSaved(data.saved_by_user);
      })
      .catch(() => setError('Could not load this deal.'));
  }, [id]);

  async function doSave() {
    try {
      await saveDeal(id!);
      setSaved(true);
      setSaveError(null);
      setShowToast(true);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('fairvalue_token');
        localStorage.removeItem('fairvalue_user_id');
        setShowAuth(true);
      } else {
        setSaveError('Could not save this deal. Please try again.');
      }
    }
  }

  async function handleSave() {
    setSaveError(null);
    if (!localStorage.getItem('fairvalue_token')) {
      setShowAuth(true);
      return;
    }
    await doSave();
  }

  async function handleAuthSuccess() {
    setShowAuth(false);
    await doSave();
  }

  // Prefer browser back so the user's search filters/scroll position are preserved; only
  // fall back to a plain link when there's no history to go back to (e.g. a shared deal link).
  function goBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate('/deals/results');
  }

  if (error) {
    return (
      <div className="bs" style={{ minHeight: '100vh' }}>
        <Nav current="none" />
        <p style={{ padding: 'var(--space-6) var(--space-4)', textAlign: 'center' }}>{error}</p>
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="bs" style={{ minHeight: '100vh' }}>
        <Nav current="none" />
        <p className="text-muted" style={{ padding: 'var(--space-6) var(--space-4)', textAlign: 'center' }}>
          Loading deal…
        </p>
      </div>
    );
  }

  const sourceLabel = SOURCE_LABEL[listing.source_marketplace] ?? listing.source_marketplace;
  // Prefer the real listing URL when we have one (live-sourced data); fall back to the
  // marketplace homepage for rows without a real source_url (still-synthetic sample data).
  const listingLink = listing.source_url || MARKETPLACE_HOMEPAGE[listing.source_marketplace];
  const ago = timeAgo(listing.listed_date);
  const comparables = listing.comparable_listings;
  const compMultiples = comparables.map((c) => c.multiple_achieved);
  const compMin = compMultiples.length ? Math.min(...compMultiples) : null;
  const compMax = compMultiples.length ? Math.max(...compMultiples) : null;
  const valueLabel = valueScoreLabel(listing.value_score);

  return (
    <div className="bs" style={{ minHeight: '100vh' }}>
      <Nav current="none" />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-4) var(--space-4) 0' }}>
        <button
          type="button"
          onClick={goBack}
          className="text-muted"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to search
        </button>
      </div>

      <div className="detail-grid" style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 20px 60px' }}>
        <div style={{ minWidth: 0 }}>
          <div className="card-kicker" style={{ marginBottom: 'var(--space-2)' }}>
            {sourceLabel} · {listing.platform} · {listing.niche_category ?? 'General'} ·{' '}
            <span className="tag tag-outline">{listing.listing_status === 'sold' ? 'Sold' : 'Active listing'}</span>
          </div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>{listing.niche_category ?? 'E-commerce business'}</h1>
          <div className="text-muted" style={{ fontSize: 14, marginBottom: 'var(--space-4)' }}>
            {ago ? `Listed ${ago} on ${sourceLabel}` : `Listed on ${sourceLabel}`}
          </div>
          <div className="img-placeholder" style={{ width: '100%', height: 280, marginBottom: 'var(--space-6)' }} />

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h6 style={{ marginBottom: 'var(--space-3)' }}>Key metrics</h6>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 'var(--space-4)' }}>
              <div>
                <div className="card-meta">Asking price</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatCurrency(listing.listing_price)}</div>
              </div>
              <div>
                <div className="card-meta">TTM revenue</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatCurrency(listing.annual_revenue)}</div>
              </div>
              <div>
                <div className="card-meta">TTM profit</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                  {listing.annual_profit !== null ? formatCurrency(listing.annual_profit) : '—'}
                </div>
              </div>
              <div>
                <div className="card-meta">Multiple</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--color-accent-700)' }}>
                  {formatMultiple(listing.multiple_achieved)}
                </div>
              </div>
            </div>
          </div>

          {valueLabel && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h6 style={{ marginBottom: 'var(--space-1)' }}>Value score</h6>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  className={`tag ${valueLabel.tone === 'good' ? 'tag-accent' : valueLabel.tone === 'bad' ? 'tag-outline' : 'tag-outline'}`}
                  style={valueLabel.tone === 'bad' ? { color: '#b3261e', borderColor: '#b3261e' } : undefined}
                >
                  {valueLabel.text}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: 13, marginTop: 'var(--space-1)' }}>
                Compares this listing's multiple to the median multiple for {listing.platform} businesses with the same
                fulfillment and traffic profile.
              </p>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h6 style={{ marginBottom: 'var(--space-1)' }}>Comparable sales</h6>
            <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 'var(--space-3)' }}>
              Similar {listing.platform} businesses in the same category.
            </p>
            {comparables.length > 0 ? (
              <>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table className="table" style={{ minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th>Business</th>
                        <th>Source</th>
                        <th>Price</th>
                        <th>TTM rev</th>
                        <th>Multiple</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparables.map((c) => (
                        <tr key={c.id}>
                          <td>{c.niche_category ?? 'E-commerce business'}</td>
                          <td className="text-muted">{SOURCE_LABEL[c.source_marketplace] ?? c.source_marketplace}</td>
                          <td>{formatCurrency(c.listing_price)}</td>
                          <td>{formatCurrency(c.annual_revenue)}</td>
                          <td>{formatMultiple(c.multiple_achieved)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {compMin !== null && compMax !== null && (
                  <p style={{ marginTop: 'var(--space-3)' }}>
                    Comparable range: <strong>{formatMultiple(compMin)}–{formatMultiple(compMax)}</strong>. This listing is priced at{' '}
                    <strong>{formatMultiple(listing.multiple_achieved)}</strong> —{' '}
                    {listing.multiple_achieved >= compMin && listing.multiple_achieved <= compMax
                      ? 'within range'
                      : listing.multiple_achieved < compMin
                        ? 'below the comparable range'
                        : 'above the comparable range'}
                    .
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted">No comparable sales found in this segment yet.</p>
            )}
          </div>

          {listing.description && (
            <div>
              <h6 style={{ marginBottom: 'var(--space-2)' }}>Listing description</h6>
              <p>{listing.description}</p>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          {listingLink && (
            <a href={listingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-block">
              View on {sourceLabel} →
            </a>
          )}
          <button type="button" onClick={handleSave} disabled={saved} className="btn btn-secondary btn-block">
            {saved ? 'Saved to dashboard' : 'Save to dashboard'}
          </button>
          {saveError && (
            <p style={{ fontSize: 13, color: '#b3261e' }}>{saveError}</p>
          )}
          <p className="text-muted" style={{ fontSize: 13, marginTop: 'var(--space-3)' }}>
            Data sourced from the original {sourceLabel} listing. FairValue Index does not broker deals or hold funds —
            all transactions happen on the originating marketplace.
          </p>
        </div>
      </div>

      {showAuth && <Auth onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />}
      {showToast && <Toast message="Deal saved" onDismiss={() => setShowToast(false)} />}
    </div>
  );
}
