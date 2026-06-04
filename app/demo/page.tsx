export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { DemoContent } from './DemoContent';

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#111]">
          <div className="spinner border-[#00d641] h-10 w-10" />
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}
