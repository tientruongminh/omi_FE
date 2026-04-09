'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Google Calendar OAuth callback page.
 * After Google consent, the backend redirects here with ?status=success.
 * This page notifies the opener window and auto-closes.
 */
export default function CalendarCallbackPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    // Notify opener (PlanSurveyModal) that calendar was connected
    if (window.opener) {
      window.opener.postMessage(
        { type: 'google-calendar-connected', status: status || 'success' },
        window.location.origin,
      );
      window.close();
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Google Calendar Connected!</h1>
        <p className="text-gray-500">You can close this window now.</p>
      </div>
    </div>
  );
}
