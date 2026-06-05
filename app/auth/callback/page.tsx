// Server component — force-dynamic so useSearchParams() works without Suspense
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AuthCallbackContent from './AuthCallbackContent';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#111]">
          <div className="spinner border-[#00d641] h-10 w-10" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
