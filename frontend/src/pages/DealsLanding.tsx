import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { MarketplaceListing, searchListings } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

const CARD_WIDTH = 320;
const CARD_GAP = 20;

export default function DealsLanding() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [carouselDeals, setCarouselDeals] = useState<MarketplaceListing[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [marketplaceCount, setMarketplaceCount] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    searchListings({ sort: 'deal_score', page: 1, limit: 8 }).then((res) => {
      setCarouselDeals(res.listings);
      setTotalCount(res.total_count);
      setMarketplaceCount(res.marketplace_counts.filter((m) => m.count > 0).length);
    });
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (carouselDeals.length < 2) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % carouselDeals.length), 3200);
    return () => clearInterval(timerRef.current);
  }, [carouselDeals.length]);

  // Clamp the scroll offset to the strip's actual scrollable range so the last few steps
  // settle on a fully-filled final view instead of overshooting into empty trailing space.
  const stripWidth = carouselDeals.length * CARD_WIDTH + Math.max(0, carouselDeals.length - 1) * CARD_GAP;
  const maxOffset = Math.max(0, stripWidth - viewportWidth);
  const rawOffset = index * (CARD_WIDTH + CARD_GAP);
  const offset = Math.min(rawOffset, maxOffset);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(query ? `/deals/results?niche=${encodeURIComponent(query)}` : '/deals/results');
  }

  return (
    <div className="bs" style={{ minHeight: '100vh' }}>
      <Nav current="home" />

      <section
        className="hero-grid"
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-4) var(--space-6)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--color-accent-700)', marginBottom: 'var(--space-3)' }}>
            {totalCount !== null && marketplaceCount !== null
              ? `${totalCount} active listings indexed across ${marketplaceCount} marketplaces`
              : 'Loading live listings…'}
          </div>
          <h1 style={{ fontSize: 44, maxWidth: '16ch', marginBottom: 'var(--space-3)' }}>
            Every e-commerce business for sale, in one search.
          </h1>
          <p style={{ fontSize: 19, maxWidth: '38em', color: 'color-mix(in srgb, var(--color-text) 78%, transparent)', marginBottom: 'var(--space-2)' }}>
            We index live listings from Empire Flippers, Flippa, and Proprietor so you can see what's actually for sale
            and what similar businesses actually sold for — before you talk numbers with anyone.
          </p>
        </div>
        <div className="img-placeholder" style={{ width: '100%', height: 360 }} />
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 var(--space-4) var(--space-6)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: 1, minWidth: 280 }}>
            <label>Search listings</label>
            <div style={{ position: 'relative' }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-500)' }}
              >
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                className="input"
                type="text"
                style={{ paddingLeft: 36 }}
                placeholder="Shopify supplements, Amazon FBA, content sites..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: 36 }}>
            Search deals
          </button>
        </form>
        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', marginTop: 'var(--space-2)' }}>
          <span>Try:</span>
          <Link to="/deals/results?platform=Amazon+FBA&revenue_max=1000000">Amazon FBA under $1M</Link>
          <Link to="/deals/results?platform=Shopify&multiple_min=3&multiple_max=5">Shopify, 3–5x multiple</Link>
          <Link to="/deals/results?marketplace=flippa">Content sites on Flippa</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-6) var(--space-4)', display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          </svg>
          <div>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{totalCount ?? '—'}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              active listings
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
            <path d="M3 21V9l9-6 9 6v12"></path>
            <path d="M9 21V12h6v9"></path>
          </svg>
          <div>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{marketplaceCount ?? '—'}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              marketplaces indexed
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2)" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <div>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>$500K–$5M</div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              revenue range covered
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12l3 3 5-6"></path>
          </svg>
          <div>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>0</div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              estimates — every number sourced
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <h2 style={{ marginBottom: 'var(--space-1)' }}>What's actually for sale right now</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          Sample listings, pulled straight from source. No estimates.
        </p>
        {carouselDeals.length > 0 && (
          <div ref={viewportRef} style={{ overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                gap: CARD_GAP,
                transition: 'transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)',
                transform: `translateX(-${offset}px)`,
              }}
            >
              {carouselDeals.map((deal) => (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className="card elev-md"
                  style={{ flex: `0 0 ${CARD_WIDTH}px`, textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="img-placeholder" style={{ width: '100%', height: 140 }} />
                  <div className="card-kicker">
                    {SOURCE_LABEL[deal.source_marketplace] ?? deal.source_marketplace} · {deal.platform}
                  </div>
                  <div className="card-title">{deal.niche_category ?? 'E-commerce business'}</div>
                  <p className="card-body">
                    Price {formatCurrency(deal.listing_price)} · TTM revenue {formatCurrency(deal.annual_revenue)}
                  </p>
                  <div className="card-meta">
                    <span className="tag tag-accent">{formatMultiple(deal.multiple_achieved)} multiple</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Link to="/deals/results">See all {totalCount ?? ''} listings →</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <h2 style={{ marginBottom: 'var(--space-6)' }}>How the index works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--space-6)' }}>
          <div>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" style={{ marginBottom: 'var(--space-2)' }}>
              <path d="M21 15V6a2 2 0 0 0-2-2H8L4 8v10a2 2 0 0 0 2 2h10"></path>
              <path d="M4 8h4V4"></path>
              <path d="M16 18l2 2 4-4"></path>
            </svg>
            <h4 style={{ marginBottom: 'var(--space-1)' }}>We pull listings directly</h4>
            <p className="text-muted" style={{ fontSize: 14 }}>
              Every listing on Empire Flippers, Flippa, and Proprietor. No manual entry, no editorializing.
            </p>
          </div>
          <div>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" style={{ marginBottom: 'var(--space-2)' }}>
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h4 style={{ marginBottom: 'var(--space-1)' }}>You search across all three</h4>
            <p className="text-muted" style={{ fontSize: 14 }}>
              Filter by niche, fulfillment model, revenue, or multiple — one query instead of three browser tabs.
            </p>
          </div>
          <div>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" style={{ marginBottom: 'var(--space-2)' }}>
              <path d="M3 3v18h18"></path>
              <path d="M7 15l4-4 3 3 5-6"></path>
            </svg>
            <h4 style={{ marginBottom: 'var(--space-1)' }}>You see the comparables</h4>
            <p className="text-muted" style={{ fontSize: 14 }}>
              Every deal page shows similar sold businesses side by side, so you know the range before you negotiate.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <h2 style={{ maxWidth: '28ch', marginBottom: 'var(--space-2)' }}>We are not a valuation tool. We are not a broker.</h2>
        <p style={{ maxWidth: '44em', color: 'color-mix(in srgb, var(--color-text) 78%, transparent)', marginBottom: 'var(--space-4)' }}>
          FairValue Index doesn't estimate what your business is worth. It shows you what businesses like yours have
          actually sold for, across every major marketplace, so you can judge fair value yourself.
        </p>
        <Link to="/deals/results" className="btn btn-primary">
          See what's for sale
        </Link>
      </section>

      <footer
        className="text-muted"
        style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-8)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', fontSize: 13 }}
      >
        <span>© 2026 FairValue Index. Not affiliated with Empire Flippers, Flippa, or Proprietor.</span>
        <span style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <a href="#">Sources &amp; methodology</a>
          <a href="#">Contact</a>
        </span>
      </footer>
    </div>
  );
}
