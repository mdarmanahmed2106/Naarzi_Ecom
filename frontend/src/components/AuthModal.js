'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authApi } from '@/lib/api';
import Link from 'next/link';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, setUser } = useApp();
  
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (isAuthOpen) {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
      setStep('phone');
      setPhone('');
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

  const sendOtp = async (formattedPhone) => {
    const confirmResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
    setConfirmationResult(confirmResult);
  };

  const verifyOtp = async (code) => {
    if (!confirmationResult) throw new Error('No OTP confirmation pending');
    const result = await confirmationResult.confirm(code);
    const idToken = await result.user.getIdToken();
    const response = await authApi.phoneAuth(idToken);
    
    if (response.user.profileComplete === false) {
      setUser(response.user);
      setStep('profile');
    } else {
      setUser(response.user);
      setIsAuthOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-300">
      <div 
        className="bg-surface rounded-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-3xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsAuthOpen(false)} 
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer z-10 bg-surface/80 md:bg-transparent p-1 md:p-0 rounded-full"
        >
          <span className="material-symbols-outlined text-2xl block">close</span>
        </button>

        {/* Top/Left panel - image banner */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 h-40 md:h-auto relative overflow-hidden bg-primary shrink-0">
          <Image 
            src="/login_banner.png" 
            alt="Naarzi Login" 
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Bottom/Right panel — form, step-dependent content */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative bg-surface">
          
          {/* required invisible reCAPTCHA anchor */}
          <div id="recaptcha-container"></div>
          
          {step === 'phone' && (
            <PhoneStep 
              phone={phone} 
              setPhone={setPhone} 
              sendOtp={sendOtp} 
              onSubmit={() => setStep('otp')} 
            />
          )}
          {step === 'otp' && (
            <OtpStep 
              phone={phone} 
              sendOtp={sendOtp} 
              verifyOtp={verifyOtp} 
              onBack={() => setStep('phone')} 
            />
          )}
          {step === 'profile' && (
            <ProfileCompletionStep 
              onComplete={() => setIsAuthOpen(false)} 
              onSkip={() => setIsAuthOpen(false)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PhoneStep({ phone, setPhone, sendOtp, onSubmit }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOtp(`+91${phone}`);
      onSubmit();
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-1 text-on-surface">Login / Signup</h3>
      <p className="text-on-surface-variant text-sm mb-6">Enter your mobile number</p>

      <div className="flex border border-outline-variant focus-within:border-primary rounded-lg overflow-hidden mb-1 transition-colors">
        <span className="flex items-center gap-1 px-3 bg-surface-container-low border-r border-outline-variant text-sm text-on-surface-variant">
          🇮🇳 +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter Mobile Number"
          className="flex-1 px-3 py-3 outline-none bg-surface text-on-surface text-sm"
        />
      </div>
      {error && <p className="text-error text-xs mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || phone.length !== 10}
        className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-container transition-colors cursor-pointer text-sm tracking-widest font-label-caps"
      >
        {loading ? 'SENDING...' : 'SUBMIT'}
      </button>

      <p className="text-xs text-on-surface-variant text-center mt-6">
        By logging in, you're agreeing to our{' '}
        <Link href="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link> and{' '}
        <Link href="/terms" className="underline hover:text-primary transition-colors">Terms of Service</Link>
      </p>
    </div>
  );
}

function OtpStep({ phone, sendOtp, verifyOtp, onBack }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only single digit
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    
    // auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Verify when full
    if (next.every((d) => d !== '') && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus(); // auto-back on backspace
    }
  };

  const handleVerify = async (code) => {
    setLoading(true);
    setError('');
    try {
      await verifyOtp(code);
    } catch (err) {
      console.error(err);
      setError('Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await sendOtp(`+91${phone}`);
      setResendTimer(30);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-1 text-center text-on-surface">OTP Verification</h3>
      <p className="text-on-surface-variant text-sm text-center mb-1">We have sent verification code to</p>
      <p className="text-center font-medium mb-6 text-on-surface">
        +91 {phone} <button onClick={onBack} className="text-primary text-sm underline ml-1 cursor-pointer">Edit</button>
      </p>

      <div className="flex justify-center gap-2 sm:gap-3 mb-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-10 h-12 sm:w-12 sm:h-14 border border-outline-variant rounded-lg text-center text-lg sm:text-xl focus:border-primary outline-none bg-surface text-on-surface transition-colors"
          />
        ))}
      </div>
      {error && <p className="text-error text-xs text-center mb-4">{error}</p>}

      <p className="text-center text-sm text-on-surface-variant mb-6 mt-4">
        {resendTimer > 0 ? (
          <>Resend OTP in <span className="font-medium text-on-surface">{resendTimer} Sec</span></>
        ) : (
          <button onClick={handleResend} className="text-primary underline cursor-pointer">Resend OTP</button>
        )}
      </p>

      <button
        onClick={() => handleVerify(digits.join(''))}
        disabled={loading || digits.some((d) => d === '')}
        className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-container transition-colors cursor-pointer text-sm tracking-widest font-label-caps"
      >
        {loading ? 'VERIFYING...' : 'VERIFY'}
      </button>
    </div>
  );
}

function ProfileCompletionStep({ onComplete, onSkip }) {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name && user.name !== 'New Customer' ? user.name : '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.completeProfile({ name: name.trim(), email: email.trim() || undefined });
      if (res.success) {
        setUser(res.user);
        onComplete();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-1 text-center text-on-surface">Almost there!</h3>
      <p className="text-on-surface-variant text-sm text-center mb-6">Tell us a bit about yourself</p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        className="w-full border border-outline-variant rounded-lg px-4 py-3 mb-3 outline-none focus:border-primary bg-surface text-on-surface"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (for order updates)"
        className="w-full border border-outline-variant rounded-lg px-4 py-3 mb-1 outline-none focus:border-primary bg-surface text-on-surface"
      />
      {error && <p className="text-error text-xs mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-container transition-colors cursor-pointer text-sm tracking-widest font-label-caps"
      >
        {loading ? 'SAVING...' : 'CONTINUE'}
      </button>

      <button onClick={onSkip} className="w-full text-center text-sm text-on-surface-variant mt-3 underline cursor-pointer">
        Skip for now
      </button>
    </div>
  );
}
