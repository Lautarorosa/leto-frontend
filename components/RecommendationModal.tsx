'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApi } from '@/hooks/useApi';

interface SimulationScenario {
  name: string;
  sales_impact: number;
  revenue_impact: number;
  margin_impact: number;
  days_to_complete?: number;
}

interface Option {
  option_id: string;
  action_type: string;
  risk_level: string;
  score: number;
  description: string;
  best_case?: SimulationScenario;
  expected_case?: SimulationScenario;
  worst_case?: SimulationScenario;
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

interface RecommendationModalProps {
  productId: number;
  productName: string;
  currentMargin: number;
  options: Option[];
  recommendedOption: string;
  costBreakdown?: CostBreakdown;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
}

const SCENARIO_COLORS: Record<string, string> = {
  'Mejor caso': '#15803d',
  'Caso esperado': '#15803d',
  'Peor caso': '#D64545',
};

// ── Cost Breakdown Component ───────────────────────────────────────────────
function CostBreakdownPanel({ breakdown }: { breakdown: CostBreakdown }) {
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const pct = (n: number) => `${n.toFixed(1)}%`;

  const rows: { label: string; value: string; sub?: string; negative?: boolean; highlight?: boolean }[] = [
    { label: 'Precio de venta', value: fmt(breakdown.price) },
    {
      label: `Comisión TiendaNube`,
      value: `− ${fmt(breakdown.platform_commission_amount)}`,
      sub: pct(breakdown.platform_commission_pct),
      negative: true,
    },
    {
      label: 'Comisión pasarela de pago',
      value: `− ${fmt(breakdown.payment_commission_amount)}`,
      sub: pct(breakdown.payment_commission_pct),
      negative: true,
    },
    {
      label: 'Costo de envío promedio',
      value: `− ${fmt(breakdown.shipping_cost)}`,
      negative: breakdown.shipping_cost > 0,
    },
    {
      label: 'Costo del producto',
      value: `− ${fmt(breakdown.cost)}`,
      negative: true,
    },
    {
      label: 'Ganancia neta',
      value: fmt(breakdown.gross_profit),
      highlight: true,
      negative: breakdown.gross_profit < 0,
    },
  ];

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/8">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Desglose de costos reales
        {breakdown.store_name && (
          <span className="ml-2 normal-case font-normal text-slate-400">— {breakdown.store_name}</span>
        )}
      </p>
      <div className="rounded-xl border border-slate-100 dark:border-white/8 overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-4 py-2.5 text-sm
              ${i < rows.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}
              ${row.highlight
                ? row.negative
                  ? 'bg-[#D64545]/5 dark:bg-[#D64545]/8'
                  : 'bg-[#15803d]/5 dark:bg-[#15803d]/8'
                : 'bg-white dark:bg-transparent'
              }`}
          >
            <span className={`${row.highlight ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              {row.label}
            </span>
            <div className="flex items-center gap-2">
              {row.sub && (
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-white/8 px-1.5 py-0.5 rounded">
                  {row.sub}
                </span>
              )}
              <span className={`font-semibold tabular-nums
                ${row.highlight
                  ? row.negative ? 'text-[#D64545]' : 'text-[#15803d]'
                  : row.negative ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                }`}
              >
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Margin bar */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-slate-400 w-20 shrink-0">Margen neto</span>
        <div className="flex-1 h-2 bg-slate-100 dark:bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(Math.max(breakdown.margin_pct, 0), 100)}%`,
              backgroundColor: breakdown.margin_pct < 0 ? '#D64545' : breakdown.margin_pct < 20 ? '#b45309' : '#15803d',
            }}
          />
        </div>
        <span className={`text-xs font-bold tabular-nums w-12 text-right
          ${breakdown.margin_pct < 0 ? 'text-[#D64545]' : breakdown.margin_pct < 20 ? 'text-amber-600' : 'text-[#15803d]'}`}
        >
          {breakdown.margin_pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ── Price Calculator ───────────────────────────────────────────────────────
function PriceCalculator({ breakdown }: { breakdown: CostBreakdown }) {
  const [targetMargin, setTargetMargin] = useState(30);

  // Formula: price = cost / (1 - targetMargin/100 - platformPct/100 - paymentPct/100)
  const totalCommissionRate = (breakdown.platform_commission_pct + breakdown.payment_commission_pct) / 100;
  const denominator = 1 - targetMargin / 100 - totalCommissionRate;
  const suggestedPrice = denominator > 0 ? (breakdown.cost + breakdown.shipping_cost) / denominator : null;
  const delta = suggestedPrice ? suggestedPrice - breakdown.price : null;
  const deltaPct = delta && breakdown.price > 0 ? (delta / breakdown.price) * 100 : null;

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/8">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        Calculadora de precio objetivo
      </p>
      <div className="bg-slate-50 dark:bg-white/4 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">Margen deseado</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={5}
              max={80}
              value={targetMargin}
              onChange={e => setTargetMargin(Number(e.target.value))}
              className="w-28 accent-[#15803d]"
            />
            <span className="text-sm font-bold text-[#15803d] w-10 text-right tabular-nums">{targetMargin}%</span>
          </div>
        </div>

        {suggestedPrice && suggestedPrice > 0 ? (
          <>
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-xs text-slate-400 mb-1">Precio sugerido</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                  ${suggestedPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              {delta !== null && deltaPct !== null && (
                <div className={`text-right ${delta > 0 ? 'text-amber-600' : 'text-[#15803d]'}`}>
                  <p className="text-xs mb-1 text-slate-400">vs precio actual</p>
                  <p className="text-lg font-bold tabular-nums">
                    {delta > 0 ? '+' : ''}{delta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs font-semibold">
                    ({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Con este precio tus comisiones quedan cubiertas y llegás exactamente al {targetMargin}% de margen neto.
            </p>
          </>
        ) : (
          <p className="text-sm text-[#D64545] mt-2">
            El margen deseado es demasiado alto para cubrir las comisiones actuales.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Impact Simulator ───────────────────────────────────────────────────────
function ImpactSimulator({ option, currentMargin }: { option: Option; currentMargin: number }) {
  const scenarios = [option.best_case, option.expected_case, option.worst_case].filter(Boolean) as SimulationScenario[];
  if (scenarios.length === 0) return null;

  const data = scenarios.map((s) => ({
    name: s.name,
    margen: parseFloat((currentMargin + s.margin_impact).toFixed(1)),
  }));

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/8">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Simulador de impacto</p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip
            formatter={(v: number) => [`${v}%`, 'Margen proyectado']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="margen" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={SCENARIO_COLORS[entry.name] ?? '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-3">
        {Object.entries(SCENARIO_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────
export function RecommendationModal({
  productId, productName, currentMargin, options, recommendedOption, costBreakdown, isOpen, onClose, onApply,
}: RecommendationModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>(recommendedOption);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { call } = useApi();

  useEffect(() => {
    if (isOpen) {
      setSelectedOption(recommendedOption);
      setError(null);
      setIsApplying(false);
    }
  }, [isOpen, recommendedOption]);

  const handleApply = async () => {
    setError(null);
    setIsApplying(true);
    const result = await call(`/api/v1/recommendations/${productId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ option_id: selectedOption }),
    });
    if (result) { onApply?.(); onClose(); }
    else setError('No se pudo aplicar el cambio. Intentá de nuevo.');
    setIsApplying(false);
  };

  if (!isOpen) return null;

  const riskLabel = (level: string) => ({ Low: 'Bajo riesgo', Medium: 'Riesgo moderado' }[level] ?? 'Alto riesgo');
  const riskColor = (level: string) => ({
    Low: 'text-[#15803d] bg-[#15803d]/8',
    Medium: 'text-amber-600 bg-amber-500/8',
  }[level] ?? 'text-[#D64545] bg-[#D64545]/8');

  const actionLabel = (action: string) => ({
    increase_price: 'Aumentar precio',
    liquidate: 'Liquidar stock',
    pause_wait: 'Pausar y esperar',
  }[action] ?? 'Acción');

  const actionIcon = (action: string) => {
    if (action === 'increase_price') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    );
    if (action === 'liquidate') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-4-4" />
      </svg>
    );
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const safeOptions = options ?? [];
  const activeOption = safeOptions.find((o) => o.option_id === selectedOption);

  // Impact preview for selected option (expected case)
  const expectedImpact = activeOption?.expected_case;
  const projectedMargin = expectedImpact
    ? parseFloat((currentMargin + expectedImpact.margin_impact).toFixed(1))
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#101215] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100 dark:border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-px bg-[#15803d]" />
              <span className="text-xs font-bold tracking-widest text-[#15803d] uppercase">Recomendaciones</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{productName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm">
                <span className="text-slate-400">Margen actual: </span>
                <span className={`font-bold ${currentMargin < 0 ? 'text-[#D64545]' : 'text-[#15803d]'}`}>
                  {currentMargin.toFixed(2)}%
                </span>
              </p>
              {projectedMargin !== null && projectedMargin !== currentMargin && (
                <>
                  <span className="text-slate-300 dark:text-white/20">→</span>
                  <p className="text-sm">
                    <span className="text-slate-400">Proyectado: </span>
                    <span className={`font-bold ${projectedMargin < 0 ? 'text-[#D64545]' : projectedMargin < 20 ? 'text-amber-600' : 'text-[#15803d]'}`}>
                      {projectedMargin}%
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cost Breakdown — real data from this store */}
        {costBreakdown && (
          <div className="px-6">
            <CostBreakdownPanel breakdown={costBreakdown} />
            <PriceCalculator breakdown={costBreakdown} />
          </div>
        )}

        {/* Options */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Elegí la acción que querés aplicar:
          </p>

          {safeOptions.map((option) => {
            const exp = option.expected_case;
            const proj = exp ? parseFloat((currentMargin + exp.margin_impact).toFixed(1)) : null;
            const gain = exp ? parseFloat(exp.margin_impact.toFixed(1)) : null;

            return (
              <label
                key={option.option_id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedOption === option.option_id
                    ? 'border-[#15803d] bg-[#15803d]/5 dark:bg-[#15803d]/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={option.option_id}
                  checked={selectedOption === option.option_id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mt-0.5 accent-[#15803d]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[#15803d]">{actionIcon(option.action_type)}</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {actionLabel(option.action_type)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${riskColor(option.risk_level)}`}>
                      {riskLabel(option.risk_level)}
                    </span>
                    {option.option_id === recommendedOption && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-[#15803d] bg-[#15803d]/10">
                        Recomendada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{option.description}</p>

                  {/* Inline impact preview */}
                  {proj !== null && gain !== null && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Margen esperado:</span>
                      <span className={`font-bold ${proj < 0 ? 'text-[#D64545]' : proj < 20 ? 'text-amber-600' : 'text-[#15803d]'}`}>
                        {proj}%
                      </span>
                      <span className={`${gain >= 0 ? 'text-[#15803d]' : 'text-[#D64545]'}`}>
                        ({gain >= 0 ? '+' : ''}{gain} pp)
                      </span>
                    </div>
                  )}
                </div>
              </label>
            );
          })}

          {activeOption && <ImpactSimulator option={activeOption} currentMargin={currentMargin} />}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-[#D64545]/8 border border-[#D64545]/20">
            <p className="text-sm text-[#D64545]">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-[#0a0c0e]">
          <button
            onClick={onClose}
            disabled={isApplying}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#15803d] hover:bg-[#15803d] text-sm font-semibold text-white disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            {isApplying ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Aplicando...
              </>
            ) : (
              <>
                Aplicar
                {projectedMargin !== null && projectedMargin !== currentMargin && (
                  <span className="opacity-80 text-xs">→ {projectedMargin}%</span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
