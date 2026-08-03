export default function LandingAbout() {
  return (
    <section className="bg-white px-6 py-16 sm:px-12">
      <div className="mx-auto mb-12 max-w-4xl">
        <h2 className="mb-4 text-4xl font-bold text-black">What's your store actually worth?</h2>
        <p className="text-xl leading-relaxed text-gray-700">
          Stop guessing. Stop getting lowballed. See real e-commerce businesses selling for real prices across Empire
          Flippers, Flippa, and Proprietor in one place.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        <div className="border-l-4 border-green-600 pl-6">
          <h3 className="mb-3 text-lg font-semibold text-black">Real Data</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            118 verified deals from 3 major marketplaces. Not estimates, not algorithms—actual listings with actual
            prices.
          </p>
          <p className="mt-3 text-xs text-gray-500">✓ Empire Flippers ✓ Flippa ✓ Proprietor</p>
        </div>

        <div className="border-l-4 border-brand pl-6">
          <h3 className="mb-3 text-lg font-semibold text-black">One Search</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            Find Shopify stores, Amazon FBA businesses, Etsy shops, WooCommerce sites. Filter by niche, revenue,
            fulfillment. All marketplaces at once.
          </p>
          <p className="mt-3 text-xs text-gray-500">Platform • Niche • Revenue • Growth</p>
        </div>

        <div className="border-l-4 border-red-600 pl-6">
          <h3 className="mb-3 text-lg font-semibold text-black">Fair Price</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            Know your business's market value before negotiating. See what similar stores sold for. Spot overpriced
            deals instantly.
          </p>
          <p className="mt-3 text-xs text-gray-500">Median multiple: 0.57x revenue</p>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl border-t border-gray-200 pt-12">
        <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-3">
          <div>
            <div className="text-3xl font-bold text-black">118</div>
            <div className="mt-2 text-sm text-gray-600">Real deals indexed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">0.57x</div>
            <div className="mt-2 text-sm text-gray-600">Median multiple</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-3xl font-bold text-black">3</div>
            <div className="mt-2 text-sm text-gray-600">Source marketplaces</div>
          </div>
        </div>
      </div>
    </section>
  );
}
