'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useApp, firstName } from '@/context/AppContext';
import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { lockPageScroll } from '@/lib/scrollLock';

// Phone OTP needs Firebase's paid Blaze plan to send SMS. Until that's active it stays hidden;
// set NEXT_PUBLIC_PHONE_LOGIN=true in Vercel to offer it again.
const PHONE_LOGIN = process.env.NEXT_PUBLIC_PHONE_LOGIN === 'true';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, setUser, showToast, completeLogin } = useApp();

  // New customers see this after the profile step (filled in or skipped)
  const finishNewAccount = () => {
    setIsAuthOpen(false);
    showToast('success', "You're in. Happy shopping.", 'Your Naarzi account is ready.', 3500);
    completeLogin();
  };

  // 'start' (Google + email) → 'email-code' | 'phone' → 'otp' → 'profile' for new customers
  const [step, setStep] = useState('start');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    let unlockScroll;
    if (isAuthOpen) {
      unlockScroll = lockPageScroll();
      if (PHONE_LOGIN && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
      setStep('start');
      setPhone('');
      setEmail('');
    } else {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }

    return () => {
      unlockScroll?.();
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [isAuthOpen]);

  if (!isAuthOpen) return null;

  // Shared by every sign-in method once the backend has logged the customer in
  const signedIn = (response) => {
    setUser(response.user);
    if (response.user.profileComplete === false) {
      setStep('profile');
      return;
    }
    setIsAuthOpen(false);
    const name = firstName(response.user);
    showToast('success', name ? `Welcome back, ${name}` : 'Welcome back', "You're logged in.", 3500);
    completeLogin();
  };

  const sendOtp = async (formattedPhone) => {
    const confirmResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
    setConfirmationResult(confirmResult);
  };

  const verifyOtp = async (code) => {
    if (!confirmationResult) throw new Error('No OTP confirmation pending');
    const result = await confirmationResult.confirm(code);
    const idToken = await result.user.getIdToken();
    signedIn(await authApi.phoneAuth(idToken));
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const idToken = await result.user.getIdToken();
    signedIn(await authApi.googleAuth(idToken));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-300">
      <div
        className="bg-surface rounded-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-3xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsAuthOpen(false)}
          aria-label="Close"
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer z-10 bg-surface/80 md:bg-transparent p-1 md:p-0 rounded-full"
        >
          <Icon name="close" size="lg" className="block" />
        </button>

        {/* Top/Left panel - image banner */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 h-48 md:h-auto relative overflow-hidden bg-primary shrink-0">
          <Image
            src="/login_banner.png"
            alt="Naarzi Login"
            fill
            className="object-contain p-4 md:p-0 md:object-cover"
            priority
          />
        </div>

        {/* Bottom/Right panel: form, step-dependent content */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative bg-surface">

          {/* required invisible reCAPTCHA anchor */}
          <div id="recaptcha-container"></div>

          {step === 'start' && (
            <StartStep
              email={email}
              setEmail={setEmail}
              onGoogle={signInWithGoogle}
              onCodeSent={() => setStep('email-code')}
              onUsePhone={PHONE_LOGIN ? () => setStep('phone') : null}
            />
          )}
          {step === 'email-code' && (
            <OtpStep
              title="Check your email"
              destination={email}
              resend={() => authApi.sendEmailCode(email)}
              verifyOtp={async (code) => signedIn(await authApi.verifyEmailCode(email, code))}
              onBack={() => setStep('start')}
            />
          )}
          {step === 'phone' && (
            <PhoneStep
              phone={phone}
              setPhone={setPhone}
              sendOtp={sendOtp}
              onSubmit={() => setStep('otp')}
              onBack={() => setStep('start')}
            />
          )}
          {step === 'otp' && (
            <OtpStep
              title="OTP Verification"
              destination={`+91 ${phone}`}
              resend={() => sendOtp(`+91${phone}`)}
              verifyOtp={verifyOtp}
              onBack={() => setStep('phone')}
            />
          )}
          {step === 'profile' && (
            <ProfileCompletionStep
              onComplete={finishNewAccount}
              onSkip={finishNewAccount}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// First screen: Google in one tap, or a 6-digit code to any email address
function StartStep({ email, setEmail, onGoogle, onCodeSent, onUsePhone }) {
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await onGoogle();
    } catch (err) {
      // Closing the Google window isn't an error worth showing
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.error(err);
        setError(err?.code === 'auth/popup-blocked'
          ? 'Your browser blocked the Google window. Allow pop-ups for this site, or use your email below.'
          : err?.message && !err?.code ? err.message : 'Google sign-in did not work. Please try again, or use your email below.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!validEmail) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSending(true);
    try {
      setEmail(email.trim());
      await authApi.sendEmailCode(email.trim());
      onCodeSent();
    } catch (err) {
      setError(err.message || 'Could not send the code. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-1 text-on-surface">Login / Signup</h3>
      <p className="text-on-surface-variant text-sm mb-6">Sign in to shop, track orders and save your wishlist</p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm font-medium hover:border-primary hover:bg-surface-container-low transition-colors disabled:opacity-60 cursor-pointer"
      >
        <GoogleLogo />
        {googleLoading ? 'Opening Google…' : 'Continue with Google'}
      </button>

      <div className="flex items-center gap-3 my-5" aria-hidden="true">
        <span className="flex-1 h-px bg-outline-variant/60" />
        <span className="text-[11px] font-label-caps tracking-widest text-on-surface-variant">OR</span>
        <span className="flex-1 h-px bg-outline-variant/60" />
      </div>

      <form onSubmit={handleSendCode}>
        <label htmlFor="auth-email" className="block text-sm text-on-surface-variant mb-2">Get a login code by email</label>
        <input
          id="auth-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-outline-variant focus:border-primary rounded-lg px-4 py-3 outline-none bg-surface text-on-surface text-sm transition-colors"
        />
        {error && <p role="alert" className="text-error text-xs mt-2">{error}</p>}
        <button
          type="submit"
          disabled={sending || !validEmail}
          className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-container transition-colors cursor-pointer text-sm tracking-widest font-label-caps"
        >
          {sending ? 'SENDING…' : 'SEND CODE'}
        </button>
      </form>

      {onUsePhone && (
        <button type="button" onClick={onUsePhone} className="w-full text-center text-sm text-on-surface-variant mt-4 underline cursor-pointer">
          Use mobile number instead
        </button>
      )}

      <p className="text-xs text-on-surface-variant text-center mt-6">
        By logging in, you're agreeing to our{' '}
        <Link href="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link> and{' '}
        <Link href="/terms" className="underline hover:text-primary transition-colors">Terms of Service</Link>
      </p>
    </div>
  );
}

function PhoneStep({ phone, setPhone, sendOtp, onSubmit, onBack }) {
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

      <button type="button" onClick={onBack} className="w-full text-center text-sm text-on-surface-variant mt-4 underline cursor-pointer">
        Use Google or email instead
      </button>
    </div>
  );
}

// 6-digit code entry, for both the emailed code and the SMS OTP
function OtpStep({ title, destination, resend, verifyOtp, onBack }) {
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

  // Fills boxes from `index` onward. Several digits arrive at once from SMS autofill
  // (iOS/Android put the whole code in the focused box) or from pasting the code.
  const fillFrom = (index, value) => {
    const incoming = value.replace(/\D/g, '');
    const next = [...digits];
    if (!incoming) {
      next[index] = '';
      setDigits(next);
      return;
    }
    // A full code always fills from the first box, wherever the cursor was
    const start = incoming.length >= 6 ? 0 : index;
    const chars = incoming.slice(0, 6 - start).split('');
    chars.forEach((c, k) => { next[start + k] = c; });
    setDigits(next);

    const last = start + chars.length - 1;
    inputRefs.current[Math.min(last + 1, 5)]?.focus();

    if (next.every((d) => d !== '')) {
      handleVerify(next.join(''));
    }
  };

  const handleDigitChange = (index, value) => {
    // Typing over a filled box gives two characters; keep the new one
    if (value.length === 2 && digits[index]) value = value.replace(digits[index], '') || value[1];
    fillFrom(index, value);
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    fillFrom(index, e.clipboardData.getData('text'));
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
      setError(err?.message && !err?.code ? err.message : 'Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await resend();
      setResendTimer(30);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.message && !err?.code ? err.message : 'Could not resend the code');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-1 text-center text-on-surface">{title}</h3>
      <p className="text-on-surface-variant text-sm text-center mb-1">We have sent a 6-digit code to</p>
      <p className="text-center font-medium mb-6 text-on-surface break-all">
        {destination} <button onClick={onBack} className="text-primary text-sm underline ml-1 cursor-pointer">Edit</button>
      </p>

      <div className="flex justify-center gap-2 sm:gap-3 mb-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoFocus={i === 0}
            aria-label={`Digit ${i + 1} of 6`}
            value={d}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onPaste={(e) => handlePaste(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-10 h-12 sm:w-12 sm:h-14 border border-outline-variant rounded-lg text-center text-lg sm:text-xl focus:border-primary outline-none bg-surface text-on-surface transition-colors"
          />
        ))}
      </div>
      {error && <p role="alert" className="text-error text-xs text-center mb-4">{error}</p>}

      <p className="text-center text-sm text-on-surface-variant mb-6 mt-4">
        {resendTimer > 0 ? (
          <>Resend code in <span className="font-medium text-on-surface">{resendTimer} Sec</span></>
        ) : (
          <button onClick={handleResend} className="text-primary underline cursor-pointer">Resend code</button>
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
  // Email sign-ins already have their address, so only the name is asked for
  const hasEmail = Boolean(user?.email);
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
      const res = await authApi.completeProfile({ name: name.trim(), email: hasEmail ? undefined : email.trim() || undefined });
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
      <p className="text-on-surface-variant text-sm text-center mb-6">{hasEmail ? 'What should we call you?' : 'Tell us a bit about yourself'}</p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        autoComplete="name"
        className="w-full border border-outline-variant rounded-lg px-4 py-3 mb-3 outline-none focus:border-primary bg-surface text-on-surface"
      />
      {!hasEmail && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (for order updates)"
          className="w-full border border-outline-variant rounded-lg px-4 py-3 mb-1 outline-none focus:border-primary bg-surface text-on-surface"
        />
      )}
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
