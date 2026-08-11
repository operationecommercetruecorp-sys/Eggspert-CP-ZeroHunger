'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-8">
      <div className="w-full max-w-sm rounded-card border border-border bg-white p-8 shadow-card">
        <h1 className="mb-2 text-xl font-bold text-ink">Forgot password</h1>
        {submitted ? (
          <p className="text-sm leading-relaxed text-ink-body">
            If an account exists for that email, we&apos;ve sent a new password to it. Check your inbox, then{' '}
            <Link href="/backoffice/login" className="font-semibold text-primary">
              log in
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <p className="mb-4 text-sm leading-relaxed text-ink-muted">
              Enter your account email and we&apos;ll send you a new password.
            </p>
            <label className="mb-4 block text-sm text-ink-body">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-btn border border-border px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-pill bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send new password'}
            </button>
            <Link href="/backoffice/login" className="mt-4 block text-center text-sm text-ink-muted">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
