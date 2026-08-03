import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceListing } from '../lib/dealsApi';
import { formatCurrency, formatMultiple } from '../lib/format';

const SOURCE_LABEL: Record<string, string> = {
  empire_flippers: 'Empire Flippers',
  flippa: 'Flippa',
  proprietor: 'Proprietor',
};

const RANK_LABEL = ['BEST DEAL', 'GOOD DEAL', 'CHECK IT OUT'];

function daysAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export default function TopDealsCarousel({ deals }: { deals: MarketplaceListing[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || deals.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, deals.length]);

  if (deals.length === 0) return null;

  const visibleCount = Math.min(3, deals.length);
  const visibleDeals = Array.from({ length: visibleCount }, (_, i) => deals[(currentIndex + i) % deals.length]);

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + deals.length) % deals.length);
    setAutoPlay(false);
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % deals.length);
    setAutoPlay(false);
  }

  return (
    <section className="bg-gray-50 px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h2 className="mb-2 text-3xl font-bold text-black">Top deals this week</h2>
          <p className="text-gray-600">Ranked by value. Scroll to see more.</p>
        </div>

        <div className="relative">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleDeals.map((deal, idx) => {
              const age = daysAgo(deal.listed_date);
              const vsMarketPct =
                deal.segment_median_multiple !== null
                  ? ((deal.segment_median_multiple - deal.multiple_achieved) / deal.segment_median_multiple) * 100
                  : null;

              return (
                <Link key={`${deal.id}-${currentIndex}`} to={`/deals/${deal.id}`} className="block">
                  <div className="group cursor-pointer border border-gray-300 bg-white p-6 transition-shadow hover:shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {RANK_LABEL[idx] ?? 'DEAL'}
                      </span>
                      <span className="text-xs text-gray-500">{SOURCE_LABEL[deal.source_marketplace] ?? deal.source_marketplace}</span>
                    </div>

                    <h3 className="mb-1 text-lg font-semibold text-black transition-colors group-hover:text-brand">
                      {deal.niche_category ?? 'E-commerce business'}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      {deal.platform} • {deal.fulfillment_model ?? 'n/a'}
                    </p>

                    <div className="mb-4">
                      <p className="font-mono text-2xl font-bold text-black">{formatCurrency(deal.listing_price)}</p>
                      <p className="mt-1 text-sm text-gray-600">Annual revenue: {formatCurrency(deal.annual_revenue)}</p>
                    </div>

                    <div className="mb-4 border-l-4 border-green-600 bg-gray-50 p-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">Multiple:</span>
                        <span className="font-mono text-lg font-semibold text-black">{formatMultiple(deal.multiple_achieved)}</span>
                      </div>
                      {vsMarketPct !== null && (
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-xs text-gray-500">vs market avg</span>
                          <span className="text-sm font-semibold text-green-600">
                            {vsMarketPct >= 0 ? `${vsMarketPct.toFixed(0)}% below` : `${Math.abs(vsMarketPct).toFixed(0)}% above`}
                          </span>
                        </div>
                      )}
                    </div>

                    {deal.profit_margin_pct !== null && (
                      <div className="mb-4 text-xs text-gray-600">
                        Margin: <span className="font-semibold text-black">{deal.profit_margin_pct.toFixed(0)}%</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">{age !== null ? `Listed ${age} days ago` : 'Listing date unavailable'}</p>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <span className="block w-full bg-brand px-4 py-2 text-center text-sm font-medium text-white transition-colors group-hover:bg-brand-dark">
                        See analysis →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mb-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous deals"
              className="flex h-10 w-10 items-center justify-center border border-gray-300 transition-colors hover:bg-gray-100"
            >
              ←
            </button>

            <div className="flex gap-2">
              {deals.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setAutoPlay(false);
                  }}
                  aria-label={`Go to deal ${idx + 1}`}
                  className={`h-2 w-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-black' : 'bg-gray-300'}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next deals"
              className="flex h-10 w-10 items-center justify-center border border-gray-300 transition-colors hover:bg-gray-100"
            >
              →
            </button>
          </div>

          <div className="text-center">
            <Link to="/deals" className="inline-block bg-black px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-800">
              See all deals →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
