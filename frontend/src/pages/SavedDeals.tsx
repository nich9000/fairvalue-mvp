import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../components/Auth';
import Nav from '../components/Nav';
import Toast from '../components/Toast';
import { SavedDeal, getSavedDeals, unsaveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

export default function SavedDeals() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('fairvalue_user_id'));
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getSavedDeals('all')
      .then(setDeals)
      .catch(() => setError('Could not load your saved deals.'));
  }, [userId]);

  async function handleRemove(listingId: string) {
    await unsaveDeal(listingId);
    setDeals((prev) => prev.filter((d) => d.listing_id !== listingId));
    setShowToast(true);
  }

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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-500)" strokeWidth="2">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--color-neutral-500)' }}>—</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                tracked niches (coming soon)
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
        <div className="card elev-md" style={{ textAlign: 'center' }}>
          <div className="card-title">Coming soon</div>
          <p className="card-body">
            Track niches you care about — revenue range, multiple range, marketplace — and get notified when new
            matching listings appear.
          </p>
        </div>
      </div>

      {showToast && <Toast message="Deal removed" onDismiss={() => setShowToast(false)} />}
    </div>
  );
}
