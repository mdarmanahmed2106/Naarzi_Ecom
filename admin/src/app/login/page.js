'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminToken } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Hit the standard login but pass source: 'admin'
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, source: 'admin' }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check role
      if (data.user.role !== 'admin') {
        throw new Error("This account doesn't have admin access.");
      }

      // Keep the token for browsers that block the cross-site auth cookie
      adminToken.set(data.token);

      // Success
      router.push('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center mb-10">
        <span className="brand-wordmark font-display-lg text-[2.5rem] tracking-[0.18em] text-primary leading-none block">NAARZI</span>
        <span className="font-label-caps text-[10px] tracking-[0.45em] uppercase text-on-surface-variant mt-3 block">Admin</span>
      </div>

      <div className="max-w-sm w-full bg-surface-container-lowest border border-outline-variant/60 px-7 py-8 md:px-9 md:py-10">
        <h1 className="font-display-lg text-[1.9rem] leading-tight text-on-surface mb-1">Sign in</h1>
        <p className="text-sm text-on-surface-variant mb-8">Manage products, orders and the store.</p>

        {errorMsg && (
          <div role="alert" className="mb-6 px-4 py-3 bg-error-container/60 text-error text-sm border-l-2 border-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface border border-outline-variant focus:border-primary focus:outline-none transition-colors"
              placeholder="admin@naarzi.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface border border-outline-variant focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-label-caps text-[11px] tracking-[0.25em] uppercase hover:bg-primary-container transition-colors mt-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <a href={process.env.NEXT_PUBLIC_STORE_URL || 'https://naarzi.com'} className="mt-8 text-xs text-on-surface-variant hover:text-primary transition-colors">
        ← Back to naarzi.com
      </a>
    </div>
  );
}
