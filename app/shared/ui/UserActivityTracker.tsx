'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { adminApi } from '@/entities/admin/api';
import { useAuthStore } from '@/entities/auth';

const SESSION_KEY = 'omilearn_activity_session_id';

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let sessionId = window.sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export default function UserActivityTracker() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionId = useMemo(getSessionId, []);

  useEffect(() => {
    if (!isAuthenticated || !user || !sessionId) return;

    let stopped = false;

    const sendHeartbeat = () => {
      if (stopped || document.visibilityState !== 'visible') return;
      adminApi.heartbeat(sessionId, pathname || '/', user.name).catch(() => {
        // Best-effort analytics; never disturb the user experience.
      });
    };

    sendHeartbeat();
    const timer = window.setInterval(sendHeartbeat, 30_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') sendHeartbeat();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', sendHeartbeat);

    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', sendHeartbeat);
    };
  }, [isAuthenticated, pathname, sessionId, user]);

  return null;
}
