import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED = ['/dashboard', '/onboarding', '/recommendations'];

// Routes only for unauthenticated users
const AUTH_ONLY = ['/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('leto_token')?.value;

  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));
  const isAuthOnly  = AUTH_ONLY.includes(pathname);

  // Not authenticated → redirect to home
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Already authenticated → skip the connect gate
  if (isAuthOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public files
     * - /auth/* (login/callback flows)
     * - /api/* (if any Next.js API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|api|public).*)',
  ],
};
