'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─── Root Route Redirect ──────────────────────────────────────
// If authenticated (access_token cookie exists) → /project
// Otherwise → /landing
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = document.cookie
      .split('; ')
      .some((c) => c.startsWith('access_token='));

    if (hasToken) {
      router.replace('/project');
    } else {
      router.replace('/landing');
    }
  }, [router]);

  // Brief blank screen while redirecting
  return null;
}
