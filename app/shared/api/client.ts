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
// ─── Upload Response ──────────────────────────────────────────

export interface UploadResponse {
  url: string;
  object_name: string;
  size: number;
  mimetype: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Upload a file to the gateway's /upload endpoint (multipart/form-data).
 * Returns the MinIO object_name to be used as a minio_key when creating roadmaps.
 */
export async function apiUpload(file: File): Promise<UploadResponse> {
  if (file.size > MAX_FILE_SIZE) {
    throw {
      error: `File "${file.name}" vượt quá giới hạn 50 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
      status: 413,
    } as ApiError;
  }

  const url = `${API_BASE}/upload`;

  let token = '';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    token = match ? decodeURIComponent(match[1]) : '';
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Do NOT set Content-Type — browser auto-adds multipart boundary

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw {
      error: data.error || data.message || 'Upload thất bại',
      status: res.status,
    } as ApiError;
  }

  return data as UploadResponse;
}

// ─── JSON Fetch ───────────────────────────────────────────────

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
