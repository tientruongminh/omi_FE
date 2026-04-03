// ─── API Base Configuration ───────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  error: string;
  status: number;
}

/**
 * Lightweight fetch wrapper with automatic JSON handling,
 * token injection from cookies, and error normalization.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  // Read access token from cookie (client-side only)
  let token = '';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    token = match ? decodeURIComponent(match[1]) : '';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle no-content responses
  if (res.status === 204) return {} as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: ApiError = {
      error: data.error || data.message || 'Something went wrong',
      status: res.status,
    };
    throw err;
  }

  return data as T;
}
