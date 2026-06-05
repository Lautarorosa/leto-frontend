'use client';

/**
 * PriceCalculatorModal — "¿A qué precio tengo que vender para ganar X%?"
 *
 * Uses GET /api/v1/products/{id}/price-for-margin?target_margin=25
 * The backend uses the store's real commissions (platform + payment + shipping).
 */
import { useState, useEffect, useRef } from 'react';
import { useApi } from '@/hooks/useApi';
import type { Product } from './ProductsTable';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

interface CalcResult {
  current_price: number;
  current_margin: number | null;
  target_margin: number;
  required_price: number;
  price_delta: number;
  price_delta_pct: number;
  cost: number;
  store_commissions_pct: number;
}

const GREEN = '#16603D';
const RED   = '#D64545';
const AMBER = '#b45309';

function fmt(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function marginColor(m: number | null) {
  if (m === null) return '#9ca3af';
  if (m < 0)  return RED;
  if (m < 20) return AMBER;
  return GREEN;
}

export function PriceCalculatorModal({ product, isOpen, onClose }: Props) {
  const [targetMargin, setTargetMargin] = useState(20);
  const [result, setResult]             = useState<CalcResult | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { call } = useApi();

  // Fetch when margin changes (debounced 300ms)
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      const data = await call(
        `/api/v1/products/${product.id}/price-for-margin?target_margin=${targetMargin}`,
        { method: 'GET' },
      );
      setLoading(false);
      if (data) setResult(data as CalcResult);
      else setError('Error al calcular. Verificá que el producto tenga costo cargado.');
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMargin, isOpen, product.id]);

  // Reset on open
  useEffect(() => {
    if (isOpen) { setTargetMargin(20); setResult(null); setError(null); }
  }, [isOpen]);

  if (!isOpen) return null;

  const deltaColor = result
    ? (result.price_delta > 0 ? RED : result.price_delta < 0 ? GREEN : '#6b7280')
    : '#6b7280';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/8">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Calculadora de precio</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Current state */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Precio actual', value: `$${fmt(product.price)}` },
              { label: 'Costo',         value: product.cost ? `$${fmt(product.cost)}` : '—' },
              { label: 'Margen actual', value: product.margin !== null ? `${product.margin.toFixed(1)}%` : 'Sin costo',
                color: marginColor(product.margin) },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 dark:bg-white/4 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-bold" style={color ? { color } : {}}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Target margin slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Margen objetivo
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0} max={95} step={1}
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Math.min(95, Math.max(0, Number(e.target.value))))}
                  className="w-14 text-center text-sm font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white py-1 focus:outline-none focus:ring-1 focus:ring-[#16603D]/40"
                />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
            </div>
            <input
              type="range"
              min={0} max={80} step={1}
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${GREEN} ${targetMargin / 80 * 100}%, #e2e8f0 ${targetMargin / 80 * 100}%)`,
                accentColor: GREEN,
              }}
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0%</span>
              <span className="text-amber-500 font-semibold">20% objetivo</span>
              <span>80%</span>
            </div>
          </div>

          {/* Result */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <svg className="w-5 h-5 animate-spin" style={{ color: GREEN }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {result && !loading && (
            <div className="rounded-2xl border-2 p-5 space-y-3 transition-all"
              style={{
                borderColor: targetMargin >= 20 ? `${GREEN}40` : `${AMBER}40`,
                background:  targetMargin >= 20 ? `${GREEN}06` : `${AMBER}06`,
              }}>

              {/* Required price — big number */}
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                  Precio requerido para {targetMargin}% de margen
                </p>
                <p className="text-4xl font-black" style={{ color: GREEN }}>
                  ${fmt(result.required_price)}
                </p>
              </div>

              {/* Delta */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="font-semibold" style={{ color: deltaColor }}>
                  {result.price_delta >= 0 ? '+' : ''}{fmt(result.price_delta)}
                </span>
                <span className="text-slate-400 text-xs">vs precio actual</span>
                <span className="font-semibold text-xs px-2 py-0.5 rounded-full"
                  style={{ color: deltaColor, background: `${deltaColor}15` }}>
                  {result.price_delta_pct >= 0 ? '+' : ''}{result.price_delta_pct.toFixed(1)}%
                </span>
              </div>

              {/* Breakdown */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/8 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Costo del producto</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">${fmt(result.cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisiones plataforma + pago</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{result.store_commissions_pct}%</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
                  <span>Ganancia por unidad</span>
                  <span style={{ color: GREEN }}>
                    ${fmt(result.required_price * (targetMargin / 100))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tip */}
          {result && !loading && (
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Con {targetMargin}% de margen, necesitás vender a{' '}
              <strong className="text-slate-600 dark:text-slate-300">${fmt(result.required_price)}</strong>.
              {result.price_delta > 0
                ? ` Subir el precio $${fmt(result.price_delta)} sobre el actual.`
                : result.price_delta < 0
                ? ` Podés bajar el precio $${fmt(Math.abs(result.price_delta))} y seguir siendo rentable.`
                : ' Ya estás en el precio correcto.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
