import { ReactNode, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Auth from '../components/Auth';
import Nav from '../components/Nav';
import Toast from '../components/Toast';
import { CategoryCountEntry, MarketplaceCountEntry, MarketplaceListing, PlatformCountEntry, SearchFilters, createTrackedNiche, getSavedDeals, saveDeal, searchListings, unsaveDeal } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';
import { CategoryIcon, CategoryIconByBucket, PlatformIcon } from '../lib/icons';

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button type="button" className="filter-section-header" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

const SORT_OPTIONS: { value: NonNullable<SearchFilters['sort']>; label: string }[] = [
  { value: 'listed_date', label: 'Sort: Newest listed' },
  { value: 'multiple_asc', label: 'Sort: Multiple, low to high' },
  { value: 'multiple_desc', label: 'Sort: Multiple, high to low' },
  { value: 'price_desc', label: 'Sort: Price, high to low' },
];

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

function pageWindow(current: number, total: number): number[] {
  const pages: number[] = [];
  const start = Math.max(1, current - 1);
  const end = Math.min(total, start + 2);
  for (let p = Math.max(1, end - 2); p <= end; p++) pages.push(p);
  return pages;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryText, setQueryText] = useState(searchParams.get('niche') ?? '');
  const [revenueMin, setRevenueMin] = useState(searchParams.get('revenue_min') ?? '');
  const [revenueMax, setRevenueMax] = useState(searchParams.get('revenue_max') ?? '');
  const [multipleMin, setMultipleMin] = useState(searchParams.get('multiple_min') ?? '');
  const [multipleMax, setMultipleMax] = useState(searchParams.get('multiple_max') ?? '');

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [marketplaceCounts, setMarketplaceCounts] = useState<MarketplaceCountEntry[]>([]);
  const [platformCounts, setPlatformCounts] = useState<PlatformCountEntry[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCountEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showTrackAuth, setShowTrackAuth] = useState(false);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (!mobileFilterOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  useEffect(() => {
    if (!localStorage.getItem('fairvalue_token')) return;
    getSavedDeals('all')
      .then((deals) => setSavedIds(new Set(deals.map((d) => d.listing_id))))
      .catch(() => {
        /* saved-state badges are a bonus on top of search — fail silently */
      });
  }, []);

  async function doToggleSave(id: string) {
    try {
      if (savedIds.has(id)) {
        await unsaveDeal(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setToastMessage('Deal removed');
      } else {
        await saveDeal(id);
        setSavedIds((prev) => new Set(prev).add(id));
        setToastMessage('Deal saved');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('fairvalue_token');
        localStorage.removeItem('fairvalue_user_id');
        setPendingSaveId(id);
      }
    }
  }

  function handleSaveClick(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('fairvalue_token')) {
      setPendingSaveId(id);
      return;
    }
    doToggleSave(id);
  }

  async function handleAuthSuccess() {
    const id = pendingSaveId;
    setPendingSaveId(null);
    if (id) await doToggleSave(id);
  }

  const niche = searchParams.get('niche') ?? '';
  // "|" not "," — several category bucket names (e.g. "Toys, Games & Hobbies") contain a
  // literal comma, which would otherwise collide with the multi-select join delimiter.
  const selectedMarketplaces = searchParams.get('marketplace')?.split('|').filter(Boolean) ?? [];
  const selectedPlatforms = searchParams.get('platform')?.split('|').filter(Boolean) ?? [];
  const selectedCategories = searchParams.get('category')?.split('|').filter(Boolean) ?? [];
  const sort = (searchParams.get('sort') as SearchFilters['sort']) ?? 'listed_date';
  const page = Number(searchParams.get('page') ?? '1');

  useEffect(() => {
    setQueryText(niche);
    setRevenueMin(searchParams.get('revenue_min') ?? '');
    setRevenueMax(searchParams.get('revenue_max') ?? '');
    setMultipleMin(searchParams.get('multiple_min') ?? '');
    setMultipleMax(searchParams.get('multiple_max') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    const filters: SearchFilters = {
      niche: niche || undefined,
      platform: selectedPlatforms.length ? selectedPlatforms.join('|') : undefined,
      marketplace: selectedMarketplaces.length ? selectedMarketplaces.join('|') : undefined,
      category: selectedCategories.length ? selectedCategories.join('|') : undefined,
      revenue_min: searchParams.get('revenue_min') ? Number(searchParams.get('revenue_min')) : undefined,
      revenue_max: searchParams.get('revenue_max') ? Number(searchParams.get('revenue_max')) : undefined,
      multiple_min: searchParams.get('multiple_min') ? Number(searchParams.get('multiple_min')) : undefined,
      multiple_max: searchParams.get('multiple_max') ? Number(searchParams.get('multiple_max')) : undefined,
      sort,
      page,
      limit: 10,
    };
    setLoading(true);
    setError(null);
    searchListings(filters)
      .then((res) => {
        setListings(res.listings);
        setTotalCount(res.total_count);
        setTotalPages(res.total_pages);
        setMarketplaceCounts(res.marketplace_counts);
        setPlatformCounts(res.platform_counts);
        setCategoryCounts(res.category_counts);
      })
      .catch(() => setError('Could not load deals. Please try again.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function updateParams(updates: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (resetPage) next.delete('page');
    setSearchParams(next);
  }

  function toggleInList(param: string, current: string[], value: string) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateParams({ [param]: next.length ? next.join('|') : null });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ niche: queryText || null });
  }

  function applyRange() {
    updateParams({
      revenue_min: revenueMin || null,
      revenue_max: revenueMax || null,
      multiple_min: multipleMin || null,
      multiple_max: multipleMax || null,
    });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  function buildTrackedNicheLabel(): string {
    const parts: string[] = [];
    if (selectedPlatforms.length) parts.push(selectedPlatforms.join(' / '));
    if (selectedCategories.length) parts.push(selectedCategories.join(' / '));
    if (niche) parts.push(`"${niche}"`);
    if (!parts.length && selectedMarketplaces.length) {
      parts.push(selectedMarketplaces.map((m) => SOURCE_LABEL[m] ?? m).join(' / '));
    }
    return parts.length ? parts.join(' · ') : 'All listings';
  }

  async function doTrackSearch() {
    setTracking(true);
    try {
      await createTrackedNiche({
        label: buildTrackedNicheLabel(),
        marketplace: selectedMarketplaces.length ? selectedMarketplaces.join('|') : undefined,
        platform: selectedPlatforms.length ? selectedPlatforms.join('|') : undefined,
        category: selectedCategories.length ? selectedCategories.join('|') : undefined,
        niche: niche || undefined,
        revenue_min: revenueMin ? Number(revenueMin) : undefined,
        revenue_max: revenueMax ? Number(revenueMax) : undefined,
        multiple_min: multipleMin ? Number(multipleMin) : undefined,
        multiple_max: multipleMax ? Number(multipleMax) : undefined,
      });
      setToastMessage('Niche tracked — see it on your dashboard');
    } catch {
      setToastMessage('Could not track this search. Please try again.');
    } finally {
      setTracking(false);
    }
  }

  function handleTrackClick() {
    if (!localStorage.getItem('fairvalue_token')) {
      setShowTrackAuth(true);
      return;
    }
    doTrackSearch();
  }

  async function handleTrackAuthSuccess() {
    setShowTrackAuth(false);
    await doTrackSearch();
  }

  const summaryParts: string[] = [];
  if (niche) summaryParts.push(niche);
  summaryParts.push(selectedMarketplaces.length ? `${selectedMarketplaces.length} marketplace${selectedMarketplaces.length > 1 ? 's' : ''}` : 'all marketplaces');

  let activeFilterCount = 0;
  if (selectedMarketplaces.length > 0) activeFilterCount++;
  if (selectedPlatforms.length > 0) activeFilterCount++;
  if (selectedCategories.length > 0) activeFilterCount++;
  if (revenueMin || revenueMax) activeFilterCount++;
  if (multipleMin || multipleMax) activeFilterCount++;

  function renderFilterSections() {
    return (
      <>
        <FilterSection title="Marketplace">
          {marketplaceCounts.map((m) => (
            <label key={m.source_marketplace} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedMarketplaces.length === 0 || selectedMarketplaces.includes(m.source_marketplace)}
                onChange={() => toggleInList('marketplace', selectedMarketplaces.length ? selectedMarketplaces : marketplaceCounts.map((x) => x.source_marketplace), m.source_marketplace)}
              />
              <span className="box"></span>
              {SOURCE_LABEL[m.source_marketplace] ?? m.source_marketplace}
              <span className="count">{m.count}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Platform">
          {platformCounts.map((p) => (
            <label key={p.platform} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedPlatforms.length === 0 || selectedPlatforms.includes(p.platform)}
                onChange={() => toggleInList('platform', selectedPlatforms.length ? selectedPlatforms : platformCounts.map((x) => x.platform), p.platform)}
              />
              <span className="box"></span>
              <PlatformIcon platform={p.platform} />
              {p.platform}
              <span className="count">{p.count}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Category">
          {categoryCounts.map((c) => (
            <label key={c.bucket} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedCategories.length === 0 || selectedCategories.includes(c.bucket)}
                onChange={() => toggleInList('category', selectedCategories.length ? selectedCategories : categoryCounts.map((x) => x.bucket), c.bucket)}
              />
              <span className="box"></span>
              <CategoryIconByBucket bucket={c.bucket} size={16} />
              {c.bucket}
              <span className="count">{c.count}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="TTM revenue">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input className="input" type="number" placeholder="Min" value={revenueMin} onChange={(e) => setRevenueMin(e.target.value)} onBlur={applyRange} />
            <span className="text-muted">–</span>
            <input className="input" type="number" placeholder="Max" value={revenueMax} onChange={(e) => setRevenueMax(e.target.value)} onBlur={applyRange} />
          </div>
        </FilterSection>

        <FilterSection title="Multiple">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input className="input" type="number" step="0.1" placeholder="Min" value={multipleMin} onChange={(e) => setMultipleMin(e.target.value)} onBlur={applyRange} />
            <span className="text-muted">–</span>
            <input className="input" type="number" step="0.1" placeholder="Max" value={multipleMax} onChange={(e) => setMultipleMax(e.target.value)} onBlur={applyRange} />
          </div>
        </FilterSection>
      </>
    );
  }

  return (
    <div className="bs" style={{ minHeight: '100vh' }}>
      <Nav current="search" maxWidth={1280} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--space-4)' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: 640 }}>
          <div style={{ position: 'relative', flex: 1 }}>
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
              style={{ paddingLeft: 36, width: '100%' }}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search listings"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      <div className="search-layout" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 var(--space-4) 60px' }}>
        <aside className="search-sidebar">
          <div className="filter-panel-header">
            <span className="filter-panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filter by
            </span>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 13, padding: 0 }} onClick={clearFilters}>
              Clear
            </button>
          </div>

          {renderFilterSections()}
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div className="mobile-filter-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setMobileFilterOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filter
              {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <strong>{totalCount} results</strong> <span className="text-muted">· {summaryParts.join(', ')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} disabled={tracking} onClick={handleTrackClick}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Track this search
              </button>
              <select className="input" style={{ width: 'auto' }} value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p style={{ color: '#b3261e' }}>{error}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {listings.map((listing) => {
              const ago = timeAgo(listing.listed_date);
              const isSaved = savedIds.has(listing.id);
              return (
                <div key={listing.id} className="card elev-md result-row" style={{ position: 'relative' }}>
                  <div className="img-placeholder" style={{ width: 96, height: 72, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div className="card-kicker" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PlatformIcon platform={listing.platform} />
                      {SOURCE_LABEL[listing.source_marketplace] ?? listing.source_marketplace} · {listing.platform}
                      {listing.niche_category ? ` · ${listing.niche_category}` : ''}
                    </div>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CategoryIcon niche={listing.niche_category} />
                      <Link to={`/deals/${listing.id}`} className="stretched-link" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {listing.niche_category ?? 'E-commerce business'}
                      </Link>
                    </div>
                    <div className="card-meta">
                      {ago ? `Listed ${ago}` : 'Listing date unavailable'}
                      {listing.listing_status === 'sold' && (
                        <>
                          {' '}
                          · <span className="tag tag-accent-2">Sold</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
                    <div>
                      <div className="card-meta">Price</div>
                      {formatCurrency(listing.listing_price)}
                    </div>
                    <div>
                      <div className="card-meta">TTM rev</div>
                      {formatCurrency(listing.annual_revenue)}
                    </div>
                    <div>
                      <div className="card-meta">Multiple</div>
                      <span className="tag tag-accent">{formatMultiple(listing.multiple_achieved)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-pill ${isSaved ? 'btn-outline-accent is-active' : 'btn-outline-accent'}`}
                    style={{ position: 'relative', zIndex: 2, marginLeft: 'auto' }}
                    onClick={(e) => handleSaveClick(e, listing.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              );
            })}
            {listings.length === 0 && !loading && !error && <p className="text-muted">No deals match these filters.</p>}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
              <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) }, false)}>
                ← Prev
              </button>
              {pageWindow(page, totalPages).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={p === page ? 'btn btn-primary' : 'btn btn-secondary'}
                  onClick={() => updateParams({ page: String(p) }, false)}
                >
                  {p}
                </button>
              ))}
              <button type="button" className="btn btn-secondary" disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) }, false)}>
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {mobileFilterOpen && (
        <>
          <div className="filter-sheet-overlay" onClick={() => setMobileFilterOpen(false)} />
          <div className="filter-sheet" role="dialog" aria-modal="true" aria-label="Filter listings">
            <div className="filter-sheet-header">
              <span className="filter-panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter by
              </span>
              <button type="button" className="btn-icon" aria-label="Close" onClick={() => setMobileFilterOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="filter-sheet-body">{renderFilterSections()}</div>
            <div className="filter-sheet-footer">
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                Clear
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setMobileFilterOpen(false)}>
                Show {totalCount} results
              </button>
            </div>
          </div>
        </>
      )}

      {pendingSaveId && <Auth onSuccess={handleAuthSuccess} onClose={() => setPendingSaveId(null)} />}
      {showTrackAuth && <Auth onSuccess={handleTrackAuthSuccess} onClose={() => setShowTrackAuth(false)} />}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}
