import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for the Railway auth/token endpoint.
 *
 * Problem: the Railway backend sets the `leto_token` HttpOnly cookie on its
 * own domain (*.railway.app). Next.js middleware runs on the Vercel domain and
 * cannot read cookies from a different origin, so the user always appears
 * unauthenticated even after a successful OAuth.
 *
 * Fix: this route runs server-side (Node.js), fetches Railway's /auth/token,
 * extracts the JWT from the Set-Cookie header, and re-issues it as an HttpOnly
 * cookie on the Vercel domain. The JWT never touches client-side JS.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 });
  }

  try {
    const backendRes = await fetch(
      `${API_BASE}/api/v1/auth/token?code=${encodeURIComponent(code)}`
    );

    if (!backendRes.ok) {
      const detail = await backendRes.text().catch(() => 'auth_failed');
      return NextResponse.json({ error: detail }, { status: 401 });
    }

    const data = await backendRes.json();

    // Railway returns the JWT in `access_token` so we can re-issue it as an
    // HttpOnly cookie on the Vercel domain without parsing Set-Cookie headers.
    const tokenValue: string | undefined = data.access_token;
    // Strip the raw token before forwarding to the client — never expose to JS.
    const { access_token: _drop, ...clientData } = data;

    const response = NextResponse.json(clientData);

    if (tokenValue) {
      const isProd = process.env.NODE_ENV === 'production';
      response.cookies.set('leto_token', tokenValue, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',   // lax allows the post-OAuth redirect to carry cookies
        maxAge: 24 * 3600,
        path: '/',
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'auth_failed' }, { status: 500 });
  }
}
