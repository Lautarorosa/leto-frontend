'use client';

/**
 * UpgradeModal — shown when the user tries to access a Pro/Basic feature.
 * Also accessible standalone from the dashboard header.
 */
import { useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  highlightFeature?: string;   // e.g. "autopilot" — highlights that row
  currentPlan?: string;
  onUpgraded?: () => void;
}

const GREEN = '#15803d';
const plans = [
  {
    key: 'free',
    name: 'Gratis',
    price: '$0',
    period: 'siempre',
    description: 'Para empezar a entender tus márgenes.',
    color: '#6b7280',
    cta: null,
    features: [
      { label: 'Hasta 50 productos analizados',  ok: true },
      { label: 'Calculadora de precio objetivo', ok: true },
      { label: 'Exportar a Excel',               ok: true },
      { label: 'Recomendaciones manuales',        ok: true },
      { label: 'Alertas por email',               ok: false },
      { label: 'Aplicar en masa',                 ok: false },
      { label: 'Gráfico de tendencia 30 días',    ok: false },
      { label: 'Reporte mensual automático',      ok: false },
      { label: 'Autopilot (precios automáticos)', ok: false },
    ],
  },
  {
    key: 'basic',
    name: 'Básico',
    price: '$30',
    period: '/mes USD',
    description: 'Para tiendas que quieren resultados, no solo datos.',
    color: GREEN,
    badge: 'Más popular',
    cta: 'Empezar — 14 días gratis',
    features: [
      { label: 'Productos ilimitados',           ok: true },
      { label: 'Calculadora de precio objetivo', ok: true },
      { label: 'Exportar a Excel',               ok: true },
      { label: 'Recomendaciones manuales',       ok: true },
      { label: 'Alertas por email',              ok: true },
      { label: 'Aplicar en masa',                ok: true },
      { label: 'Gráfico de tendencia 30 días',   ok: true },
      { label: 'Reporte mensual automático',     ok: true },
      { label: 'Autopilot (precios automáticos)',ok: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$80',
    period: '/mes USD',
    description: 'Para tiendas que quieren que LETO trabaje solo.',
    color: '#1a1a2e',
    cta: 'Activar Pro',
    features: [
      { label: 'Todo lo del plan Básico',         ok: true },
      { label: 'Autopilot (precios automáticos)', ok: true },
      { label: 'Soporte prioritario',             ok: true },
      { label: 'Acceso anticipado a features',    ok: true },
    ],
  },
];

export function UpgradeModal({ isOpen, onClose, highlightFeature, currentPlan = 'free', onUpgraded }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { call } = useApi();

  if (!isOpen) return null;

  const handleTrial = async () => {
    setLoading('trial');
    const data = await call('/api/v1/billing/start-trial', { method: 'POST' });
    setLoading(null);
    if (data) {
      setSuccess('basic');
      setTimeout(() => { onUpgraded?.(); onClose(); }, 2000);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setLoading(plan);
    const data = await call('/api/v1/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
    setLoading(null);
    if (data) {
      setSuccess(plan);
      setTimeout(() => { onUpgraded?.(); onClose(); }, 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 text-center border-b border-slate-100 dark:border-white/8">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Planes LETO</p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            Elegí el plan que necesitás
          </h2>
          <p className="text-sm text-slate-400">14 días gratis en el plan Básico — sin tarjeta requerida</p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.key === currentPlan;
            const isPopular = plan.key === 'basic';
            const isLoading = loading === plan.key || (loading === 'trial' && plan.key === 'basic');

            return (
              <div key={plan.key}
                className={`relative rounded-2xl border-2 p-5 flex flex-col transition-all ${
                  isPopular
                    ? 'border-[#15803d] shadow-lg shadow-[#15803d]/10'
                    : 'border-slate-200 dark:border-white/10'
                }`}>

                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: GREEN }}>
                    Más popular
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-bold tracking-widest uppercase mb-1"
                    style={{ color: plan.color }}>{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      {f.ok ? (
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke={GREEN} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      )}
                      <span className={f.ok ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center border border-slate-200 dark:border-white/10 text-slate-400">
                    Plan actual
                  </div>
                ) : success === plan.key ? (
                  <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center text-white"
                    style={{ background: GREEN }}>
                    ✓ Activado
                  </div>
                ) : plan.cta ? (
                  <button
                    onClick={() => plan.key === 'basic' && currentPlan === 'free'
                      ? handleTrial()
                      : handleUpgrade(plan.key)
                    }
                    disabled={!!loading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
                    style={{ background: plan.color }}>
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Activando…
                      </span>
                    ) : plan.cta}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-slate-400">
            Cancelá cuando quieras · Sin contratos · Datos siempre tuyos
          </p>
        </div>
      </div>
    </div>
  );
}
