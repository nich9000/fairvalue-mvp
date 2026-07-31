import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          What's your Shopify store worth?
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Get a free valuation plus a roadmap to add $100K+ in value.
        </p>
        <Link
          to="/valuation"
          className="mt-8 rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700"
        >
          Get Free Valuation
        </Link>
        <p className="mt-6 text-sm text-gray-500">300+ stores valued</p>
      </main>
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        <span>FairValue</span>
        <span className="mx-2">·</span>
        <Link to="/dashboard" className="hover:text-gray-600">
          Log in
        </Link>
      </footer>
    </div>
  );
}
