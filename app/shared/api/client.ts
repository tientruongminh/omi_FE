// ─── API Base Configuration ───────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  error: string;
  status: number;
}

export interface SseEventPayload<T = unknown> {
  event: string;
  data: T;
}

/**
 * Lightweight fetch wrapper with automatic JSON handling,
 * token injection from cookies, and error normalization.
 */
// ─── Upload Response ──────────────────────────────────────────

export interface UploadResponse {
  url: string;
  object_name: string;
  original_name: string;
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

// Hàm chuyên biệt để xử lý các API trả về stream sự kiện (Server-Sent Events) như tiến độ tạo roadmap, chat admin AI, v.v.
export async function apiFetchEventStream<TResult = unknown>(
  path: string,
  options: RequestInit & {
    onEvent?: (payload: SseEventPayload) => void;
  } = {},
): Promise<TResult> {
  const url = `${API_BASE}${path}`;
  // Đọc token từ cookie để gửi cùng yêu cầu (nếu có)
  let token = '';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    token = match ? decodeURIComponent(match[1]) : '';
  }

  // Thiết lập headers cho yêu cầu stream, bao gồm token nếu có và đảm bảo chấp nhận định dạng text/event-stream
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Gửi yêu cầu fetch và xử lý phản hồi stream sự kiện
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = 'Something went wrong';
    try {
      const data = JSON.parse(text);
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw { error: errorMessage, status: res.status } as ApiError;
  }

  if (!res.body) {
    throw { error: 'Streaming response body is empty.', status: 500 } as ApiError;
  }

  // Sử dụng ReadableStream để đọc dữ liệu sự kiện từng phần một cách hiệu quả, giải mã và phân tích cú pháp theo định dạng Server-Sent Events
  // Thay vì dùng EventSource, chúng ta tự xử lý stream để có thể dễ dàng tích hợp với token và các tùy chỉnh khác của fetch
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const parseEventBlock = (block: string): SseEventPayload | null => {
    const lines = block.split('\n');
    let event = 'message';
    const dataLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line || line.startsWith(':')) continue;
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
        continue;
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (!dataLines.length) return null;

    const rawData = dataLines.join('\n');
    let data: unknown = rawData;
    try {
      data = JSON.parse(rawData);
    } catch {
      data = rawData;
    }

    return { event, data };
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done }).replace(/\r/g, '');

    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf('\n\n');

      const parsed = parseEventBlock(block);
      if (!parsed) continue;

      options.onEvent?.(parsed);

      if (parsed.event === 'final' || parsed.event === 'review') {
        return parsed.data as TResult;
      }
      if (parsed.event === 'error') {
        const err = parsed.data as { message?: string; status?: number };
        throw {
          error: err?.message || 'Streaming request failed.',
          status: err?.status || 500,
        } as ApiError;
      }
    }

    if (done) break;
  }

  return {} as TResult;
}
