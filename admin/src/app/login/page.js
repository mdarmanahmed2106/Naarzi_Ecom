'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api'; // Or just generic fetch if api.js doesn't export login
import { authApi } from '@/lib/api';

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

      // Success
      router.push('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-outline-variant/30 p-8">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-3xl font-bold text-primary mb-2">Admin Portal</h1>
          <p className="text-sm text-on-surface-variant">Sign in to manage the store</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-error-container text-error text-sm rounded-xl border border-error/20 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">EMAIL ADDRESS</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
              placeholder="admin@naarzi.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">PASSWORD</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-label-caps text-sm tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}
