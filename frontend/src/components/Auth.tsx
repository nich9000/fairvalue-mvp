import { useState } from 'react';
import { login, signup } from '../lib/api';

interface AuthProps {
  onSuccess: (userId: string) => void;
  onClose?: () => void;
}

export default function Auth({ onSuccess, onClose }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = mode === 'signup' ? await signup(email, password) : await login(email, password);
      localStorage.setItem('fairvalue_token', result.token);
      localStorage.setItem('fairvalue_user_id', result.user_id);
      onSuccess(result.user_id);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex gap-4 border-b border-gray-200">
          <button
            className={`pb-2 text-sm font-medium ${mode === 'signup' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
            onClick={() => setMode('signup')}
            type="button"
          >
            Sign up
          </button>
          <button
            className={`pb-2 text-sm font-medium ${mode === 'login' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Log in
          </button>
          {onClose && (
            <button type="button" className="ml-auto text-gray-400 hover:text-gray-600" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
