'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const DEMO_ACCOUNTS = [
  { name: 'Sanooja', email: 'sanooja@example.com' },
  { name: 'Alex', email: 'alex@example.com' },
  { name: 'John', email: 'john@example.com' }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push('/events');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  }

  return (
    <section className="bg-forest text-ivory min-h-[calc(100vh-68px)] flex items-center">
      <div className="max-w-6xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center py-16">
        <div className="hidden lg:block">
          <p className="eyebrow-light mb-4">You're invited</p>
          <h1 className="font-display text-5xl leading-tight mb-6">
            Where the<br />neighborhood<br />actually meets.
          </h1>
          <div className="rule-gold mb-6" />
          <p className="text-ivory/60 text-sm max-w-xs leading-relaxed">
            No feeds, no algorithms — just meetups people in your area are
            actually hosting, and a straight answer on who's coming.
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <div className="lg:hidden text-center mb-8">
            <p className="eyebrow-light mb-3">You're invited</p>
            <h1 className="font-display text-3xl">Welcome back</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-gold/25 bg-white/[0.02] rounded-sm p-7 flex flex-col gap-4"
          >
            {error && (
              <div className="text-sm text-ivory bg-clay/20 border border-clay/50 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="label-light" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sanooja@example.com"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label-light" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-dark"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password123!"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-gold mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <div className="mt-5">
            <p className="label-light mb-2.5">Demo accounts</p>
            <div className="flex flex-col gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="flex items-center justify-between text-sm px-3.5 py-2.5 rounded-sm border border-ivory/15 hover:border-gold hover:bg-gold/5 transition-colors text-left"
                >
                  <span className="font-medium text-ivory">{acc.name}</span>
                  <span className="text-ivory/35 text-xs">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-ivory/35 mt-2.5">Password for all: Password123!</p>
          </div>
        </div>
      </div>
    </section>
  );
}
