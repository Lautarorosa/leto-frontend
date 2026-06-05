'use client';

/**
 * QueryProvider — wraps the app with React Query's QueryClientProvider.
 * Must be a client component (can't use QueryClientProvider in a server layout).
 */
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on every window focus — annoying for a dashboard
        refetchOnWindowFocus: false,
        // Retry once on failure, but not on 4xx errors
        retry: (failureCount, error: any) => {
          if (error?.status >= 400 && error?.status < 500) return false;
          return failureCount < 1;
        },
        // Show stale data while revalidating — "instant" feel
        staleTime: 60 * 1000,
      },
      mutations: {
        // Don't retry mutations by default
        retry: false,
      },
    },
  });
}

// Browser singleton — avoids creating a new client on every render
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use useState so the client is stable during server rendering
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
