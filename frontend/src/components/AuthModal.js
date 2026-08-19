'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authApi } from '@/lib/api';

export default function AuthModal() {
  const {
    isAuthOpen,
    setIsAuthOpen,
    authModalTab,
    setAuthModalTab,
    login,
    signup,
    setUser
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone OTP specific state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (isAuthOpen) {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    } else {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [isAuthOpen]);

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
    let finalPhone = phone;
    if (phone.trim() !== '') {
      const cleanedPhone = phone.replace(/\s+/g, '');
      finalPhone = cleanedPhone.startsWith('+') ? cleanedPhone : `${countryCode}${cleanedPhone}`;
    }
    const result = await signup({ name, email, password, phone: finalPhone });
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanedPhone = phone.replace(/\s+/g, '');
      const formattedPhone = cleanedPhone.startsWith('+') ? cleanedPhone : `${countryCode}${cleanedPhone}`;
      const confirmResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
    } catch (err) {
      console.error('Failed to send OTP:', err);
      // Display the actual Firebase error message to help debug (e.g. auth/invalid-phone-number)
      setError(`Failed to send OTP: ${err.message || err.code || 'Unknown error'}. Try refreshing.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otpCode);
      const idToken = await result.user.getIdToken();

      const response = await authApi.phoneAuth(idToken);
      setUser(response.user);
      setIsAuthOpen(false);
      setOtpSent(false);
      setOtpCode('');
      setPhone('');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-surface border border-outline-variant max-w-md w-full mx-4 rounded-xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="recaptcha-container"></div>
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
          <button
            className={`flex-1 py-4 text-center text-xs font-label-caps tracking-widest transition-colors ${
              authModalTab === 'phone'
                ? 'bg-surface text-primary border-b-2 border-primary'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
            onClick={() => {
              setError('');
              setAuthModalTab('phone');
              setOtpSent(false);
            }}
          >
            PHONE
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-lg text-on-surface">
              {authModalTab === 'login' ? 'Welcome back' : authModalTab === 'signup' ? 'Create an account' : 'Phone Login'}
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

          {authModalTab === 'login' && (
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
          )}

          {authModalTab === 'signup' && (
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
                <div className="flex bg-surface-container-low border-b border-outline/30 rounded-lg focus-within:border-primary transition-colors">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent px-3 py-3 text-sm text-on-surface focus:outline-none border-r border-outline/20 cursor-pointer"
                  >
                    <option value="+91">IN (+91)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+61">AU (+61)</option>
                    <option value="+971">UAE (+971)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-sm text-on-surface"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
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

          {authModalTab === 'phone' && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  PHONE NUMBER
                </label>
                <div className="flex bg-surface-container-low border-b border-outline/30 rounded-lg focus-within:border-primary transition-colors">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent px-3 py-3 text-sm text-on-surface focus:outline-none border-r border-outline/20 cursor-pointer"
                  >
                    <option value="+91">IN (+91)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+61">AU (+61)</option>
                    <option value="+971">UAE (+971)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-sm text-on-surface"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'SENDING OTP...' : 'SEND OTP'}
              </button>
            </form>
          )}

          {authModalTab === 'phone' && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  ENTER OTP
                </label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none rounded-lg text-sm text-on-surface transition-colors tracking-[0.5em] font-mono text-center"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
              </button>
              <button
                type="button"
                className="w-full mt-2 py-2 text-xs text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setOtpSent(false)}
              >
                Change Phone Number
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
