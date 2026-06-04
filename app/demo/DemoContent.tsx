'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function DemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#000000]">
      <div className="text-center">
        <div className="spinner border-[#00d641] mx-auto mb-4 h-10 w-10" />
        <p className="text-slate-500 text-sm">Cargando demo...</p>
      </div>
    </div>
  );
}
