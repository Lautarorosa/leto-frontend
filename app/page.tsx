'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LetoLogo from '@/components/LetoLogo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const IS_DEV   = process.env.NODE_ENV === 'development';

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n.toFixed(0)}`;
}

function calcSim(products: number, avgTicket: number) {
  const productsAtRisk = Math.round(products * 0.28);
  const estimatedLoss  = Math.round(productsAtRisk * avgTicket * 0.12 * 30);
  return { productsAtRisk, estimatedLoss };
}

const IconArrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const IconWarning = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
const IconChart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const IconZap = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

function Simulator({ onConnect }: { onConnect: () => void }) {
  const [products,  setProducts]  = useState(80);
  const [avgTicket, setAvgTicket] = useState(4500);
  const [revealed,  setRevealed]  = useState(false);
  const sim = calcSim(products, avgTicket);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Productos
            </label>
            <input
              type="number" min={1} value={products}
              onChange={e => { setProducts(Math.max(1, parseInt(e.target.value) || 1)); setRevealed(false); }}
              className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white text-lg font-bold focus:outline-none focus:border-emerald-500/60 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Ticket promedio
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
              <input
                type="number" min={1} value={avgTicket}
                onChange={e => { setAvgTicket(Math.max(1, parseInt(e.target.value) || 1)); setRevealed(false); }}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white text-lg font-bold focus:outline-none focus:border-emerald-500/60 transition-all"
              />
            </div>
          </div>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold hover:bg-emerald-500/25 hover:border-emerald-500/50 transition-all"
          >
            Calcular mi pérdida mensual →
          </button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-red-400 flex-shrink-0"><IconWarning /></div>
                <div>
                  <p className="text-sm font-bold text-white">
                    ~{sim.productsAtRisk} productos con margen negativo real
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">después de comisiones TN + pasarela</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-red-500/15">
                <span className="text-xs text-slate-400">Pérdida mensual estimada</span>
                <span className="text-2xl font-black text-red-400">{fmtMoney(sim.estimatedLoss)}</span>
              </div>
            </div>
            <button
              onClick={onConnect}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Ver el número exacto de mi tienda <IconArrow />
            </button>
            <p className="text-center text-[11px] text-slate-500">Estimación basada en promedios de tiendas LATAM</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [connecting,   setConnecting]   = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

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
      <div className="flex items-center justify-center min-h-screen bg-[#060a06]">
        <div className="w-7 h-7 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a06] text-white overflow-x-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/6">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LetoLogo size={30} />
            <span className="text-[10px] font-semibold text-slate-600 tracking-widest uppercase ml-1">Beta</span>
          </div>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-50"
          >
            {connecting ? 'Conectando…' : 'Conectar tienda'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Análisis de márgenes para TiendaNube
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            ¿Cuánto estás{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
              perdiendo
            </span>
            <br />sin saberlo?
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Tus márgenes reales son{' '}
            <span className="text-white font-semibold">5–8% más bajos</span> de lo que creés.
            Las comisiones de TiendaNube y la pasarela se comen tu ganancia producto a producto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base transition-all shadow-xl shadow-emerald-500/25 disabled:opacity-60"
            >
              {connecting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Conectando…</>
              ) : (
                <>Conectar mi tienda gratis <IconArrow /></>
              )}
            </button>
            <a
              href="/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-slate-300 font-semibold text-base hover:border-white/20 hover:text-white transition-all"
            >
              Ver demo →
            </a>
          </div>

          {connectError && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="font-bold">Error:</span> {connectError}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-10 px-6 border-y border-white/6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '5.49%', label: 'Comisión mínima real',  sub: 'TN 2% + pasarela 3.49%' },
            { value: '28%',   label: 'Productos en riesgo',   sub: 'Promedio tiendas LATAM'  },
            { value: '3 min', label: 'Para ver tus números',  sub: 'Sin setup complejo'       },
          ].map(s => (
            <div key={s.value} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{s.value}</div>
              <div className="text-sm font-semibold text-white">{s.label}</div>
              <div className="text-xs text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Simulator */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">Calculá tu pérdida ahora</h2>
            <p className="text-slate-400 text-sm">Sin registrarte. Solo dos números.</p>
          </div>
          <Simulator onConnect={handleConnect} />
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20 px-6 border-t border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">Cómo funciona</h2>
            <p className="text-slate-400 text-sm">De cero a decisiones de precio en 4 pasos.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { n: '01', title: 'Conectás tu TiendaNube',    body: 'OAuth seguro. LETO lee tu catálogo y precios — nunca modifica nada sin tu aprobación.'                    },
              { n: '02', title: 'Cargás tus costos reales',  body: 'Subís un Excel con el costo de cada producto, o los cargás uno por uno.'                                  },
              { n: '03', title: 'LETO calcula el margen real', body: 'Suma comisiones TN + pasarela + envío. Te dice exactamente qué productos te hacen perder dinero.'        },
              { n: '04', title: 'Tomás acción con 1 click',  body: 'Para cada problema, LETO te da 3 opciones claras. Vos elegís y confirmás — LETO ejecuta.'                 },
            ].map(step => (
              <div key={step.n} className="bg-white/3 hover:bg-white/5 border border-white/8 hover:border-white/15 rounded-2xl p-6 flex gap-4 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/20 transition-all">
                  {step.n}
                </div>
                <div>
                  <p className="font-bold text-white mb-1">{step.title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6 border-t border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">Todo lo que necesitás</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <IconChart />, title: 'Márgenes reales en tiempo real', body: 'Ve exactamente cuánto ganás en cada producto después de todas las comisiones.' },
              { icon: <IconZap />,   title: 'Recomendaciones concretas',      body: '3 opciones por producto problemático: subir precio, liquidar, o pausar.'     },
              { icon: <IconShield />,title: 'Autopilot con guardrails',        body: 'Ajustes automáticos dentro de los límites que vos configurás.'               },
            ].map(f => (
              <div key={f.title} className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  {f.icon}
                </div>
                <p className="font-bold text-white">{f.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust pills */}
      <section className="relative z-10 py-10 px-6 border-t border-white/6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            'Solo lectura al catálogo',
            'Cambios solo con tu aprobación',
            'Sin tarjeta de crédito',
            'Datos encriptados',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <IconCheck />
              </div>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 py-24 px-6 border-t border-white/6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">Empezá a ver tus números reales</h2>
          <p className="text-slate-400">Conectá tu tienda en 3 minutos. Sin setup. Sin tarjeta.</p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base transition-all shadow-xl shadow-emerald-500/25 disabled:opacity-60"
          >
            {connecting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Conectando…</>
            ) : (
              <>Conectar con TiendaNube <IconArrow /></>
            )}
          </button>
          {connectError && <p className="text-sm text-red-400">{connectError}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LetoLogo size={22} showWordmark={false} />
            <span className="text-xs text-slate-500">© 2026 LETO Corp</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="mailto:contact@letocorp.com" className="hover:text-slate-300 transition-colors">contact@letocorp.com</a>
            <a href="https://letocorp.netlify.app/terms" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">Términos</a>
            <a href="https://letocorp.netlify.app/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>

      {IS_DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => window.location.href = `${API_BASE}/api/v1/auth/dev-login`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:text-white transition-colors"
          >
            🔧 Dev login
          </button>
        </div>
      )}

    </div>
  );
}
