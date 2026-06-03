'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';

interface Settings {
  platform_commission_pct: number;
  payment_commission_pct: number;
  avg_shipping_cost: number;
}

interface AutopilotSettings {
  enabled: boolean;
  max_increase_pct: number;
  max_decrease_pct: number;
  min_margin_target: number;
  actions_today: number;
  last_run_at: string | null;
}

const GREEN = '#16603D';

// TiendaNube plan presets
const PLATFORM_PRESETS = [
  { label: 'Pro / Avanzado', value: 0,    desc: '0% comisión' },
  { label: 'Negocio',        value: 1,    desc: '1% comisión' },
  { label: 'Emprendedor',    value: 2,    desc: '2% comisión' },
];

// Payment method presets
const PAYMENT_PRESETS = [
  { label: 'MercadoPago estándar', value: 3.49, desc: '3.49%' },
  { label: 'MercadoPago premium',  value: 0.80, desc: '0.80%' },
  { label: 'Transferencia bancaria', value: 0,  desc: '0%' },
  { label: 'Personalizado',        value: -1,   desc: 'Ingresar manualmente' },
];

export function SettingsModal({
  isOpen,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { call } = useApi();
  const [settings, setSettings] = useState<Settings>({
    platform_commission_pct: 2,
    payment_commission_pct: 3.49,
    avg_shipping_cost: 0,
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [customPayment, setCustomPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'comisiones' | 'autopilot'>('comisiones');

  // Autopilot state
  const [autopilot, setAutopilot] = useState<AutopilotSettings>({
    enabled: false,
    max_increase_pct: 15,
    max_decrease_pct: 10,
    min_margin_target: 20,
    actions_today: 0,
    last_run_at: null,
  });
  const [savingAutopilot, setSavingAutopilot] = useState(false);
  const [savedAutopilot, setSavedAutopilot]   = useState(false);
  const [runningAutopilot, setRunningAutopilot] = useState(false);
  const [autopilotResult, setAutopilotResult] = useState<{ applied: number; skipped_guardrail: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      call<Settings>('/api/v1/settings/', { method: 'GET' }),
      call<AutopilotSettings>('/api/v1/autopilot/', { method: 'GET' }),
    ]).then(([s, a]) => {
      if (s) {
        setSettings(s);
        const isCustom = !PAYMENT_PRESETS.slice(0, -1).some(p => p.value === s.payment_commission_pct);
        setCustomPayment(isCustom);
      }
      if (a) setAutopilot(a);
      setLoading(false);
    });
  }, [isOpen, call]);

  const handleSave = async () => {
    setSaving(true);
    const res = await call<Settings>('/api/v1/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res) {
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); onClose(); }, 1200);
    }
  };

  const totalCommission = (settings.platform_commission_pct + settings.payment_commission_pct).toFixed(2);

  const handleSaveAutopilot = async () => {
    setSavingAutopilot(true);
    const res = await call<AutopilotSettings>('/api/v1/autopilot/', {
      method: 'PUT',
      body: JSON.stringify({
        enabled: autopilot.enabled,
        max_increase_pct: autopilot.max_increase_pct,
        max_decrease_pct: autopilot.max_decrease_pct,
        min_margin_target: autopilot.min_margin_target,
      }),
    });
    setSavingAutopilot(false);
    if (res) { setSavedAutopilot(true); setAutopilot(res); setTimeout(() => setSavedAutopilot(false), 2000); }
  };

  const handleRunAutopilot = async () => {
    setRunningAutopilot(true);
    setAutopilotResult(null);
    const res = await call<{ applied: number; skipped_guardrail: number }>('/api/v1/autopilot/run', { method: 'POST' });
    setRunningAutopilot(false);
    if (res) setAutopilotResult(res);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/8">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Configuración</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comisiones y ajuste automático de precios</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-white/8">
          {([
            { id: 'comisiones', label: 'Comisiones' },
            { id: 'autopilot',  label: 'Autopilot' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-3 text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'text-[#16603D] border-b-2 border-[#16603D]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}>
              {t.label}
              {t.id === 'autopilot' && autopilot.enabled && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-[#16603D] text-white">ON</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="spinner h-6 w-6" style={{ borderColor: GREEN }} />
          </div>
        ) : activeTab === 'autopilot' ? (
          /* ── Autopilot panel ─────────────────────────────────── */
          <div className="p-6 space-y-6">

            {/* Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Modo autopilot</p>
                <p className="text-xs text-slate-400 mt-0.5">LETO aplica recomendaciones automáticamente dentro de los límites configurados</p>
              </div>
              <button
                onClick={() => setAutopilot(a => ({ ...a, enabled: !a.enabled }))}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${autopilot.enabled ? 'bg-[#16603D]' : 'bg-slate-200 dark:bg-white/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${autopilot.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Guardrails */}
            <div className={`space-y-5 transition-opacity ${!autopilot.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-400">Límites de cambio</p>

              {[
                { label: 'Máximo aumento de precio', key: 'max_increase_pct' as const, suffix: '%', hint: 'Si el ajuste necesario es mayor, el producto se saltea' },
                { label: 'Máxima reducción de precio', key: 'max_decrease_pct' as const, suffix: '%', hint: 'Protege contra bajadas abruptas' },
                { label: 'Margen objetivo mínimo', key: 'min_margin_target' as const, suffix: '%', hint: 'Solo actúa en productos con margen por debajo de este valor' },
              ].map(field => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{field.label}</label>
                    <span className="text-xs font-black text-[#16603D]">{autopilot[field.key]}{field.suffix}</span>
                  </div>
                  <input
                    type="range" min={0} max={field.key === 'min_margin_target' ? 60 : 50} step={1}
                    value={autopilot[field.key]}
                    onChange={e => setAutopilot(a => ({ ...a, [field.key]: parseFloat(e.target.value) }))}
                    className="w-full accent-[#16603D]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">{field.hint}</p>
                </div>
              ))}
            </div>

            {/* Status */}
            {autopilot.last_run_at && (
              <div className="rounded-lg border border-slate-100 dark:border-white/8 p-3 text-xs text-slate-400 flex items-center justify-between">
                <span>Última ejecución: {new Date(autopilot.last_run_at).toLocaleString('es-AR')}</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">{autopilot.actions_today} acciones hoy</span>
              </div>
            )}

            {/* Run result */}
            {autopilotResult && (
              <div className="rounded-xl border border-[#16603D]/25 bg-[#16603D]/5 p-4 text-sm">
                <p className="font-bold text-[#16603D] mb-1">Ejecución completada</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  {autopilotResult.applied} precios actualizados · {autopilotResult.skipped_guardrail} saltados por límites
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleRunAutopilot} disabled={runningAutopilot || !autopilot.enabled}
                className="flex-1 py-2.5 rounded-lg border-2 border-[#16603D] text-[#16603D] text-sm font-bold hover:bg-[#16603D]/5 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2">
                {runningAutopilot ? <><div className="spinner border-[#16603D] w-4 h-4" /> Ejecutando…</> : 'Ejecutar ahora'}
              </button>
              <button onClick={handleSaveAutopilot} disabled={savingAutopilot}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                style={{ background: GREEN }}>
                {savedAutopilot ? '✓ Guardado' : savingAutopilot ? 'Guardando…' : 'Guardar configuración'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-7">

            {/* Plan TiendaNube */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">
                Plan TiendaNube
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORM_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setSettings(s => ({ ...s, platform_commission_pct: p.value }))}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                      settings.platform_commission_pct === p.value
                        ? 'border-[#16603D] bg-[#16603D]/5'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg font-black" style={{ color: settings.platform_commission_pct === p.value ? GREEN : undefined }}>
                      {p.desc}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">
                Método de pago principal
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {PAYMENT_PRESETS.slice(0, -1).map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setSettings(s => ({ ...s, payment_commission_pct: p.value })); setCustomPayment(false); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                      !customPayment && settings.payment_commission_pct === p.value
                        ? 'border-[#16603D] bg-[#16603D]/5'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-left">{p.label}</span>
                    <span className="text-xs font-bold ml-2 flex-shrink-0"
                      style={{ color: !customPayment && settings.payment_commission_pct === p.value ? GREEN : '#9ca3af' }}>
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>
              {/* Custom input */}
              <button
                onClick={() => setCustomPayment(true)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all mb-2 ${
                  customPayment
                    ? 'border-[#16603D] bg-[#16603D]/5'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-medium text-slate-500">Otro porcentaje</span>
                <span className="text-xs text-slate-400">ingresar manualmente</span>
              </button>
              {customPayment && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={settings.payment_commission_pct}
                    onChange={e => setSettings(s => ({ ...s, payment_commission_pct: parseFloat(e.target.value) || 0 }))}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-black text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16603D]"
                  />
                  <span className="text-sm font-semibold text-slate-500">%</span>
                </div>
              )}
            </div>

            {/* Costo de envío promedio */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">
                Costo de envío promedio
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Si ofrecés envío gratis, ingresá cuánto te cuesta en promedio por pedido.
                Si el cliente lo paga, dejalo en 0.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={settings.avg_shipping_cost}
                  onChange={e => setSettings(s => ({ ...s, avg_shipping_cost: parseFloat(e.target.value) || 0 }))}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-black text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16603D]"
                  placeholder="0"
                />
                <span className="text-xs text-slate-400">ARS</span>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl p-4 border" style={{ borderColor: `${GREEN}30`, background: `${GREEN}06` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: GREEN }}>
                Resumen de deducciones
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Comisión TiendaNube</span>
                  <span className="font-semibold">{settings.platform_commission_pct.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Comisión de pago</span>
                  <span className="font-semibold">{settings.payment_commission_pct.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-white/10 font-bold" style={{ color: GREEN }}>
                  <span>Total comisiones</span>
                  <span>{totalCommission}%</span>
                </div>
                {settings.avg_shipping_cost > 0 && (
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Envío promedio deducido</span>
                    <span>${settings.avg_shipping_cost.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-white/8">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || saved || loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: GREEN }}>
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Guardado
              </>
            ) : saving ? (
              <><div className="spinner border-white w-4 h-4" /> Guardando…</>
            ) : (
              'Guardar y recalcular'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
