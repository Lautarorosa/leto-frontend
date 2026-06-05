/**
 * React Query hooks for LETO — typed, cached, with error handling.
 *
 * All hooks use consistent staleTime so the dashboard feels instant
 * on re-visits without hammering the backend.
 */
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { api, type Product } from '@/lib/api';

// ── Query keys (single source of truth) ──────────────────────────────────
export const QK = {
  me:          ['me']           as const,
  metrics:     ['metrics']      as const,
  history:     (days: number)   => ['history', days] as const,
  products:    (params: object) => ['products', params] as const,
  chartProds:  ['chartProds']   as const,
  categories:  ['categories']   as const,
  plan:        ['plan']         as const,
  settings:    ['settings']     as const,
  rec:         (id: number)     => ['rec', id] as const,
};

const STALE = {
  user:     5 * 60 * 1000,   // 5 min — user data changes rarely
  metrics:  60 * 1000,        // 1 min — KPIs can change after sync
  products: 60 * 1000,        // 1 min
  history:  10 * 60 * 1000,   // 10 min — snapshots are daily
  plan:     5 * 60 * 1000,    // 5 min
  static:   30 * 60 * 1000,   // 30 min — categories, settings
};

// ── Auth ──────────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: QK.me,
    queryFn:  api.auth.me,
    staleTime: STALE.user,
    retry: (count, err: any) => {
      // Don't retry 401/403 — user is not authenticated
      if (err?.status === 401 || err?.status === 403) return false;
      return count < 2;
    },
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export function useDashboardMetrics() {
  return useQuery({
    queryKey: QK.metrics,
    queryFn:  api.dashboard.metrics,
    staleTime: STALE.metrics,
    refetchOnWindowFocus: false,
  });
}

export function useDashboardHistory(days = 30) {
  return useQuery({
    queryKey: QK.history(days),
    queryFn:  () => api.dashboard.history(days),
    staleTime: STALE.history,
    refetchOnWindowFocus: false,
  });
}

// ── Products ──────────────────────────────────────────────────────────────
export function useProducts(params: {
  skip?: number;
  limit?: number;
  category?: string | null;
  margin_level?: string | null;
} = {}) {
  return useQuery({
    queryKey: QK.products(params),
    queryFn:  () => api.products.list({
      skip:         params.skip,
      limit:        params.limit ?? 50,
      category:     params.category ?? undefined,
      margin_level: params.margin_level ?? undefined,
    }),
    staleTime: STALE.products,
    placeholderData: (prev) => prev,   // keep previous data while loading new page
  });
}

export function useProductsWithoutCost() {
  return useQuery({
    queryKey: QK.products({ noCost: true }),
    queryFn:  api.products.withoutCost,
    staleTime: STALE.products,
  });
}

/** Large fetch for charts — shared cache, no double request */
export function useChartProducts() {
  return useQuery({
    queryKey: QK.chartProds,
    queryFn:  api.products.forCharts,
    staleTime: STALE.products,
    refetchOnWindowFocus: false,
    select: (data) => data.products,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QK.categories,
    queryFn:  api.products.categories,
    staleTime: STALE.static,
  });
}

// ── Billing ───────────────────────────────────────────────────────────────
export function usePlan() {
  return useQuery({
    queryKey: QK.plan,
    queryFn:  api.billing.plan,
    staleTime: STALE.plan,
    retry: 1,
  });
}

// ── Settings ──────────────────────────────────────────────────────────────
export function useSettings() {
  return useQuery({
    queryKey: QK.settings,
    queryFn:  api.settings.get,
    staleTime: STALE.static,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────

export function useSyncStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.sync.trigger,
    onSuccess: () => {
      // After sync, invalidate products + metrics so they re-fetch fresh
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: QK.metrics });
        qc.invalidateQueries({ queryKey: QK.chartProds });
      }, 2000); // small delay — backend processes async
    },
  });
}

export function useApplyRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, optionId }: { productId: number; optionId: string }) =>
      api.recommendations.apply(productId, optionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.metrics });
      qc.invalidateQueries({ queryKey: QK.chartProds });
      // Invalidate all product queries (various filter combinations)
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'products' });
    },
  });
}

export function useBulkApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productIds, optionId }: { productIds: number[]; optionId?: string }) =>
      api.recommendations.bulkApply(productIds, optionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.metrics });
      qc.invalidateQueries({ queryKey: QK.chartProds });
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'products' });
    },
  });
}

export function useUpdateCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, cost }: { productId: number; cost: number }) =>
      fetch(`/api/v1/products/${productId}/cost`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'products' });
      qc.invalidateQueries({ queryKey: QK.metrics });
    },
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.settings.save,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.settings });
      // Settings affect margin calculations — invalidate all
      qc.invalidateQueries({ queryKey: QK.metrics });
      qc.invalidateQueries({ queryKey: QK.chartProds });
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'products' });
    },
  });
}

export function useStartTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.billing.startTrial,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.plan }),
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => api.billing.upgrade(plan),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.plan }),
  });
}
