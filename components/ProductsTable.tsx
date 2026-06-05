'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PriceCalculatorModal } from './PriceCalculatorModal';

export interface Product {
  id: number;
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
}

interface ProductsResponse {
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

interface ProductsTableProps {
  onSelectProduct?: (product: Product) => void;
  refreshKey?: number;
  marginFilter?: 'negative' | 'low' | 'good';
  noCostOnly?: boolean;
  hideStats?: boolean;
}

function MarginBadge({ margin }: { margin: number | null }) {
  if (margin === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-white/5">
        Sin costo
      </span>
    );
  }
  if (margin < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold text-[#D64545] bg-[#D64545]/8">
        {margin.toFixed(1)}%
        <span className="text-[10px] font-medium opacity-70">Crítico</span>
      </span>
    );
  }
  if (margin < 20) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/8">
        {margin.toFixed(1)}%
        <span className="text-[10px] font-medium opacity-70">Bajo</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold text-[#15803d] bg-[#15803d]/8">
      {margin.toFixed(1)}%
      <span className="text-[10px] font-medium opacity-70">Bueno</span>
    </span>
  );
}

export function ProductsTable({ onSelectProduct, refreshKey, marginFilter, noCostOnly, hideStats }: ProductsTableProps) {
  const [products, setProducts]         = useState<Product[]>([]);
  const [total, setTotal]               = useState(0);
  const [stats, setStats]               = useState<ProductsResponse['margin_stats'] | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [filter, setFilter]             = useState<'all' | 'negative' | 'low' | 'no_cost'>('all');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [calcProduct, setCalcProduct]   = useState<Product | null>(null);
  const PAGE_SIZE = 50;
  const { call } = useApi();

  // Categories — from React Query cache (shared with dashboard, no extra request)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn:  api.products.categories,
    staleTime: 30 * 60 * 1000,
  });
  const categories = categoriesData ?? [];

  const load = useCallback(async (skip = 0, catFilter?: string | null) => {
    setIsLoading(true);
    const activeFilter = noCostOnly ? 'no_cost' : (marginFilter ?? filter);
    let endpoint: string;

    const cat = catFilter !== undefined ? catFilter : activeCategory;
    const catParam = cat ? `&category=${encodeURIComponent(cat)}` : '';

    if (noCostOnly) {
      endpoint = '/api/v1/products/without-cost';
    } else if (activeFilter === 'all') {
      endpoint = `/api/v1/products/?limit=${PAGE_SIZE}&skip=${skip}${catParam}`;
    } else {
      endpoint = `/api/v1/products/?margin_level=${activeFilter}&limit=${PAGE_SIZE}&skip=${skip}${catParam}`;
    }
    const data = await call(endpoint, { method: 'GET' }) as ProductsResponse | null;
    if (data) {
      setProducts(data.products);
      setStats(data.margin_stats);
      setTotal(data.total);
    }
    setIsLoading(false);
  }, [call, filter, marginFilter, noCostOnly, activeCategory]);

  useEffect(() => { setPage(0); load(0); }, [load, refreshKey]);

  const handlePage = (newPage: number) => {
    setPage(newPage);
    load(newPage * PAGE_SIZE);
  };

  const handleCategory = (cat: string | null) => {
    setActiveCategory(cat);
    setPage(0);
    load(0, cat);
  };

  // Client-side search on current page
  const visible = search.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner border-[#15803d] mx-auto mb-4 h-8 w-8" />
        <p className="text-slate-400 text-sm">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">

      {/* Stats row */}
      {!hideStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 border-b border-slate-100 dark:border-white/6">
          {[
            { label: 'Total productos',  value: stats?.total_products ?? 0,                  color: 'text-slate-900 dark:text-white' },
            { label: 'Margen promedio',  value: `${(stats?.avg_margin ?? 0).toFixed(1)}%`,   color: 'text-[#15803d]' },
            { label: 'Críticos',         value: stats?.negative_margin ?? 0,                 color: (stats?.negative_margin ?? 0) > 0 ? 'text-[#D64545]' : 'text-slate-900 dark:text-white' },
            { label: 'Margen bajo',      value: stats?.low_margin ?? 0,                      color: (stats?.low_margin ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#101215]">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide font-medium">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="px-5 pt-4 pb-3 space-y-3">

        {/* Row 1: Search + margin tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto, SKU o categoría…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#15803d]/40 focus:border-[#15803d]/60 transition-all"
            />
          </div>

          {/* Margin filter tabs */}
          {!marginFilter && !noCostOnly && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {([
                { id: 'all',      label: 'Todos' },
                { id: 'negative', label: '🔴 Críticos' },
                { id: 'low',      label: '🟡 Bajo' },
                { id: 'no_cost',  label: 'Sin costo' },
              ] as const).map((tab) => (
                <button key={tab.id} onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    filter === tab.id
                      ? 'bg-[#15803d] text-white'
                      : 'border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#15803d]/50 hover:text-[#15803d]'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {search && (
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {visible.length} resultado{visible.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Row 2: Category filter pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mr-1">Categoría:</span>
            <button
              onClick={() => handleCategory(null)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-[#15803d] text-white'
                  : 'bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/12'
              }`}>
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategory(cat === activeCategory ? null : cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#15803d] text-white'
                    : 'bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/12'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {visible.length > 0 ? (
        <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0c0e]">
                {[
                  { label: 'Producto',    cls: 'pl-5' },
                  { label: 'Categoría',   cls: 'hidden sm:table-cell' },
                  { label: 'Precio',      cls: 'text-right' },
                  { label: 'Costo',       cls: 'text-right hidden md:table-cell' },
                  { label: 'Margen',      cls: 'text-right' },
                  { label: 'Stock',       cls: 'text-right hidden lg:table-cell' },
                  { label: 'Ventas/mes',  cls: 'text-right hidden xl:table-cell' },
                  { label: '',            cls: 'pr-5 text-right' },
                ].map((h, i) => (
                  <th key={i} className={`px-4 py-3.5 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-left ${h.cls}`}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {visible.map((product) => (
                <tr key={product.id} className="bg-white dark:bg-[#101215] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">

                  {/* Producto */}
                  <td className="px-4 py-3.5 pl-5">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-[#15803d] transition-colors">{product.name}</p>
                      {product.sku && <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{product.sku}</p>}
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                    {product.category ? (
                      <button
                        onClick={() => handleCategory(product.category === activeCategory ? null : product.category)}
                        className={`px-2 py-0.5 rounded-md text-xs transition-colors ${
                          activeCategory === product.category
                            ? 'bg-[#15803d] text-white'
                            : 'bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-300 hover:bg-[#15803d]/10 hover:text-[#15803d]'
                        }`}
                      >
                        {product.category}
                      </button>
                    ) : '—'}
                  </td>

                  {/* Precio */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                    {product.promotional_price && product.promotional_price < product.price && (
                      <span className="block text-[10px] text-amber-500 font-normal">
                        Promo ${product.promotional_price.toLocaleString('es-AR')}
                      </span>
                    )}
                  </td>

                  {/* Costo */}
                  <td className="px-4 py-3.5 text-right text-sm hidden md:table-cell">
                    {product.cost != null
                      ? <span className="text-slate-600 dark:text-slate-300">${product.cost.toLocaleString('es-AR')}</span>
                      : <span className="text-amber-500 text-xs font-medium">Pendiente</span>
                    }
                  </td>

                  {/* Margen */}
                  <td className="px-4 py-3.5 text-right">
                    <MarginBadge margin={product.margin} />
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3.5 text-right text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    <span className={product.stock === 0 ? 'text-red-500 font-semibold' : ''}>
                      {product.stock} u.
                    </span>
                  </td>

                  {/* Ventas/mes */}
                  <td className="px-4 py-3.5 text-right hidden xl:table-cell">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {product.monthly_sales > 0 ? `${product.monthly_sales.toFixed(0)}/mes` : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                      )}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Calculadora */}
                      {product.cost != null && (
                        <button
                          onClick={() => setCalcProduct(product)}
                          title="Calculadora de precio"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-[#15803d] hover:border-[#15803d]/40 text-xs font-medium transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                          <span className="hidden sm:inline">Calcular</span>
                        </button>
                      )}
                      {/* Recomendaciones */}
                      <button
                        onClick={() => onSelectProduct?.(product)}
                        disabled={product.margin === null}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#15803d] hover:bg-[#15803d] disabled:bg-slate-200 dark:disabled:bg-white/8 disabled:cursor-not-allowed text-white disabled:text-slate-400 text-xs font-semibold transition-all"
                        aria-label={`Ver recomendaciones para ${product.name}`}
                      >
                        {product.margin === null ? 'Sin costo' : 'Ver opciones'}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-white/6">
            <p className="text-xs text-slate-400">
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total} productos
              {activeCategory ? ` en "${activeCategory}"` : ''}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#15803d]/50 hover:text-[#15803d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-400">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#15803d]/50 hover:text-[#15803d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-slate-400 text-sm">
            {activeCategory ? `Sin productos en "${activeCategory}".` : 'No se encontraron productos.'}
          </p>
          {activeCategory && (
            <button onClick={() => handleCategory(null)} className="text-xs text-[#15803d] mt-2 hover:underline">
              Quitar filtro de categoría
            </button>
          )}
        </div>
      )}

      {/* Calculator modal */}
      {calcProduct && (
        <PriceCalculatorModal
          product={calcProduct}
          isOpen={!!calcProduct}
          onClose={() => setCalcProduct(null)}
        />
      )}
    </div>
  );
}
