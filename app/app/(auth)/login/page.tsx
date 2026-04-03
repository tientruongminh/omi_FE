'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/entities/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  '998872753408-khd6tel30rr8bbkj8ajpjhd7s2f40gm3.apps.googleusercontent.com';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin } = useAuthStore();

  // Redirect target: where the user came from, or /project
  const redirectTo = searchParams.get('from') || '/project';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ─── Google Sign-In ────────────────────────────────────────

  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setGoogleLoading(true);
      setError('');
      try {
        await googleLogin(response.credential);
        router.push(redirectTo);
      } catch (err: unknown) {
        const apiErr = err as { error?: string };
        setError(apiErr.error || 'Google sign-in failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin, router, redirectTo],
  );

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        const btnEl = document.getElementById('google-signin-btn');
        if (btnEl) {
          window.google.accounts.id.renderButton(btnEl, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '400',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'center',
          });
        }
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [handleGoogleCallback]);

  // ─── Email/Password Login ──────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.push(redirectTo);
    } catch (err: unknown) {
      const apiErr = err as { error?: string };
      setError(apiErr.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="font-extrabold mb-2"
          style={{ fontSize: '28px', color: '#1a1a1a', letterSpacing: '-0.02em' }}
        >
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Sign in to continue your learning journey
        </p>
      </div>

      {/* Google Sign-In */}
      <div className="mb-6">
        <div
          id="google-signin-btn"
          className="flex justify-center"
          style={{ minHeight: 44, opacity: googleLoading ? 0.5 : 1 }}
        />
        {googleLoading && (
          <div className="flex justify-center mt-2">
            <Loader2 size={18} className="animate-spin" style={{ color: '#6B2D3E' }} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
        <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>
          or sign in with email
        </span>
        <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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

        {/* Submit */}
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
          Sign In
        </button>
      </form>

      {/* Footer */}
      <p className="text-center mt-6 text-sm" style={{ color: '#6b7280' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-semibold transition-colors hover:underline"
          style={{ color: '#6B2D3E' }}
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
