/**
 * Typed API client for LETO backend.
 *
 * All fetch calls go through `apiFetch<T>()` which:
 *  - Sends cookies (credentials: "include")
 *  - Throws ApiError on HTTP errors (so React Query can catch + retry)
 *  - Returns typed responses
 *
 * Usage:
 *   const metrics = await apiFetch<DashboardMetrics>('/api/v1/dashboard/metrics');
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// ── Error type ────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Core fetch ────────────────────────────────────────────────────────────
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = null; }
    throw new ApiError(
      res.status,
      (body as any)?.detail || (body as any)?.error || `HTTP ${res.status}`,
      body,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  is_onboarded: boolean;
  tiendanube_id: string;
}

export interface DashboardMetrics {
  total_products: number;
  products_with_cost: number;
  products_without_cost: number;
  avg_margin: number;
  negative_margin_count: number;
  low_margin_count: number;
  good_margin_count: number;
  monthly_sales_units: number;
  revenue_at_risk: number;
  potential_monthly_gain: number;
  recommendations_applied: number;
  onboarding_complete: boolean;
  active_problems: number;
  problems_by_type: Record<string, number>;
}

export interface Product {
  id: number;
  tiendanube_id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  cost: number | null;
  promotional_price: number | null;
  stock: number;
  margin: number | null;
  monthly_sales: number;
  synced_at: string | null;
  is_active?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  margin_stats: {
    avg_margin: number;
    min_margin: number;
    max_margin: number;
    negative_margin: number;
    low_margin: number;
    good_margin: number;
    total_products: number;
  };
}

export interface HistoryPoint {
  date: string;
  avg_margin: number;
  negative_count: number;
  low_count: number;
  good_count: number;
  revenue_at_risk: number;
  potential_gain: number;
}

export interface PlanStatus {
  plan: string;
  plan_name: string;
  price_usd: number;
  product_limit: number | null;
  features: Record<string, boolean>;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
  is_trial: boolean;
  days_remaining: number | null;
}

export interface StoreSettings {
  platform_commission_pct: number;
  payment_commission_pct: number;
  avg_shipping_cost: number;
}

// ── API functions (used by React Query) ──────────────────────────────────
export const api = {
  auth: {
    me: () => apiFetch<User>('/api/v1/auth/me'),
    logout: () => apiFetch<void>('/api/v1/auth/logout', { method: 'POST' }),
  },

  dashboard: {
    metrics: () => apiFetch<DashboardMetrics>('/api/v1/dashboard/metrics'),
    history: (days = 30) =>
      apiFetch<HistoryPoint[]>(`/api/v1/dashboard/history?days=${days}`),
  },

  products: {
    list: (params: {
      skip?: number;
      limit?: number;
      category?: string;
      margin_level?: string;
    } = {}) => {
      const q = new URLSearchParams();
      if (params.skip)         q.set('skip',         String(params.skip));
      if (params.limit)        q.set('limit',        String(params.limit));
      if (params.category)     q.set('category',     params.category);
      if (params.margin_level) q.set('margin_level', params.margin_level);
      return apiFetch<ProductsResponse>(`/api/v1/products/?${q}`);
    },
    withoutCost: () => apiFetch<ProductsResponse>('/api/v1/products/without-cost'),
    categories:  () => apiFetch<string[]>('/api/v1/products/categories'),
    forCharts:   () =>
      apiFetch<ProductsResponse>('/api/v1/products/?limit=200'),
    priceForMargin: (productId: number, targetMargin: number) =>
      apiFetch<{
        product_id: number;
        product_name: string;
        current_price: number;
        current_margin: number | null;
        target_margin: number;
        required_price: number;
        price_delta: number;
        price_delta_pct: number;
        cost: number;
        store_commissions_pct: number;
      }>(`/api/v1/products/${productId}/price-for-margin?target_margin=${targetMargin}`),
  },

  recommendations: {
    get: (productId: number) =>
      apiFetch<any>(`/api/v1/recommendations/${productId}`),
    apply: (productId: number, optionId: string) =>
      apiFetch<any>(`/api/v1/recommendations/${productId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ option_id: optionId }),
      }),
    bulkApply: (productIds: number[], optionId = 'A') =>
      apiFetch<any>('/api/v1/recommendations/bulk-apply', {
        method: 'POST',
        body: JSON.stringify({ product_ids: productIds, option_id: optionId }),
      }),
    history: (skip = 0, limit = 50) =>
      apiFetch<any>(`/api/v1/recommendations/history/all?skip=${skip}&limit=${limit}`),
  },

  billing: {
    plan:       () => apiFetch<PlanStatus>('/api/v1/billing/plan'),
    startTrial: () => apiFetch<any>('/api/v1/billing/start-trial', { method: 'POST' }),
    upgrade:    (plan: string) =>
      apiFetch<any>('/api/v1/billing/upgrade', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      }),
  },

  settings: {
    get:  () => apiFetch<StoreSettings>('/api/v1/settings/'),
    save: (data: Partial<StoreSettings>) =>
      apiFetch<StoreSettings>('/api/v1/settings/', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  sync: {
    trigger: () => apiFetch<any>('/api/v1/sync/', { method: 'POST' }),
    status:  () => apiFetch<any>('/api/v1/sync/status'),
  },
};
