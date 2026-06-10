'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProductsTable, type Product } from '@/components/ProductsTable';
import { RecommendationModal } from '@/components/RecommendationModal';
import { SettingsModal } from '@/components/SettingsModal';
import { MarginTrendChart } from '@/components/MarginTrendChart';
import { BulkRecommendationsModal } from '@/components/BulkRecommendationsModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTheme } from '@/context/ThemeContext';
import LetoLogo from '@/components/LetoLogo';
import {
  useDashboardMetrics,
  useChartProducts,
  useSyncStore,
  usePlan,
  QK,
} from '@/hooks/useLetoQuery';
import { api } from '@/lib/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

// ── Brand colors ───────────────────────────────────────────────────────────
const GREEN  = '#15803d';
const RED    = '#D64545';
const AMBER  = '#b45309';

// ── Types ──────────────────────────────────────────────────────────────────

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
  recommendations_applied: number;
  onboarding_complete: boolean;
  active_problems: number;
  problems_by_type: Record<string, number>;
}

interface CostBreakdown {
  price: number;
  cost: number;
  platform_commission_pct: number;
  platform_commission_amount: number;
  payment_commission_pct: number;
  payment_commission_amount: number;
  shipping_cost: number;
  total_costs: number;
  gross_profit: number;
  margin_pct: number;
  store_name?: string;
}

interface Recommendation {
  product_id: number;
  product_name: string;
  current_margin: number;
  target_margin: number;
  options: { option_id: string; action_type: string; risk_level: string; score: number; description: string }[];
  recommended_option: string;
  cost_breakdown?: CostBreakdown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function marginColor(m: number | null) {
  if (m === null) return '#9ca3af';
  if (m < 0)   return RED;
  if (m < 20)  return AMBER;
  return GREEN;
}

// ── SVG Icons ──────────────────────────────────────────────────────────────

const Icon = {
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
  ),
  AlertTriangle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
  ),
  XCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  MinusCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  Package: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
  ),
  Moon: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
  ),
  Sun: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707z" clipRule="evenodd"/></svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
  ),
  Spin: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
  ),
};

// ── Sync Button ────────────────────────────────────────────────────────────

function SyncButton() {
  const { mutate, isPending, isSuccess, isError, reset } = useSyncStore();

  const style = isPending ? 'text-[#15803d] border-[#15803d]/40 cursor-wait'
    : isSuccess            ? 'text-[#15803d] border-[#15803d]'
    : isError              ? 'text-[#D64545] border-[#D64545]/40'
    :                        'text-slate-500 dark:text-slate-400 hover:text-[#15803d] hover:border-[#15803d]/40';

  const handleClick = () => {
    if (isPending) return;
    if (isSuccess || isError) { reset(); return; }
    mutate();
  };

  useEffect(() => {
    if (isSuccess || isError) {
      const t = setTimeout(reset, 2500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, isError, reset]);

  return (
    <button onClick={handleClick} disabled={isPending}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium transition-all ${style}`}>
      {isPending ? <Icon.Spin /> : isSuccess ? <Icon.Check /> : <Icon.Refresh />}
      {isPending ? 'Sincronizando…' : isSuccess ? 'Listo' : isError ? 'Error' : 'Sincronizar'}
    </button>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon, accent }: {
  label: string; value: string | number; sub: string;
  color?: string; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className="relative bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5 flex flex-col gap-3 overflow-hidden hover:border-slate-300 dark:hover:border-white/15 transition-all duration-200">
      {/* accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: color || '#e5e7eb', opacity: 0.7 }} />
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">{label}</p>
        <span className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">{icon}</span>
      </div>
      <div>
        <p className="text-[28px] font-black leading-none tracking-tight" style={{ color: color || '#111827' }}>{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{sub}</p>
      </div>
      {accent && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
          <p className="text-[11px] font-semibold" style={{ color }}>{accent}</p>
        </div>
      )}
    </div>
  );
}

// ── Margin Donut ───────────────────────────────────────────────────────────

function MarginDonut({ metrics }: { metrics: DashboardMetrics }) {
  const data = [
    { name: 'Crítico',  value: metrics.negative_margin_count, fill: RED },
    { name: 'Bajo',     value: metrics.low_margin_count,      fill: AMBER },
    { name: 'Bueno',    value: metrics.good_margin_count,     fill: GREEN },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
      <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">Distribución</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
            paddingAngle={2} dataKey="value" stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid var(--tooltip-border, #e5e7eb)', borderRadius: 8, fontSize: 11, color: 'var(--tooltip-text, #111)' }}
            formatter={(v: number) => [`${v} productos`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-1">
        {[
          { label: 'Crítico (< 0%)',  count: metrics.negative_margin_count, color: RED },
          { label: 'Bajo (0–20%)',    count: metrics.low_margin_count,      color: AMBER },
          { label: 'Bueno (≥ 20%)',   count: metrics.good_margin_count,     color: GREEN },
        ].map(d => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-slate-500 dark:text-slate-400">{d.label}</span>
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {d.count} <span className="text-slate-400 font-normal">({total > 0 ? Math.round(d.count/total*100) : 0}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Worst Margins Chart ────────────────────────────────────────────────────

function WorstChart({ products }: { products: Product[] }) {
  const data = [...products]
    .filter(p => p.margin !== null)
    .sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0))
    .slice(0, 6)
    .map(p => ({
      name: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name,
      margin: +(p.margin ?? 0).toFixed(1),
      fill: marginColor(p.margin),
    }));

  return (
    <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
      <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">Peores márgenes</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 28, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
          <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid var(--tooltip-border, #e5e7eb)', borderRadius: 8, fontSize: 11, color: 'var(--tooltip-text, #111)' }}
            formatter={(v: number) => [`${v}%`, 'Margen']}
          />
          <Bar dataKey="margin" radius={[0, 3, 3, 0]} maxBarSize={14}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Category Bars ──────────────────────────────────────────────────────────

function CategoryBars({ products }: { products: Product[] }) {
  const cats: Record<string, { sum: number; count: number }> = {};
  for (const p of products) {
    if (!p.category || p.margin === null) continue;
    if (!cats[p.category]) cats[p.category] = { sum: 0, count: 0 };
    cats[p.category].sum += p.margin;
    cats[p.category].count++;
  }
  const rows = Object.entries(cats)
    .map(([name, { sum, count }]) => ({ name, avg: +(sum / count).toFixed(1) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 7);

  return (
    <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
      <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">Por categoría</p>
      <div className="space-y-3.5">
        {rows.map(r => (
          <div key={r.name}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-600 dark:text-slate-300">{r.name}</span>
              <span className="text-xs font-semibold" style={{ color: marginColor(r.avg) }}>{r.avg}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${Math.min(100, Math.max(2, (r.avg + 10) * 1.2))}%`,
                background: marginColor(r.avg),
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Priority List ──────────────────────────────────────────────────────────

function PriorityList({ products, onSelect }: { products: Product[]; onSelect: (p: Product) => void }) {
  const list = [...products]
    .filter(p => p.margin !== null && p.margin < 20)
    .sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0))
    .slice(0, 5);

  if (list.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
      <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">Requieren acción</p>
      <div className="divide-y divide-slate-100 dark:divide-white/6">
        {list.map(p => (
          <button key={p.id} onClick={() => onSelect(p)}
            className="w-full flex items-center justify-between py-3 group text-left hover:bg-slate-50 dark:hover:bg-white/3 transition-colors -mx-5 px-5 first:-mt-3 last:-mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: marginColor(p.margin) }} />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#15803d] transition-colors">{p.name}</p>
                <p className="text-[10px] text-slate-400">{p.category}{p.sku ? ` · ${p.sku}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: marginColor(p.margin) }}>
                  {p.margin !== null ? `${p.margin.toFixed(1)}%` : '—'}
                </p>
                <p className="text-[10px] text-slate-400">${p.price.toLocaleString('es-AR')}</p>
              </div>
              <Icon.ChevronRight />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, isLoading, logout }      = useAuth();
  const { theme, toggleTheme }           = useTheme();
  const router                           = useRouter();
  const queryClient                      = useQueryClient();

  // ── React Query data ──────────────────────────────────────────────────
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useDashboardMetrics();

  const {
    data: products = [],
    error: productsError,
  } = useChartProducts();

  const { data: planData } = usePlan();
  const plan = planData?.plan ?? 'free';

  // ── UI state (no data in here) ────────────────────────────────────────
  const [selected, setSelected]         = useState<Product | null>(null);
  const [rec, setRec]                   = useState<Recommendation | null>(null);
  const [loadingRec, setLoadingRec]     = useState(false);
  const [exporting, setExporting]       = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);
  const [activeTab, setActiveTab]       = useState<'all' | 'critical' | 'low' | 'nocost'>('all');
  const [healthyProduct, setHealthyProduct] = useState<string | null>(null);
  const [noCostToast, setNoCostToast]   = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bulkOpen, setBulkOpen]         = useState(false);
  const [upgradeOpen, setUpgradeOpen]   = useState(false);

  // ── Auth guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: QK.metrics });
    queryClient.invalidateQueries({ queryKey: QK.chartProds });
    queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'products' });
  };

  const handleSelect = async (p: Product) => {
    if (p.margin === null) {
      setNoCostToast(p.name);
      setTimeout(() => setNoCostToast(null), 4000);
      return;
    }
    setHealthyProduct(null);
    setNoCostToast(null);
    setSelected(p);
    setLoadingRec(true);
    try {
      const r = await api.recommendations.get(p.id);
      if (r && Array.isArray(r.options) && r.options.length > 0) {
        setRec(r);
      } else {
        setSelected(null);
        setHealthyProduct(p.name);
        setTimeout(() => setHealthyProduct(null), 4000);
      }
    } catch {
      setSelected(null);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleClose = () => { setSelected(null); setRec(null); };

  const handleExport = async () => {
    if (!metrics || exporting) return;
    setExporting(true);
    try {
      const { generatePDFReport } = await import('@/utils/pdfReport');
      const histData = await api.recommendations.history();
      await generatePDFReport(metrics, products, user?.name || 'Mi Tienda', histData?.items);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (exportingXlsx || products.length === 0) return;
    setExportingXlsx(true);
    try {
      const { exportProductsToExcel } = await import('@/utils/exportExcel');
      await exportProductsToExcel(products, user?.name || 'MiTienda');
    } finally {
      setExportingXlsx(false);
    }
  };

  // ── Loading / auth ────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="spinner h-8 w-8" style={{ borderColor: GREEN }} />
    </div>
  );
  if (!user) return null;

  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const tabs = [
    { id: 'all',      label: 'Todos',       count: metrics?.total_products },
    { id: 'critical', label: 'Críticos',    count: metrics?.negative_margin_count },
    { id: 'low',      label: 'Margen bajo', count: metrics?.low_margin_count },
    { id: 'nocost',   label: 'Sin costo',   count: metrics?.products_without_cost },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0d0d0d]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/8">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-5">

          {/* LETO identity */}
          <div className="flex items-center flex-shrink-0">
            <LetoLogo size={28} />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />

          {/* Store context */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d641] shadow-[0_0_6px_#00d641]" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[200px]">{user.name || user.email}</p>
              <p className="text-[10px] text-slate-400">{today}</p>
            </div>
          </div>

          {/* Plan badge */}
          <button onClick={() => setUpgradeOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${
              plan === 'pro'
                ? 'bg-slate-900 dark:bg-white/10 text-white'
                : plan === 'basic'
                ? 'bg-[#15803d]/10 text-[#15803d] dark:bg-[#15803d]/20 dark:text-green-400'
                : 'bg-slate-100 dark:bg-white/8 text-slate-500 hover:bg-[#15803d]/10 hover:text-[#15803d]'
            }`}>
            {plan === 'free' ? (
              <>
                <span>Gratis</span>
                <span className="text-[9px] opacity-60">→ Mejorar</span>
              </>
            ) : plan === 'basic' ? (
              <span>Básico ✓</span>
            ) : (
              <span>Pro ⚡</span>
            )}
          </button>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Export Excel */}
            <button onClick={handleExportExcel} disabled={exportingXlsx || products.length === 0}
              title="Exportar a Excel"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#15803d] hover:border-[#15803d]/40 transition-all disabled:opacity-40">
              {exportingXlsx ? <Icon.Spin /> : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              )}
              <span className="hidden sm:block">{exportingXlsx ? 'Exportando…' : 'Excel'}</span>
            </button>

            {/* Export PDF */}
            <button onClick={handleExport} disabled={exporting || !metrics}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#15803d] hover:border-[#15803d]/40 transition-all disabled:opacity-40">
              {exporting ? <Icon.Spin /> : <Icon.Download />}
              <span className="hidden sm:block">{exporting ? 'Generando…' : 'PDF'}</span>
            </button>

            {/* Aplicar en masa */}
            {metrics && (metrics.negative_margin_count + metrics.low_margin_count) > 0 && (
              <button onClick={() => setBulkOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/40 text-xs font-semibold text-[#D64545] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span className="hidden sm:block">Aplicar en masa</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 dark:bg-red-900/30">
                  {metrics.negative_margin_count + metrics.low_margin_count}
                </span>
              </button>
            )}

            {/* Settings — comisiones y envío */}
            <button onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#15803d] hover:border-[#15803d]/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="hidden sm:block">Comisiones</span>
            </button>

            <SyncButton />

            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-[#15803d] hover:border-[#15803d]/40 transition-all">
              {theme === 'light' ? <Icon.Moon /> : <Icon.Sun />}
            </button>

            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-400 hover:text-[#D64545] hover:border-[#D64545]/30 transition-all">
              <Icon.Logout />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Page title */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: GREEN }} />
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GREEN }}>Panel de márgenes</p>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {user.name ? user.name : 'Tu tienda'}
            </h1>
            <p className="text-xs text-slate-400">Margen real con comisiones incluidas · {today}</p>
          </div>
          {metrics && metrics.negative_margin_count > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: `${RED}30`, background: `${RED}08` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: RED }} />
              <p className="text-xs font-bold" style={{ color: RED }}>
                {metrics.negative_margin_count} {metrics.negative_margin_count === 1 ? 'producto en pérdida' : 'productos en pérdida'}
              </p>
            </div>
          )}
        </div>

        {/* ── Alert banners ─────────────────────────────────────── */}
        {metrics && !metricsLoading && (() => {
          const alerts: { id: string; level: 'critical' | 'warning'; icon: React.ReactNode; title: string; body: string; cta?: string; ctaAction?: () => void }[] = [];

          if (metrics.negative_margin_count > 0) {
            alerts.push({
              id: 'negative',
              level: 'critical',
              icon: <Icon.XCircle />,
              title: `${metrics.negative_margin_count} ${metrics.negative_margin_count === 1 ? 'producto está vendiendo a pérdida' : 'productos están vendiendo a pérdida'}`,
              body: `Cada venta de estos productos te cuesta dinero. El precio actual no cubre el costo más comisiones.`,
              cta: 'Ver productos críticos',
              ctaAction: () => setActiveTab('critical'),
            });
          }

          if (metrics.revenue_at_risk > 50_000) {
            alerts.push({
              id: 'revenue',
              level: 'warning',
              icon: <Icon.AlertTriangle />,
              title: `${fmtMoney(metrics.revenue_at_risk)} en ingresos con margen insuficiente`,
              body: `Productos con margen bajo están generando facturación sin ganancia real. Ajustar precios puede recuperar ese margen.`,
              cta: 'Ver margen bajo',
              ctaAction: () => setActiveTab('low'),
            });
          }

          if (metrics.products_without_cost > 0 && metrics.products_with_cost > 0) {
            alerts.push({
              id: 'nocost',
              level: 'warning',
              icon: <Icon.Package />,
              title: `${metrics.products_without_cost} productos sin costo cargado`,
              body: `LETO no puede calcular su margen real. Completalos para tener el panorama completo.`,
              cta: 'Ver sin costo',
              ctaAction: () => setActiveTab('nocost'),
            });
          }

          if (alerts.length === 0) return null;

          return (
            <div className="space-y-2">
              {alerts.map(a => (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm
                    ${a.level === 'critical'
                      ? 'bg-[#D64545]/5 border-[#D64545]/20 dark:bg-[#D64545]/8 dark:border-[#D64545]/20'
                      : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/30'
                    }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${a.level === 'critical' ? 'text-[#D64545]' : 'text-amber-600 dark:text-amber-400'}`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${a.level === 'critical' ? 'text-[#D64545]' : 'text-amber-800 dark:text-amber-300'}`}>
                      {a.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${a.level === 'critical' ? 'text-[#D64545]/80' : 'text-amber-700 dark:text-amber-400'}`}>
                      {a.body}
                    </p>
                  </div>
                  {a.cta && a.ctaAction && (
                    <button
                      onClick={a.ctaAction}
                      className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all
                        ${a.level === 'critical'
                          ? 'bg-[#D64545] text-white hover:bg-[#b83a3a]'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                    >
                      {a.cta}
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Error state */}
        {metricsError && !metricsLoading && (
          <ErrorState
            compact
            message="No se pudieron cargar las métricas."
            onRetry={() => refetchMetrics()}
          />
        )}

        {/* KPIs — skeleton while loading */}
        {metricsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5 space-y-3 animate-pulse">
                <div className="h-2.5 w-24 bg-slate-100 dark:bg-white/8 rounded" />
                <div className="h-7 w-16 bg-slate-100 dark:bg-white/8 rounded" />
                <div className="h-2 w-32 bg-slate-100 dark:bg-white/8 rounded" />
              </div>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard label="Margen promedio" icon={<Icon.TrendUp />}
              value={`${metrics.avg_margin.toFixed(1)}%`}
              sub={`${metrics.good_margin_count} productos saludables`}
              color={metrics.avg_margin >= 20 ? GREEN : metrics.avg_margin >= 0 ? AMBER : RED}
              accent={metrics.avg_margin >= 20 ? 'Por encima del objetivo' : 'Bajo el objetivo (20%)'}
            />
            <KpiCard label="Ingresos en riesgo" icon={<Icon.AlertTriangle />}
              value={fmtMoney(metrics.revenue_at_risk)}
              sub="facturación comprometida"
              color={metrics.revenue_at_risk > 0 ? RED : GREEN}
            />
            <KpiCard label="Críticos" icon={<Icon.XCircle />}
              value={metrics.negative_margin_count}
              sub="margen negativo real"
              color={metrics.negative_margin_count > 0 ? RED : GREEN}
              accent={metrics.negative_margin_count > 0 ? 'Acción inmediata' : 'Sin productos críticos'}
            />
            <KpiCard label="Margen bajo" icon={<Icon.MinusCircle />}
              value={metrics.low_margin_count}
              sub="entre 0% y 20%"
              color={metrics.low_margin_count > 0 ? AMBER : GREEN}
            />
            <KpiCard label="Total productos" icon={<Icon.Package />}
              value={metrics.total_products}
              sub={`${metrics.products_with_cost} con costo cargado`}
            />
          </div>
        ) : null}

        {/* Empty state — no products yet */}
        {!metricsLoading && metrics && metrics.total_products === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Icon.Package />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">Todavía no hay productos sincronizados</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Sincronizá tu tienda para que LETO pueda analizar tus márgenes reales.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <SyncButton />
              <button
                onClick={() => router.push('/onboarding')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: GREEN }}
              >
                Cargar costos <Icon.ChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Empty state — products exist but no costs loaded */}
        {!metricsLoading && metrics && metrics.total_products > 0 && metrics.products_with_cost === 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-6 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon.AlertTriangle />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">
                Tenés {metrics.total_products} productos pero ninguno tiene costo cargado
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-500 mb-3">
                Sin el costo real, LETO no puede calcular tu margen. Cargalos en masa con un Excel o uno por uno.
              </p>
              <button
                onClick={() => router.push('/onboarding')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
                style={{ background: '#b45309' }}
              >
                Cargar costos ahora <Icon.ChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Charts + Priority */}
        {metrics && products.length > 0 && metrics.products_with_cost > 0 && (
          <>
            {/* Trend chart — full width on first row */}
            <MarginTrendChart />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <MarginDonut metrics={metrics} />
              <div className="lg:col-span-2">
                <WorstChart products={products} />
              </div>
              <CategoryBars products={products} />
            </div>
          </>
        )}

        {/* Priority list — only when there are at-risk products */}
        {products.length > 0 && metrics && metrics.products_with_cost > 0 && (
          <PriorityList products={products} onSelect={handleSelect} />
        )}

        {/* Section divider */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Todos los productos</p>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/8 w-fit shadow-sm">
          {tabs.map(({ id, label, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === id
                  ? 'text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              style={activeTab === id ? { background: GREEN } : {}}>
              {label}
              {count !== undefined && count > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  activeTab === id
                    ? 'bg-white/20 text-white'
                    : id === 'critical' ? 'text-[#D64545] bg-[#D64545]/10'
                    : id === 'low'      ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/20'
                    : 'text-slate-500 bg-slate-100 dark:bg-white/8'
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Products table */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 overflow-hidden">
          <ProductsTable
            key={activeTab}
            
            onSelectProduct={handleSelect}
            marginFilter={activeTab === 'critical' ? 'negative' : activeTab === 'low' ? 'low' : undefined}
            noCostOnly={activeTab === 'nocost'}
            hideStats
          />
        </div>

      </main>

      {/* ── Toast: healthy product ───────────────────────────────── */}
      {healthyProduct && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#15803d] text-white text-sm font-medium shadow-lg">
          <Icon.Check />
          <span><strong>{healthyProduct}</strong> tiene buen margen — sin acción necesaria</span>
        </div>
      )}

      {/* ── Toast: no cost ───────────────────────────────────────── */}
      {noCostToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-600 text-white text-sm font-medium shadow-lg">
          <Icon.AlertTriangle />
          <span><strong>{noCostToast}</strong> no tiene costo cargado</span>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => { invalidateAll(); }}
      />

      <BulkRecommendationsModal
        products={products}
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onApplied={() => { setBulkOpen(false); invalidateAll(); }}
      />

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={plan}
        onUpgraded={() => {
          setUpgradeOpen(false);
          queryClient.invalidateQueries({ queryKey: QK.plan });
        }}
      />

      {selected && rec && (
        <RecommendationModal
          productId={selected.id}
          productName={rec.product_name}
          currentMargin={rec.current_margin}
          options={rec.options ?? []}
          recommendedOption={rec.recommended_option}
          costBreakdown={rec.cost_breakdown}
          isOpen={!!selected}
          onClose={handleClose}
          onApply={() => { handleClose(); invalidateAll(); }}
        />
      )}

      {selected && loadingRec && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/10 p-8 text-center max-w-xs w-full">
            <div className="spinner h-8 w-8 mx-auto mb-3" style={{ borderColor: GREEN }} />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Analizando producto…</p>
          </div>
        </div>
      )}

    </div>
  );
}
