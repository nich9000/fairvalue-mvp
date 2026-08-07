import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../components/Auth';
import Nav from '../components/Nav';
import Toast from '../components/Toast';
import { SavedDeal, TrackedNiche, deleteTrackedNiche, getSavedDeals, getTrackedNiches, unsaveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

function criteriaSummary(n: TrackedNiche): string {
  const revenue =
    n.revenue_min || n.revenue_max
      ? `${n.revenue_min ? formatCurrency(n.revenue_min) : 'Any'}–${n.revenue_max ? formatCurrency(n.revenue_max) : 'Any'} revenue`
      : 'Any revenue';
  const multiple =
    n.multiple_min || n.multiple_max
      ? `${n.multiple_min ? formatMultiple(n.multiple_min) : 'any'}–${n.multiple_max ? formatMultiple(n.multiple_max) : 'any'} multiple`
      : 'any multiple';
  return `${revenue} · ${multiple}`;
}

export default function SavedDeals() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('fairvalue_user_id'));
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [trackedNiches, setTrackedNiches] = useState<TrackedNiche[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getSavedDeals('all')
      .then(setDeals)
      .catch(() => setError('Could not load your saved deals.'));
    getTrackedNiches()
      .then(setTrackedNiches)
      .catch(() => {
        /* tracked niches are a bonus section on the dashboard — fail silently */
      });
  }, [userId]);

  async function handleRemove(listingId: string) {
    await unsaveDeal(listingId);
    setDeals((prev) => prev.filter((d) => d.listing_id !== listingId));
    setToastMessage('Deal removed');
  }

  async function handleUntrack(id: string) {
    await deleteTrackedNiche(id);
    setTrackedNiches((prev) => prev.filter((n) => n.id !== id));
    setToastMessage('Niche untracked');
  }

  const newListingsThisWeek = trackedNiches.reduce((sum, n) => sum + n.new_this_week, 0);

  if (!userId) {
    return (
      <div className="bs" style={{ minHeight: '100vh' }}>
        <Nav current="dashboard" />
        <Auth onSuccess={setUserId} />
      </div>
    );
  }

  return (
    <div className="bs" style={{ minHeight: '100vh' }}>
      <Nav current="dashboard" />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-8)' }}>
        <h1 style={{ marginBottom: 'var(--space-1)' }}>Your dashboard</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
          Saved deals and tracked niches.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{deals.length}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                saved deals
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{trackedNiches.length}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                tracked niches
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', fontWeight: 600, color: newListingsThisWeek > 0 ? 'var(--color-accent-700)' : undefined }}>
                {newListingsThisWeek > 0 ? `${newListingsThisWeek} new` : '0'}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                listings this week
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3)' }}>
          <h6 style={{ margin: 0 }}>Saved deals</h6>
          <Link to="/deals/results" style={{ fontSize: 14 }}>
            Find more →
          </Link>
        </div>

        {error && <p style={{ color: '#b3261e' }}>{error}</p>}

        {deals.length > 0 ? (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 'var(--space-8)' }}>
            <table className="table" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Source</th>
                  <th>Price</th>
                  <th>TTM rev</th>
                  <th>Multiple</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <Link to={`/deals/${deal.listing_id}`} style={{ color: 'var(--color-text)' }}>
                        {deal.marketplace_listings.niche_category ?? 'E-commerce business'}
                      </Link>
                    </td>
                    <td className="text-muted">{SOURCE_LABEL[deal.marketplace_listings.source_marketplace] ?? deal.marketplace_listings.source_marketplace}</td>
                    <td>{formatCurrency(deal.marketplace_listings.listing_price)}</td>
                    <td>{formatCurrency(deal.marketplace_listings.annual_revenue)}</td>
                    <td>{formatMultiple(deal.marketplace_listings.multiple_achieved)}</td>
                    <td>
                      <span className={deal.marketplace_listings.listing_status === 'sold' ? 'tag tag-neutral' : 'tag tag-accent'}>
                        {deal.marketplace_listings.listing_status === 'sold' ? 'Sold' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button type="button" onClick={() => handleRemove(deal.listing_id)} className="btn btn-ghost" style={{ fontSize: 13 }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && (
            <p className="text-muted" style={{ marginBottom: 'var(--space-8)' }}>
              No saved deals yet.
            </p>
          )
        )}

        <h6 style={{ marginBottom: 'var(--space-3)' }}>Tracked niches &amp; alerts</h6>
        {trackedNiches.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--space-4)' }}>
            {trackedNiches.map((n) => (
              <div key={n.id} className="card elev-md">
                <div className="card-title">{n.label}</div>
                <p className="card-body">{criteriaSummary(n)}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="card-meta" style={{ color: n.new_this_week > 0 ? 'var(--color-accent-700)' : undefined }}>
                    {n.new_this_week > 0 ? `${n.new_this_week} new listing${n.new_this_week > 1 ? 's' : ''} this week` : 'No new listings'}
                  </div>
                  <button type="button" onClick={() => handleUntrack(n.id)} className="btn btn-ghost" style={{ fontSize: 12, padding: 0 }}>
                    Untrack
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card elev-md" style={{ textAlign: 'center' }}>
            <div className="card-title">No tracked niches yet</div>
            <p className="card-body">
              Search for deals, set filters for what you care about, then hit "Track this search" to get notified
              when new matching listings appear.
            </p>
            <Link to="/deals/results" className="btn btn-secondary" style={{ alignSelf: 'center' }}>
              Search deals
            </Link>
          </div>
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}
