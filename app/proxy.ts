import { NextRequest, NextResponse } from 'next/server';

// ─── Route Protection Proxy (Next.js 16) ─────────────────────
// Runs at the edge — no access to Zustand store; we rely on
// the presence of the access_token cookie as a quick gate.

/** Routes that require authentication */
const PROTECTED_PREFIXES = [
  '/project',
  '/dashboard',
  '/learn',
  '/roadmap',
  '/workspace',
  '/admin',
  '/teacher',
];

/** Routes that should redirect away if already logged in */
const AUTH_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // Skip static / API / _next routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ─── Protected routes: redirect to login if no token ────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Auth routes: redirect to project if already logged in ─
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/project', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
