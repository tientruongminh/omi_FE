'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuthStore, authApi } from '@/entities/auth';

type Step = 'email' | 'otp' | 'details';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Resend timer countdown ─────────────────────────────────

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // ─── Step 1: Send OTP ───────────────────────────────────────

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.sendOtp(trimmed);
      setEmail(trimmed);
      setStep('otp');
      setResendTimer(60);
      // Focus first OTP input after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err: unknown) {
      const apiErr = err as { error?: string };
      setError(apiErr.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP input handlers ─────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1); // Only last char
    setOtp(next);

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...otp];
    for (let i = 0; i < text.length; i++) {
      next[i] = text[i];
    }
    setOtp(next);
    // Focus the input after last pasted digit
    const focusIndex = Math.min(text.length, 5);
    otpRefs.current[focusIndex]?.focus();
  }, [otp]);

  // ─── Step 2: Verify OTP ────────────────────────────────────

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { verified } = await authApi.verifyOtp(email, code);
      if (!verified) {
        setError('Invalid OTP code');
        return;
      }
      setStep('details');
    } catch (err: unknown) {
      const apiErr = err as { error?: string };
      setError(apiErr.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      await authApi.sendOtp(email);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      const apiErr = err as { error?: string };
      setError(apiErr.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Complete Registration ──────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(email, password, name.trim() || undefined);
      router.push('/project');
    } catch (err: unknown) {
      const apiErr = err as { error?: string };
      setError(apiErr.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step indicators ───────────────────────────────────────

  const steps: { key: Step; label: string }[] = [
    { key: 'email', label: 'Email' },
    { key: 'otp', label: 'Verify' },
    { key: 'details', label: 'Details' },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="font-extrabold mb-2"
          style={{ fontSize: '28px', color: '#1a1a1a', letterSpacing: '-0.02em' }}
        >
          Create account
        </h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Start your learning journey with Omilearn
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: i <= stepIndex ? '#6B2D3E' : '#f3f4f6',
                color: i <= stepIndex ? '#fff' : '#9ca3af',
                border: i <= stepIndex ? '2px solid #1a1a1a' : '2px solid #e5e7eb',
              }}
            >
              {i < stepIndex ? (
                <CheckCircle2 size={16} />
              ) : (
                i + 1
              )}
            </div>
            <span
              className="text-xs font-medium hidden sm:inline"
              style={{ color: i <= stepIndex ? '#1a1a1a' : '#9ca3af' }}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-0.5 mx-1"
                style={{ background: i < stepIndex ? '#6B2D3E' : '#e5e7eb' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
        >
          {error}
        </motion.div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        {/* ─── Step 1: Email ─────────────────────────────────── */}
        {step === 'email' && (
          <motion.form
            key="email"
            onSubmit={handleSendOtp}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#9ca3af' }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                className="w-full pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#1a1a1a',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: '#6B2D3E',
                border: '2px solid #1a1a1a',
                borderRadius: '12px',
                boxShadow: '3px 3px 0px #1a1a1a',
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Send OTP Code
            </button>
          </motion.form>
        )}

        {/* ─── Step 2: OTP Verification ──────────────────────── */}
        {step === 'otp' && (
          <motion.form
            key="otp"
            onSubmit={handleVerifyOtp}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <p className="text-sm" style={{ color: '#6b7280' }}>
                We sent a 6-digit code to{' '}
                <span className="font-semibold" style={{ color: '#1a1a1a' }}>
                  {email}
                </span>
              </p>
            </div>

            {/* OTP inputs */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold outline-none transition-all focus:ring-2"
                  style={{
                    background: '#ffffff',
                    border: digit ? '2px solid #6B2D3E' : '1.5px solid #e5e7eb',
                    borderRadius: '12px',
                    color: '#1a1a1a',
                  }}
                />
              ))}
            </div>

            {/* Resend */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs font-semibold transition-colors hover:underline disabled:opacity-50"
                  style={{ color: '#6B2D3E' }}
                >
                  Resend code
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
                style={{
                  background: '#f3f4f6',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#6b7280',
                }}
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="flex-1 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: '#6B2D3E',
                  border: '2px solid #1a1a1a',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0px #1a1a1a',
                }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Verify
              </button>
            </div>
          </motion.form>
        )}

        {/* ─── Step 3: Name + Password ───────────────────────── */}
        {step === 'details' && (
          <motion.form
            key="details"
            onSubmit={handleRegister}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="text-center mb-1">
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Almost done! Set up your profile.
              </p>
            </div>

            {/* Name */}
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#9ca3af' }}
              />
              <input
                type="text"
                placeholder="Full name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                autoFocus
                className="w-full pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#1a1a1a',
                }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#9ca3af' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full pl-11 pr-12 py-3 text-sm font-medium outline-none transition-all focus:ring-2"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#1a1a1a',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#9ca3af' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#9ca3af' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#1a1a1a',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: '#2d5a3d',
                border: '2px solid #1a1a1a',
                borderRadius: '12px',
                boxShadow: '3px 3px 0px #1a1a1a',
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Footer */}
      <p className="text-center mt-6 text-sm" style={{ color: '#6b7280' }}>
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold transition-colors hover:underline"
          style={{ color: '#6B2D3E' }}
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
