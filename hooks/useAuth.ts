'use client';

/**
 * useAuth — authentication state via React Query.
 *
 * Returns:
 *   user       — User object (null if not authenticated)
 *   isLoading  — true while the initial /me check is in flight
 *   isOnboarded — shortcut from user.is_onboarded
 *   logout     — clears cookie + redirects to /
 *
 * Uses the shared React Query cache — only one /me request per session,
 * no matter how many components call useAuth().
 */

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useMe, QK } from './useLetoQuery';
import { api } from '@/lib/api';
import { clearAuth } from './useApi';

export function useAuth() {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const { data: user, isLoading, error } = useMe();

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore — we'll clear local state regardless
    }
    clearAuth();
    queryClient.clear();   // wipe all cached data on logout
    router.push('/');
  };

  return {
    user:        user ?? null,
    isLoading,
    isAuthenticated: !!user && !error,
    isOnboarded: user?.is_onboarded ?? false,
    logout,
  };
}
