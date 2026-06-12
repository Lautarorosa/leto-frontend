/**
 * Catch-all proxy for Railway API calls.
 *
 * Problem: the `leto_token` cookie lives on the Vercel domain. The dashboard
 * makes direct calls to Railway (a different domain), so the browser never
 * sends the cookie — Railway sees no auth and returns 403.
 *
 * Fix: route all /api/v1/* calls through this Next.js handler, which:
 *  1. Reads `leto_token` from the HttpOnly cookie (server-side, safe)
 *  2. Forwards the request to Railway with Authorization: Bearer <token>
 *  3. Streams the response back to the browser
 *
 * Requires NEXT_PUBLIC_API_URL="" in Vercel (empty → relative URLs hit Vercel,
 * not Railway directly) and RAILWAY_API_URL=<railway-url> (server-side only).
 */

import { NextRequest, NextResponse } from 'next/server';

const RAILWAY = (process.env.RAILWAY_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

type Context = { params: Promise<{ path: string[] }> };

function parseCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k.trim() === name) return v.join('=').trim();
  }
  return undefined;
}

async function proxy(request: NextRequest, context: Context, method: string) {
  // Read cookie from raw header — more reliable than request.cookies in Next.js 14
  const rawCookie = request.headers.get('cookie');
  const token = parseCookie(rawCookie, 'leto_token')
    ?? request.cookies.get('leto_token')?.value;

  const search = request.nextUrl.search;
  // Preserve trailing slash from original URL — FastAPI redirect_slashes=False needs exact path
  const originalPathname = request.nextUrl.pathname; // e.g. /api/v1/products/
  const apiPath = originalPathname.replace(/^\/api\/v1\//, ""); // e.g. products/
  const url = `${RAILWAY}/api/v1/${apiPath}${search}`;

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log(`[proxy] ${method} ${url} token=${token ? 'present' : 'MISSING'}`);

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    try { body = await request.text(); } catch { /* empty body */ }
  }

  let upstream: Response;
  try {
    // Use manual redirect so we can re-attach Authorization on 307/308.
    // Node's automatic redirect following strips the Authorization header,
    // which causes Railway's FastAPI to return 403 when it redirects
    // /products → /products/ (redirect_slashes=True).
    upstream = await fetch(url, { method, headers, body, redirect: 'manual' });

    // Follow any 3xx redirect while preserving method + Authorization.
    // Browsers change POST→GET on 301/302; we always keep the original method.
    // FastAPI's redirect_slashes=True issues 301 for missing trailing slash.
    if (
      upstream.status >= 301 && upstream.status <= 308 &&
      upstream.headers.get('location')
    ) {
      const loc = upstream.headers.get('location')!;
      const redirectUrl = loc.startsWith('http') ? loc : `${RAILWAY}${loc}`;
      console.log(`[proxy] redirect ${upstream.status} → ${redirectUrl}`);
      upstream = await fetch(redirectUrl, { method, headers, body, redirect: 'manual' });
    }
  } catch (err) {
    console.error('[proxy] fetch failed:', err);
    return NextResponse.json({ error: 'upstream_unavailable' }, { status: 502 });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  });
}

export const GET    = (req: NextRequest, ctx: Context) => proxy(req, ctx, 'GET');
export const POST   = (req: NextRequest, ctx: Context) => proxy(req, ctx, 'POST');
export const PUT    = (req: NextRequest, ctx: Context) => proxy(req, ctx, 'PUT');
export const PATCH  = (req: NextRequest, ctx: Context) => proxy(req, ctx, 'PATCH');
export const DELETE = (req: NextRequest, ctx: Context) => proxy(req, ctx, 'DELETE');
