import { NextResponse } from 'next/server';

/**
 * Clear the HttpOnly leto_token cookie on the Vercel domain.
 * The cookie is set here (Vercel), so only this server can delete it.
 * Railway's /auth/logout can't delete Vercel-domain cookies.
 */
export async function POST() {
  const response = NextResponse.json({ status: 'ok' });
  response.cookies.delete({
    name: 'leto_token',
    path: '/',
  });
  return response;
}
