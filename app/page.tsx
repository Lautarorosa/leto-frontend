'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LetoLogo from '@/components/LetoLogo';

const GREEN   = '#16603D';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const IS_DEV   = process.env.NODE_ENV === 'development';

// ── Icons ──────────────────────────────────────────────────────────────────

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const IconArrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconTN = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" />
  </svg>
);

const IconAlert = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
  </svg>
);

// ── Mini simulator ─────────────────────────────────────────────────────────

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function calcSim(products: number, avgTicket: number) {
  // Industry averages: ~28% of products have hidden margin issues
  const productsAtRisk = Math.round(products * 0.28);
  const estimatedLoss  = Math.round(productsAtRisk * avgTicket * 0.12 * 30);
  return { productsAtRisk, estimatedLoss };
}

function MiniSimulator({ onConnect }: { onConnect: () => void }) {
  const [products,   setProducts]   = useState(80);
  const [avgTicket,  setAvgTicket]  = useState(4500);
  const [showResult, setShowResult] = useState(false);

  const sim = calcSim(products, avgTicket);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Cantidad de productos
          </label>
          <input
            type="number" min={1} value={products}
            onChange={e => { setProducts(Math.max(1, parseInt(e.target.value) || 1)); setShowResult(false); }}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16603D]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Ticket promedio ($)
          </label>
          <input
            type="number" min={1} value={avgTicket}
            onChange={e => { setAvgTicket(Math.max(1, parseInt(e.target.value) || 1)); setShowResult(false); }}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16603D]"
          />
        </div>
      </div>

      {!showResult ? (
        <button
          onClick={() => setShowResult(true)}
          className="w-full py-2.5 rounded-lg border-2 border-[#16603D] text-[#16603D] text-sm font-bold hover:bg-[#16603D]/5 transition-all"
        >
          Estimar mi pérdida mensual →
        </button>
      ) : (
        <div className="rounded-xl border border-[#D64545]/25 bg-[#D64545]/5 dark:bg-[#D64545]/8 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <div className="text-[#D64545] mt-0.5 flex-shrink-0"><IconAlert /></div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Estimamos que{' '}
                <span className="text-[#D64545]">{sim.productsAtRisk} productos</span>{' '}
                tienen margen negativo real
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Una vez que se suman comisiones TiendaNube + pasarela de pago
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#D64545]/15">
            <span className="text-xs text-slate-500 dark:text-slate-400">Pérdida mensual estimada</span>
            <span className="text-xl font-black text-[#D64545]">{fmtMoney(sim.estimatedLoss)}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Basado en promedios de tiendas TiendaNube en LATAM. Conectá tu tienda para ver el número exacto de la tuya.
          </p>
          <button
            onClick={onConnect}
            className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{ background: GREEN }}
          >
            <IconTN />
            Ver el número exacto de mi tienda
            <IconArrow />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [connecting,   setConnecting]   = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [tab,          setTab]          = useState<'sim' | 'info'>('sim');

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      const result = await fetch(`${API_BASE}/api/v1/auth/login`).then(r => {
        if (!r.ok) throw new Error(`Backend respondió ${r.status}`);
        return r.json();
      });
      if (result?.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setConnectError('El backend no devolvió una URL de autorización.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setConnectError(msg.includes('fetch') ? 'No se puede conectar al backend.' : msg);
    } finally {
      setConnecting(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: GREEN, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-white/8 bg-white dark:bg-[#0d0d0d]">
        <div className="max-w-screen-sm mx-auto px-6 h-14 flex items-center gap-2.5">
          <LetoLogo size={28} />
          <span className="ml-auto text-[10px] text-slate-400 tracking-wider uppercase">Análisis de márgenes</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-5">

          {/* Hero */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <LetoLogo size={52} showWordmark={false} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              ¿Cuánto estás perdiendo sin saberlo?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Muchos productos parecen rentables hasta que se suman las comisiones de TiendaNube y la pasarela. LETO calcula el margen real.
            </p>
          </div>

          {/* Card with tabs */}
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm overflow-hidden">

            <div className="flex border-b border-slate-100 dark:border-white/8">
              {([
                { id: 'sim',  label: 'Calcular mi pérdida' },
                { id: 'info', label: '¿Cómo funciona?' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${
                    tab === t.id
                      ? 'text-[#16603D] border-b-2 border-[#16603D]'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">

              {tab === 'sim' && <MiniSimulator onConnect={handleConnect} />}

              {tab === 'info' && (
                <div className="space-y-5">
                  <div className="space-y-4">
                    {[
                      { n: '01', title: 'Conectás tu TiendaNube', body: 'OAuth seguro. LETO lee tus productos y precios — nunca modifica nada sin tu aprobación.' },
                      { n: '02', title: 'Cargás tus costos reales', body: 'Subís un Excel con el costo de cada producto. También podés cargarlos uno por uno.' },
                      { n: '03', title: 'LETO calcula tu margen real', body: 'Suma comisión TiendaNube + pasarela + envío. Detecta qué productos te hacen perder dinero.' },
                      { n: '04', title: 'Aplicás las recomendaciones', body: 'Para cada problema, LETO te da 3 opciones. Vos elegís y confirmás — LETO ejecuta.' },
                    ].map(step => (
                      <div key={step.n} className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                          style={{ background: `${GREEN}15`, color: GREEN }}>
                          {step.n}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    {[
                      'Acceso de solo lectura a tu catálogo',
                      'Cambios de precio solo con tu aprobación',
                      'Sin tarjeta. Sin período de prueba.',
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${GREEN}15`, color: GREEN }}>
                          <IconCheck />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                    style={{ background: GREEN }}
                  >
                    {connecting
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Conectando…</>
                      : <><IconTN /> Conectar con TiendaNube <IconArrow /></>
                    }
                  </button>
                </div>
              )}

            </div>
          </div>

          {connectError && (
            <div className="rounded-xl px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-0.5">Error al conectar</p>
              <p className="text-xs text-red-600 dark:text-red-500">{connectError}</p>
            </div>
          )}

          {IS_DEV && (
            <div className="text-center">
              <button
                onClick={() => window.location.href = `${API_BASE}/api/v1/auth/dev-login`}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors"
              >
                🔧 Dev login
              </button>
            </div>
          )}

          <div className="text-center">
            <a href="https://letocorp.netlify.app"
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              ← Volver a letocorp.com
            </a>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/8 py-5">
        <p className="text-center text-[10px] text-slate-400">
          © 2026 LETO ·{' '}
          <a href="mailto:contact@letocorp.com" className="hover:text-slate-600 transition-colors">contact@letocorp.com</a>
          {' · '}
          <a href="https://letocorp.netlify.app/terms" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Términos</a>
        </p>
      </footer>

    </div>
  );
}
