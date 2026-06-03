'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Client-side auth guard for (protected) routes.
 * Works as a fallback alongside middleware.ts.
 * Middleware handles SSR redirects; this handles edge cases
 * where the cookie hasn't been set yet (e.g. first load race).
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/');
    }
  }, [router]);

  return <>{children}</>;
}
