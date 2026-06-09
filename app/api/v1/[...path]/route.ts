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
  const { path } = await context.params;

  // Read cookie from raw header — more reliable than request.cookies in Next.js 14
  const rawCookie = request.headers.get('cookie');
  const token = parseCookie(rawCookie, 'leto_token')
    ?? request.cookies.get('leto_token')?.value;

  const search = request.nextUrl.search;
  // Ensure trailing slash for Railway FastAPI endpoints
  const pathStr = path.join('/');
  const url = `${RAILWAY}/api/v1/${pathStr}${search}`;

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
    upstream = await fetch(url, { method, headers, body });
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
