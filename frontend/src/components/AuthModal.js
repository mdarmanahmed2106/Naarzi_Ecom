'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function AuthModal() {
  const {
    isAuthOpen,
    setIsAuthOpen,
    authModalTab,
    setAuthModalTab,
    login,
    signup,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signup({ name, email, password, phone });
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-surface border border-outline-variant max-w-md w-full mx-4 rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex border-b border-outline-variant">
          <button
            className={`flex-1 py-4 text-center text-xs font-label-caps tracking-widest transition-colors ${
              authModalTab === 'login'
                ? 'bg-surface text-primary border-b-2 border-primary'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
            onClick={() => {
              setError('');
              setAuthModalTab('login');
            }}
          >
            LOGIN
          </button>
          <button
            className={`flex-1 py-4 text-center text-xs font-label-caps tracking-widest transition-colors ${
              authModalTab === 'signup'
                ? 'bg-surface text-primary border-b-2 border-primary'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
            onClick={() => {
              setError('');
              setAuthModalTab('signup');
            }}
          >
            SIGNUP
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-lg text-on-surface">
              {authModalTab === 'login' ? 'Welcome back' : 'Create an account'}
            </h3>
            <span 
              className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-on-surface-variant"
              onClick={() => setIsAuthOpen(false)}
            >
              close
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-error text-xs rounded-lg border border-error/20">
              {error}
            </div>
          )}

          {authModalTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none rounded-lg text-sm text-on-surface transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none rounded-lg text-sm text-on-surface transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </button>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none rounded-lg text-sm text-on-surface transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none rounded-lg text-sm text-on-surface transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  PHONE NUMBER (OPTIONAL)
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none rounded-lg text-sm text-on-surface transition-colors"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none rounded-lg text-sm text-on-surface transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
