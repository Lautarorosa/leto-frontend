'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LetoLogo from '@/components/LetoLogo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const IS_DEV   = process.env.NODE_ENV === 'development';

const TEXTS = {
  es: {
    badge: 'Análisis de márgenes para TiendaNube',
    h1a: '¿Cuánto estás', h1b: 'perdiendo', h1c: 'sin saberlo?',
    sub: 'Tus márgenes reales son', subBold: '5–8% más bajos', subEnd: 'de lo que creés. Las comisiones de TiendaNube y la pasarela se comen tu ganancia.',
    cta: 'Conectar mi tienda gratis', demo: 'Ver demo', navCta: 'Conectar tienda',
    s1l: 'Comisión mínima real', s2l: 'Productos en riesgo', s3l: 'Para ver tus números',
    s1s: 'TN 2% + pasarela 3.49%', s2s: 'Promedio tiendas LATAM', s3s: 'Sin setup complejo',
    simTitle: 'Calcula tu pérdida ahora', simSub: 'Sin registrarte. Solo dos números.',
    prod: 'PRODUCTOS', ticket: 'TICKET PROMEDIO',
    calcBtn: 'Calcular mi pérdida mensual', riskLabel: 'productos con margen negativo real',
    riskSub: 'después de comisiones TN + pasarela', lossLabel: 'Pérdida mensual estimada',
    simCta: 'Ver el número exacto de mi tienda', simDisc: 'Estimación basada en promedios de tiendas LATAM',
    howTitle: 'Cómo funciona', howSub: 'De cero a decisiones de precio en 4 pasos.',
    steps: [
      { n: '01', title: 'Conectás tu TiendaNube',     body: 'OAuth seguro. LETO lee tu catálogo y precios, nunca modifica nada sin tu aprobación.' },
      { n: '02', title: 'Cargás tus costos reales',   body: 'Subís un Excel con el costo de cada producto, o los cargás uno por uno.' },
      { n: '03', title: 'LETO calcula el margen real', body: 'Suma comisiones TN + pasarela + envío. Te dice exactamente qué productos te hacen perder dinero.' },
      { n: '04', title: 'Tomás acción con 1 click',   body: 'Para cada problema, LETO te da 3 opciones claras. Vos elegís y confirmás — LETO ejecuta.' },
    ],
    featTitle: 'Todo lo que necesitás',
    feats: [
      { title: 'Márgenes reales en tiempo real', body: 'Ves exactamente cuánto ganás en cada producto después de todas las comisiones.' },
      { title: 'Recomendaciones concretas',      body: '3 opciones por producto problemático: subir precio, liquidar o pausar.' },
      { title: 'Acciones con guardrails',          body: 'Cada cambio requiere tu confirmación. LETO propone, vos decidís.' },
    ],
    trust: ['Solo lectura al catálogo', 'Cambios solo con tu aprobación', 'Sin tarjeta de crédito', 'Datos encriptados'],
    ctaTitle: 'Empezá a ver tus números reales', ctaSub: 'Conectá tu tienda en 3 minutos. Sin setup. Sin tarjeta.',
    ctaBtn: 'Conectar con TiendaNube', connecting: 'Conectando...',
    terms: 'Términos', privacy: 'Privacidad', dpa: 'DPA', dataDeletion: 'Eliminación de datos',
    errBackend: 'No se puede conectar al backend.',
  },
  en: {
    badge: 'Margin analysis for TiendaNube stores',
    h1a: 'How much are you', h1b: 'losing', h1c: 'without knowing it?',
    sub: 'Your real margins are', subBold: '5-8% lower', subEnd: 'than you think. TiendaNube and gateway fees eat your profit product by product.',
    cta: 'Connect my store for free', demo: 'See demo', navCta: 'Connect store',
    s1l: 'Minimum real commission', s2l: 'Products at risk', s3l: 'To see your numbers',
    s1s: 'TN 2% + gateway 3.49%', s2s: 'Average LATAM stores', s3s: 'No complex setup',
    simTitle: 'Calculate your loss now', simSub: 'No sign-up. Just two numbers.',
    prod: 'PRODUCTS', ticket: 'AVG TICKET',
    calcBtn: 'Calculate my monthly loss', riskLabel: 'products with real negative margin',
    riskSub: 'after TN + gateway fees', lossLabel: 'Estimated monthly loss',
    simCta: 'See exact numbers for my store', simDisc: 'Estimate based on LATAM store averages',
    howTitle: 'How it works', howSub: 'From zero to pricing decisions in 4 steps.',
    steps: [
      { n: '01', title: 'Connect your TiendaNube',    body: 'Secure OAuth. LETO reads your catalog and prices, never modifies anything without your approval.' },
      { n: '02', title: 'Load your real costs',        body: 'Upload an Excel with the cost of each product, or enter them one by one.' },
      { n: '03', title: 'LETO calculates real margin', body: 'Adds TN + gateway + shipping. Tells you exactly which products are losing you money.' },
      { n: '04', title: 'Take action with 1 click',   body: 'For each issue, LETO gives you 3 clear options. You choose and confirm — LETO executes.' },
    ],
    featTitle: 'Everything you need',
    feats: [
      { title: 'Real-time real margins',    body: 'See exactly how much you earn on each product after all fees.' },
      { title: 'Concrete recommendations', body: '3 options per problematic product: raise price, liquidate, or pause.' },
      { title: 'Actions with guardrails',   body: 'Every change requires your confirmation. LETO suggests, you decide.' },
    ],
    trust: ['Read-only catalog access', 'Changes only with your approval', 'No credit card required', 'Encrypted data'],
    ctaTitle: 'Start seeing your real numbers', ctaSub: 'Connect your store in 3 minutes. No setup. No credit card.',
    ctaBtn: 'Connect with TiendaNube', connecting: 'Connecting...',
    terms: 'Terms', privacy: 'Privacy', dpa: 'DPA', dataDeletion: 'Data Deletion',
    errBackend: 'Cannot connect to backend.',
  },
} as const;

type Lang = keyof typeof TEXTS;

function fmtMoney(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return '$' + Math.round(n / 1_000) + 'K';
  return '$' + Math.round(n).toLocaleString('es-AR');
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
const IconMoon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
  </svg>
);
const IconSun = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707z" clipRule="evenodd"/>
  </svg>
);

interface SimProps { onConnect: () => void; dark: boolean; tx: typeof TEXTS['es']; }

function Simulator({ onConnect, dark, tx }: SimProps) {
  const [products,  setProducts]  = useState(80);
  const [avgTicket, setAvgTicket] = useState(4500);
  const [revealed,  setRevealed]  = useState(false);
  const sim = calcSim(products, avgTicket);

  const inputCls = dark
    ? 'w-full px-4 py-3 rounded-xl border border-white/15 text-white text-lg font-bold focus:outline-none focus:border-[#15803d]/60 transition-all'
    : 'w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-lg font-bold focus:outline-none focus:border-[#15803d] transition-all';

  const inputStyle = dark
    ? { background: 'rgba(255,255,255,0.08)' }
    : { background: '#f1f5f9' };

  const cardCls = dark
    ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5'
    : 'bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={cardCls}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={'block text-xs font-semibold mb-2 uppercase tracking-wider ' + (dark ? 'text-slate-400' : 'text-slate-500')}>
              {tx.prod}
            </label>
            <input
              type="number" min={1} value={products}
              onChange={e => { setProducts(Math.max(1, parseInt(e.target.value) || 1)); setRevealed(false); }}
              className={inputCls} style={inputStyle}
            />
          </div>
          <div>
            <label className={'block text-xs font-semibold mb-2 uppercase tracking-wider ' + (dark ? 'text-slate-400' : 'text-slate-500')}>
              {tx.ticket}
            </label>
            <div className="relative">
              <span className={'absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ' + (dark ? 'text-slate-400' : 'text-slate-500')}>$</span>
              <input
                type="number" min={1} value={avgTicket}
                onChange={e => { setAvgTicket(Math.max(1, parseInt(e.target.value) || 1)); setRevealed(false); }}
                className={inputCls.replace('px-4', 'pl-8 pr-4')} style={inputStyle}
              />
            </div>
          </div>
        </div>

        {!revealed ? (
          <button onClick={() => setRevealed(true)}
            className="w-full py-3.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-bold transition-all shadow-lg shadow-[#15803d]/20">
            {tx.calcBtn} →
          </button>
        ) : (
          <div className="space-y-4">
            <div className={'rounded-xl p-4 ' + (dark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-red-500 flex-shrink-0"><IconWarning /></div>
                <div>
                  <p className={'text-sm font-bold ' + (dark ? 'text-white' : 'text-slate-900')}>
                    ~{sim.productsAtRisk} {tx.riskLabel}
                  </p>
                  <p className={'text-xs mt-0.5 ' + (dark ? 'text-slate-400' : 'text-slate-500')}>{tx.riskSub}</p>
                </div>
              </div>
              <div className={'flex items-center justify-between pt-3 border-t ' + (dark ? 'border-red-500/15' : 'border-red-200')}>
                <span className={'text-xs ' + (dark ? 'text-slate-400' : 'text-slate-500')}>{tx.lossLabel}</span>
                <span className="text-2xl font-black text-red-500">{fmtMoney(sim.estimatedLoss)}</span>
              </div>
            </div>
            <button onClick={onConnect}
              className="w-full py-3.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#15803d]/20">
              {tx.simCta} <IconArrow />
            </button>
            <p className={'text-center text-[11px] ' + (dark ? 'text-slate-500' : 'text-slate-400')}>{tx.simDisc}</p>
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
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>('es');
  const tx = TEXTS[lang];

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      const result = await fetch(API_BASE + '/api/v1/auth/login').then(r => {
        if (!r.ok) throw new Error('Backend respondio ' + r.status);
        return r.json();
      });
      if (result?.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setConnectError('El backend no devolvió una URL de autorización.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setConnectError(msg.includes('fetch') ? tx.errBackend : msg);
    } finally {
      setConnecting(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#060a06]">
        <div className="w-7 h-7 rounded-full border-2 border-[#15803d]/30 border-t-[#15803d] animate-spin" />
      </div>
    );
  }

  const bg       = dark ? 'bg-[#060a06] text-white'  : 'bg-slate-50 text-slate-900';
  const navCls   = dark ? 'border-white/6 bg-[#060a06]/90 backdrop-blur-md' : 'border-slate-200 bg-white/90 backdrop-blur-md';
  const pill     = dark ? 'bg-[#15803d]/10 border-[#15803d]/20 text-[#15803d]' : 'bg-[#15803d]/10 border-[#15803d]/30 text-[#15803d]';
  const sec      = dark ? 'border-white/6'            : 'border-slate-200';
  const card     = dark ? 'bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/15' : 'bg-white border-slate-200 hover:border-[#15803d]/20 hover:shadow-sm';
  const statVal  = dark ? 'text-[#15803d]'          : 'text-[#15803d]';
  const statSub  = dark ? 'text-slate-500'            : 'text-slate-400';
  const iconBg   = dark ? 'bg-[#15803d]/10 border-[#15803d]/20 text-[#15803d] group-hover:bg-[#15803d]/20' : 'bg-[#15803d]/8 border-[#15803d]/20 text-[#15803d] group-hover:bg-[#15803d]/15';
  const featIcon = dark ? 'bg-[#15803d]/10 border-[#15803d]/20 text-[#15803d]' : 'bg-[#15803d]/8 border-[#15803d]/20 text-[#15803d]';
  const heading  = dark ? 'text-white'                : 'text-slate-900';
  const body     = dark ? 'text-slate-400'            : 'text-slate-600';
  const muted    = dark ? 'text-slate-400'            : 'text-slate-500';
  const toggleCls = dark
    ? 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
    : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300';
  const demoBtnCls = dark
    ? 'border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/5'
    : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100';

  return (
    <div className={'min-h-screen overflow-x-hidden transition-colors duration-300 ' + bg}>

      {dark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
        </div>
      )}

      <nav className={'relative z-10 border-b sticky top-0 ' + navCls}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LetoLogo size={30} />
            <span className={'text-[10px] font-semibold tracking-widest uppercase ml-1 ' + (dark ? 'text-slate-600' : 'text-slate-400')}>Beta</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className={'h-9 px-3 flex items-center justify-center rounded-lg border text-xs font-bold tracking-widest transition-all ' + toggleCls}>
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <button onClick={() => setDark(!dark)}
              className={'w-9 h-9 flex items-center justify-center rounded-lg border transition-all ' + toggleCls}>
              {dark ? <IconSun /> : <IconMoon />}
            </button>
            <button onClick={handleConnect} disabled={connecting}
              className={'hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-50 ' + (dark ? 'border-[#15803d]/40 text-[#15803d] hover:bg-[#15803d]/10' : 'border-[#15803d] text-[#15803d] hover:bg-[#15803d]/5')}>
              {connecting ? tx.connecting : tx.navCta}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative z-10 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className={'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ' + pill}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse" />
            {tx.badge}
          </div>
          <h1 className={'text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] ' + heading}>
            {tx.h1a}{' '}
            <span className="text-[#15803d]">
              {tx.h1b}
            </span>
            <br />{tx.h1c}
          </h1>
          <p className={'text-lg max-w-xl mx-auto leading-relaxed ' + body}>
            {tx.sub}{' '}
            <span className={'font-semibold ' + heading}>{tx.subBold}</span>{' '}
            {tx.subEnd}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button onClick={handleConnect} disabled={connecting}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-base transition-all shadow-xl shadow-[#15803d]/20 disabled:opacity-60">
              {connecting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {tx.connecting}</>
                : <>{tx.cta} <IconArrow /></>
              }
            </button>
            <a href="/demo" className={'w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border font-semibold text-base transition-all ' + demoBtnCls}>
              {tx.demo}
            </a>
          </div>
          {connectError && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <span className="font-bold">Error:</span> {connectError}
            </div>
          )}
        </div>
      </section>

      <section className={'relative z-10 py-10 px-6 border-y ' + sec}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '5.49%', label: tx.s1l, sub: tx.s1s },
            { value: '28%',   label: tx.s2l, sub: tx.s2s },
            { value: '3 min', label: tx.s3l, sub: tx.s3s },
          ].map(s => (
            <div key={s.value} className="space-y-1">
              <div className={'text-2xl sm:text-3xl font-black ' + statVal}>{s.value}</div>
              <div className={'text-sm font-semibold ' + heading}>{s.label}</div>
              <div className={'text-xs ' + statSub}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className={'text-2xl sm:text-3xl font-black mb-3 ' + heading}>{tx.simTitle}</h2>
            <p className={'text-sm ' + muted}>{tx.simSub}</p>
          </div>
          <Simulator onConnect={handleConnect} dark={dark} tx={tx} />
        </div>
      </section>

      <section className={'relative z-10 py-20 px-6 border-t ' + sec}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={'text-2xl sm:text-3xl font-black mb-3 ' + heading}>{tx.howTitle}</h2>
            <p className={'text-sm ' + muted}>{tx.howSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {tx.steps.map(step => (
              <div key={step.n} className={'border rounded-2xl p-6 flex gap-4 transition-all group ' + card}>
                <div className={'w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ' + iconBg}>
                  {step.n}
                </div>
                <div>
                  <p className={'font-bold mb-1 ' + heading}>{step.title}</p>
                  <p className={'text-sm leading-relaxed ' + body}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={'relative z-10 py-20 px-6 border-t ' + sec}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={'text-2xl sm:text-3xl font-black mb-3 ' + heading}>{tx.featTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <IconChart />, ...tx.feats[0] },
              { icon: <IconZap />,   ...tx.feats[1] },
              { icon: <IconShield />, ...tx.feats[2] },
            ].map(f => (
              <div key={f.title} className={'border rounded-2xl p-6 space-y-3 transition-all ' + card}>
                <div className={'w-10 h-10 rounded-xl border flex items-center justify-center ' + featIcon}>
                  {f.icon}
                </div>
                <p className={'font-bold ' + heading}>{f.title}</p>
                <p className={'text-sm leading-relaxed ' + body}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={'relative z-10 py-10 px-6 border-t ' + sec}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {tx.trust.map(item => (
            <div key={item} className={'flex items-center gap-2 text-sm ' + muted}>
              <div className={'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ' + featIcon}>
                <IconCheck />
              </div>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={'relative z-10 py-24 px-6 border-t ' + sec}>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className={'text-3xl sm:text-4xl font-black ' + heading}>{tx.ctaTitle}</h2>
          <p className={muted}>{tx.ctaSub}</p>
          <button onClick={handleConnect} disabled={connecting}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-base transition-all shadow-xl shadow-[#15803d]/20 disabled:opacity-60">
            {connecting
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {tx.connecting}</>
              : <>{tx.ctaBtn} <IconArrow /></>
            }
          </button>
          {connectError && <p className="text-sm text-red-500">{connectError}</p>}
        </div>
      </section>

      <footer className={'relative z-10 border-t py-8 px-6 ' + sec}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LetoLogo size={22} showWordmark={false} />
            <span className={'text-xs ' + statSub}>© 2026 LETO Corp</span>
          </div>
          <div className={'flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs ' + statSub}>
            <a href="mailto:letocorp.uy@gmail.com" className="hover:text-[#15803d] transition-colors">letocorp.uy@gmail.com</a>
            <a href="/terms" className="hover:text-[#15803d] transition-colors">{tx.terms}</a>
            <a href="/privacy" className="hover:text-[#15803d] transition-colors">{tx.privacy}</a>
            <a href="/dpa" className="hover:text-[#15803d] transition-colors">{tx.dpa}</a>
            <a href="/data-deletion" className="hover:text-[#15803d] transition-colors">{tx.dataDeletion}</a>
          </div>
        </div>
      </footer>

      {IS_DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => { window.location.href = API_BASE + '/api/v1/auth/dev-login'; }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:text-white transition-colors">
            Dev login
          </button>
        </div>
      )}
    </div>
  );
}
