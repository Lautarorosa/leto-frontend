'use client';

/**
 * BulkRecommendationsModal — apply Option A to all critical/low-margin products at once.
 * Uses POST /api/v1/recommendations/bulk-apply
 */
import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import type { Product } from './ProductsTable';

interface Props {
  products: Product[];   // all products (dashboard loads these for charts)
  isOpen: boolean;
  onClose: () => void;
  onApplied: () => void;
}

interface BulkResult {
  applied: number;
  skipped: number;
  errors: number;
  details: { product_id: number; name: string; status: string; reason?: string;
             old_price?: number; new_price?: number; old_margin?: number }[];
}

const GREEN = '#10B981';
const RED   = '#D64545';
const AMBER = '#b45309';

function fmt(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function BulkRecommendationsModal({ products, isOpen, onClose, onApplied }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<BulkResult | null>(null);
  const { call } = useApi();

  if (!isOpen) return null;

  const criticals = products.filter(p => p.margin !== null && p.margin < 0 && p.cost !== null);
  const lows      = products.filter(p => p.margin !== null && p.margin >= 0 && p.margin < 20 && p.cost !== null);
  const targets   = [...criticals, ...lows];

  const handleApply = async () => {
    if (loading || targets.length === 0) return;
    setLoading(true);
    const data = await call('/api/v1/recommendations/bulk-apply', {
      method: 'POST',
      body: JSON.stringify({
        product_ids: targets.map(p => p.id),
        option_id: 'A',
      }),
    });
    setLoading(false);
    if (data) {
      setResult(data as BulkResult);
    }
  };

  const handleDone = () => {
    setResult(null);
    if (result && result.applied > 0) onApplied();
    else onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/8">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Aplicar en masa</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Subir precio a todos los productos con margen insuficiente
            </p>
          </div>
          {!loading && (
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        <div className="px-6 py-5">

          {/* Result state */}
          {result ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Aplicados', value: result.applied, color: GREEN },
                  { label: 'Saltados',  value: result.skipped, color: '#6b7280' },
                  { label: 'Errores',   value: result.errors,  color: result.errors > 0 ? RED : '#6b7280' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-50 dark:bg-white/4 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black" style={{ color }}>{value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Detail list */}
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100 dark:border-white/8 divide-y divide-slate-100 dark:divide-white/6">
                {result.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 text-xs">
                    <span className="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[200px]">
                      {d.name || `Producto #${d.product_id}`}
                    </span>
                    {d.status === 'applied' ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-400 line-through">${fmt(d.old_price ?? 0)}</span>
                        <span className="font-bold" style={{ color: GREEN }}>${fmt(d.new_price ?? 0)}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">{d.reason}</span>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={handleDone}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: GREEN }}>
                {result.applied > 0 ? 'Listo — actualizar dashboard' : 'Cerrar'}
              </button>
            </div>

          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                  <p className="text-2xl font-black" style={{ color: RED }}>{criticals.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">En pérdida</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                  <p className="text-2xl font-black text-amber-600">{lows.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Margen bajo</p>
                </div>
              </div>

              {targets.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-emerald-500">
                    ✓ Todos los productos con costo tienen buen margen
                  </p>
                  <p className="text-xs text-slate-400 mt-1">No hay acciones necesarias</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-white/4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Qué va a hacer LETO:
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <li>• Calcular el precio exacto para alcanzar <strong>20% de margen</strong></li>
                      <li>• Actualizar el precio en tu DB y en TiendaNube</li>
                      <li>• Registrar cada cambio en el audit log para poder revertir</li>
                      <li>• Productos sin costo cargado son <strong>saltados</strong> automáticamente</li>
                    </ul>
                  </div>

                  {/* Preview list */}
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 dark:border-white/8 divide-y divide-slate-100 dark:divide-white/6">
                    {targets.slice(0, 20).map(p => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2 text-xs">
                        <span className="text-slate-700 dark:text-slate-200 truncate max-w-[220px]">{p.name}</span>
                        <span className="flex-shrink-0 font-bold"
                          style={{ color: (p.margin ?? 0) < 0 ? RED : AMBER }}>
                          {p.margin?.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                    {targets.length > 20 && (
                      <p className="px-3 py-2 text-xs text-slate-400 text-center">
                        ... y {targets.length - 20} más
                      </p>
                    )}
                  </div>

                  <button onClick={handleApply} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                    style={{ background: GREEN }}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Aplicando {targets.length} productos…
                      </span>
                    ) : (
                      `Aplicar a ${targets.length} producto${targets.length !== 1 ? 's' : ''} →`
                    )}
                  </button>
                </>
              )}

              {!loading && targets.length > 0 && (
                <button onClick={onClose}
                  className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
