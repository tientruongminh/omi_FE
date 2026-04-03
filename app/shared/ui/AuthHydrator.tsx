'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/entities/auth';

// ─── Auth Hydrator ──────────────────────────────────────────
// Runs once on app mount to restore the auth state from cookies.
// Place this inside the root layout so every page benefits.

export default function AuthHydrator() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}
