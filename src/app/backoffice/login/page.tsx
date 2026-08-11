'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Functional placeholder for Phase 1 verification — Phase 2 replaces the layout/copy
// with the exact design from Backoffice.dc.html.
export default function BackofficeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('staff-credentials', { redirect: false, email, password });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push('/backoffice');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-card border border-border bg-white p-8 shadow-card"
      >
        <h1 className="mb-6 text-xl font-bold text-ink">Staff login</h1>
        <label className="mb-3 block text-sm text-ink-body">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-btn border border-border px-3 py-2"
          />
        </label>
        <label className="mb-4 block text-sm text-ink-body">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-btn border border-border px-3 py-2"
          />
        </label>
        {error && <p className="mb-3 text-sm text-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-pill bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Log in'}
        </button>
        <Link href="/backoffice/forgot-password" className="mt-4 block text-center text-sm text-ink-muted">
          Forgot password?
        </Link>
      </form>
    </main>
  );
}
