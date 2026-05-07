export function normalizeUploadUrl(url?: string | null): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    const isInternalMinio = parsed.hostname === 'minio' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const uploadsIndex = pathParts.indexOf('uploads');

    if (isInternalMinio && uploadsIndex >= 0 && pathParts[uploadsIndex + 1]) {
      const objectName = pathParts.slice(uploadsIndex + 1).join('/');
      return `/api/upload/${encodeURIComponent(objectName)}`;
    }
  } catch {
    // Keep relative or malformed URLs as-is.
  }

  if (url.startsWith('/uploads/')) {
    return `/api/upload/${encodeURIComponent(url.replace(/^\/uploads\//, ''))}`;
  }

  return url;
}
