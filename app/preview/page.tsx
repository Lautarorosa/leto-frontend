'use client';
/**
 * /preview — Full dashboard preview with mock data. No auth, no DB required.
 * Shows every V1 feature: KPIs, trend chart, charts, table, plan badge,
 * bulk apply modal, upgrade modal.
 */
import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import { UpgradeModal } from '@/components/UpgradeModal';
import { BulkRecommendationsModal } from '@/components/BulkRecommendationsModal';
import type { Product } from '@/components/ProductsTable';

const G = '#16603D', R = '#D64545', AM = '#b45309';

const fmt = (n: number) =>
  n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` :
  n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` :
  `$${n.toFixed(0)}`;

/* ── Mock products ─────────────────────────────────────────────────────── */
const PRODUCTS: Product[] = [
  { id:1,  name:'Remera Básica Blanca',      category:'Remeras',    sku:'REM-001', price:5500,  cost:1400,  promotional_price:null,  stock:85, margin:60.1,  monthly_sales:42, synced_at:null },
  { id:2,  name:'Remera Oversize Negra',     category:'Remeras',    sku:'REM-002', price:7800,  cost:2100,  promotional_price:6200,  stock:60, margin:17.8,  monthly_sales:28, synced_at:null },
  { id:3,  name:'Jeans Skinny Azul',         category:'Pantalones', sku:'PAN-001', price:22000, cost:9500,  promotional_price:null,  stock:40, margin:38.7,  monthly_sales:15, synced_at:null },
  { id:4,  name:'Jeans Mom Gris',            category:'Pantalones', sku:'PAN-002', price:24500, cost:10800, promotional_price:19900, stock:32, margin:-2.4,  monthly_sales:11, synced_at:null },
  { id:5,  name:'Buzo Canguro Verde',        category:'Buzos',      sku:'BUZ-001', price:14500, cost:5200,  promotional_price:null,  stock:55, margin:52.3,  monthly_sales:33, synced_at:null },
  { id:6,  name:'Campera Rompeviento',       category:'Deportivo',  sku:'DEP-005', price:25000, cost:19000, promotional_price:19900, stock:20, margin:-8.6,  monthly_sales:5,  synced_at:null },
  { id:7,  name:'Blazer Gris Oversize',      category:'Blazers',    sku:'BLZ-001', price:35000, cost:42000, promotional_price:28000, stock:12, margin:-14.2, monthly_sales:2,  synced_at:null },
  { id:8,  name:'Botas Chelsea Cuero',       category:'Calzado',    sku:'CAL-003', price:45000, cost:34000, promotional_price:38000, stock:10, margin:-1.8,  monthly_sales:3,  synced_at:null },
  { id:9,  name:'Zapatillas Chunky Blancas', category:'Calzado',    sku:'CAL-001', price:38000, cost:26000, promotional_price:null,  stock:18, margin:14.1,  monthly_sales:8,  synced_at:null },
  { id:10, name:'Calza Deportiva Negra',     category:'Deportivo',  sku:'DEP-001', price:9500,  cost:3500,  promotional_price:null,  stock:90, margin:56.7,  monthly_sales:65, synced_at:null },
  { id:11, name:'Vestido Floral Verano',     category:'Vestidos',   sku:'VES-001', price:18900, cost:6200,  promotional_price:14900, stock:25, margin:9.3,   monthly_sales:18, synced_at:null },
  { id:12, name:'Pantalón Cargo Verde',      category:'Pantalones', sku:'PAN-003', price:19800, cost:8200,  promotional_price:null,  stock:28, margin:31.2,  monthly_sales:9,  synced_at:null },
];

/* ── Mock 30-day history ──────────────────────────────────────────────── */
const HISTORY = Array.from({ length: 30 }, (_, i) => {
  const p = i / 29;
  const rand = () => (Math.random() - 0.5) * 1.4;
  return {
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
    avg_margin: parseFloat((11 + p * 7.5 + rand()).toFixed(2)),
    negative_count: Math.max(0, Math.round(4 - p * 2.5 + (Math.random() > 0.7 ? 1 : 0))),
  };
});

const fmtDate = (d: string) => { const [,m,day] = d.split('-'); return `${day}/${m}`; };

/* ── Margin badge ─────────────────────────────────────────────────────── */
function MBadge({ m }: { m: number | null }) {
  if (m === null) return <span className="px-2 py-0.5 rounded text-xs text-slate-400 bg-slate-100">Sin costo</span>;
  const [col, bg, lbl] = m < 0 ? [R,'bg-red-50','Crítico'] : m < 20 ? [AM,'bg-amber-50','Bajo'] : [G,'bg-green-50','Bueno'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${bg} dark:bg-white/5`} style={{color:col}}>
      {m.toFixed(1)}% <span className="text-[10px] opacity-70">{lbl}</span>
    </span>
  );
}

/* ── KPI card ─────────────────────────────────────────────────────────── */
function KPI({label,value,sub,color,accent}:{label:string;value:string;sub:string;color:string;accent?:string}) {
  return (
    <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5 space-y-2">
      <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-black leading-none" style={{color}}>{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
      {accent && <p className="text-[11px] font-medium" style={{color}}>{accent}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */

export default function PreviewPage() {
  const [dark,    setDark]    = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [bulk,    setBulk]    = useState(false);
  const [plan,    setPlan]    = useState<'free'|'basic'|'pro'>('free');

  const last  = HISTORY[HISTORY.length - 1].avg_margin;
  const first = HISTORY[0].avg_margin;
  const delta = last - first;

  const worst = useMemo(() =>
    [...PRODUCTS].filter(p => p.margin !== null)
      .sort((a,b) => (a.margin??0) - (b.margin??0))
      .slice(0, 6)
      .map(p => ({ name: (p.name.length > 14 ? p.name.slice(0,14)+'…' : p.name), margin: parseFloat((p.margin??0).toFixed(1)), fill: (p.margin??0) < 0 ? R : (p.margin??0) < 20 ? AM : G }))
  , []);

  return (
    <div className={dark ? 'dark' : ''}>
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors">

      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0d0d0d] border-b border-slate-200 dark:border-white/8 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-4">
          <span className="font-black text-lg tracking-tight" style={{color:G}}>LETO</span>
          <div className="w-px h-5 bg-slate-200 dark:bg-white/10"/>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Moda Urbana · Demo</p>
            <p className="text-[10px] text-slate-400">4 de junio 2026</p>
          </div>

          {/* Plan badge — click to open upgrade */}
          <button onClick={() => setUpgrade(true)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${
              plan === 'pro'   ? 'bg-slate-900 dark:bg-white/10 text-white' :
              plan === 'basic' ? 'bg-[#1B5E3F]/10 text-[#1B5E3F] dark:text-green-400' :
              'bg-slate-100 dark:bg-white/8 text-slate-500 hover:bg-[#1B5E3F]/10 hover:text-[#1B5E3F]'
            }`}>
            {plan === 'free'  ? <><span>Gratis</span><span className="text-[9px] opacity-60 ml-1">→ Mejorar</span></> :
             plan === 'basic' ? <span>Básico ✓</span> :
             <span>Pro ⚡</span>}
          </button>

          <div className="flex-1"/>

          <div className="flex items-center gap-2">
            {/* Aplicar en masa — badge con count */}
            <button onClick={() => setBulk(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/40 text-xs font-semibold text-[#D64545] hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span className="hidden sm:block">Aplicar en masa</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 dark:bg-red-900/30">8</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-500 hover:text-[#16603D] hover:border-[#16603D]/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span className="hidden sm:block">Excel</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-500 hover:text-[#16603D] hover:border-[#16603D]/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span className="hidden sm:block">PDF</span>
            </button>

            <button onClick={() => setDark(!dark)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-[#16603D] hover:border-[#16603D]/40 transition-all">
              {dark
                ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707z" clipRule="evenodd"/></svg>
                : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              }
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Page title + live badge */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{color:G}}>Panel de márgenes</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Moda Urbana</h1>
            <p className="text-sm text-slate-400 mt-0.5">Margen real con comisiones incluidas · 4 de junio 2026</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{borderColor:`${R}40`,background:`${R}08`}}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:R}}/>
            <p className="text-xs font-semibold" style={{color:R}}>4 productos en pérdida</p>
          </div>
        </div>

        {/* Critical alert banner */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border bg-red-50 border-red-200 dark:bg-[#D64545]/8 dark:border-[#D64545]/20">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-red-600 text-sm">4 productos están vendiendo a pérdida</p>
            <p className="text-xs text-red-500/80 mt-0.5">Cada venta te cuesta dinero. El precio no cubre costo + comisiones.</p>
          </div>
          <button onClick={() => setBulk(true)}
            className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all">
            Corregir ahora →
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPI label="Margen promedio"    value="18.4%"   sub="4 productos saludables"     color={AM} accent="Bajo objetivo (20%)" />
          <KPI label="Ingresos en riesgo" value="$412K"   sub="facturación comprometida"   color={R}  />
          <KPI label="Críticos"           value="4"       sub="margen negativo real"        color={R}  accent="Acción inmediata" />
          <KPI label="Margen bajo"        value="4"       sub="entre 0% y 20%"             color={AM} />
          <KPI label="Potencial mensual"  value="+$68K"   sub="si corriges márgenes"       color={G}  accent="↑ disponible ahora" />
        </div>

        {/* ── TREND CHART — el gráfico nuevo ── */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Tendencia 30 días</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black" style={{color:G}}>{last.toFixed(1)}%</span>
                <span className={`text-xs font-semibold ${delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {delta >= 0 ? '↑' : '↓'} {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs hace 30d
                </span>
              </div>
            </div>
            <div className="text-right bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-lg px-3 py-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Potencial mensual</p>
              <p className="text-base font-black" style={{color:G}}>+$68K</p>
              <p className="text-[10px] text-slate-400">si corriges márgenes</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={HISTORY} margin={{left:-20,right:4,top:4,bottom:0}}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={G} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={G} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false} interval={6}/>
              <YAxis tickFormatter={v=>`${v}%`} tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false} domain={['auto','auto']}/>
              <Tooltip
                contentStyle={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,fontSize:11}}
                formatter={(v:number) => [`${v.toFixed(1)}%`, 'Margen promedio']}
                labelFormatter={(l) => fmtDate(String(l))}
              />
              <ReferenceLine y={20} stroke={G} strokeDasharray="4 4" strokeWidth={1} opacity={0.4}/>
              <Area type="monotone" dataKey="avg_margin" stroke={G} strokeWidth={2.5}
                fill="url(#trendGrad)" dot={false} activeDot={{r:5,fill:G,strokeWidth:2,stroke:'white'}}/>
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <div className="w-8 border-t-2 border-dashed" style={{borderColor:G,opacity:.5}}/>
            <span>Línea de objetivo: 20% margen</span>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Donut */}
          <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">Distribución</p>
            <ResponsiveContainer width="100%" height={155}>
              <PieChart>
                <Pie data={[{name:'Crítico',value:4,fill:R},{name:'Bajo',value:4,fill:AM},{name:'Bueno',value:4,fill:G}]}
                  cx="50%" cy="50%" innerRadius={46} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {[R,AM,G].map((fill,i) => <Cell key={i} fill={fill}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,fontSize:11}} formatter={(v:number)=>[`${v} productos`,'']}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {[{l:'Crítico (< 0%)',c:4,col:R},{l:'Bajo (0–20%)',c:4,col:AM},{l:'Bueno (≥ 20%)',c:4,col:G}].map(d=>(
                <div key={d.l} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{background:d.col}}/>
                    <span className="text-slate-500 dark:text-slate-400">{d.l}</span>
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{d.c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Worst margins */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">Peores márgenes</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={worst} layout="vertical" margin={{left:0,right:28,top:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false}/>
                <XAxis type="number" tickFormatter={v=>`${v}%`} tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" width={115} tick={{fontSize:10,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,fontSize:11}} formatter={(v:number)=>[`${v}%`,'Margen']}/>
                <Bar dataKey="margin" radius={[0,3,3,0]} maxBarSize={14}>
                  {worst.map((d,i) => <Cell key={i} fill={d.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category bars */}
          <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">Por categoría</p>
            <div className="space-y-3.5">
              {[{n:'Buzos',v:52.3},{n:'Deportivo',v:24.1},{n:'Pantalones',v:22.5},{n:'Remeras',v:18.4},{n:'Vestidos',v:9.3},{n:'Calzado',v:6.2},{n:'Blazers',v:-14.2}].map(r=>(
                <div key={r.n}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-300">{r.n}</span>
                    <span className="text-xs font-semibold" style={{color:r.v<0?R:r.v<20?AM:G}}>{r.v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,Math.max(2,(r.v+20)*1.1))}%`,background:r.v<0?R:r.v<20?AM:G}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products table */}
        <div>
          <div className="flex items-center gap-4 pt-2 mb-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/8"/>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Todos los productos</p>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/8"/>
          </div>

          <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 overflow-hidden">
            {/* Search + tabs + category filter */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/6 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
                  </svg>
                  <input readOnly placeholder="Buscar producto, SKU o categoría…"
                    className="w-56 pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-400 placeholder:text-slate-400"/>
                </div>
                <div className="flex items-center gap-1.5">
                  {[{l:'Todos',a:true},{l:'🔴 Críticos',a:false},{l:'🟡 Bajo',a:false},{l:'Sin costo',a:false}].map(t=>(
                    <button key={t.l} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${t.a?'bg-[#16603D] text-white':'border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'}`}>{t.l}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mr-1">Categoría:</span>
                {['Todas','Remeras','Pantalones','Buzos','Calzado','Deportivo','Blazers'].map((c,i)=>(
                  <button key={c} className={`px-2.5 py-1 rounded-full text-xs font-medium ${i===0?'bg-[#16603D] text-white':'bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400 hover:bg-[#16603D]/10 hover:text-[#16603D] transition-colors'}`}>{c}</button>
                ))}
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0c0e]">
                  {['Producto','Categoría','Precio','Costo','Margen','Stock',''].map((h,i)=>(
                    <th key={i} className={`px-4 py-3.5 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-left ${i>=3?'hidden md:table-cell':''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {PRODUCTS.slice(0,10).map(p=>(
                  <tr key={p.id} className="bg-white dark:bg-[#101215] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3.5 pl-5">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#16603D] transition-colors">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-300 text-xs">{p.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-sm text-slate-900 dark:text-white">
                      ${p.price.toLocaleString('es-AR')}
                      {p.promotional_price && p.promotional_price < p.price && (
                        <span className="block text-[10px] text-amber-500 font-normal">Promo ${p.promotional_price.toLocaleString('es-AR')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">
                      ${p.cost!.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <MBadge m={p.margin}/>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm hidden md:table-cell">
                      <span className={p.stock===0?'text-red-500 font-semibold text-slate-500':' text-slate-500 dark:text-slate-400'}>{p.stock} u.</span>
                    </td>
                    <td className="px-4 py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-[#16603D] hover:border-[#16603D]/40 text-xs font-medium transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                          <span className="hidden sm:inline">Calcular</span>
                        </button>
                        <button className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold transition-all ${p.margin===null?'bg-slate-200 cursor-not-allowed':'bg-[#16603D] hover:bg-[#0f4a2d]'}`}>
                          Ver opciones
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ─── MODALS ──────────────────────────────────────────────────── */}
      <UpgradeModal
        isOpen={upgrade}
        onClose={() => setUpgrade(false)}
        currentPlan={plan}
        onUpgraded={() => { setPlan('basic'); setUpgrade(false); }}
      />
      <BulkRecommendationsModal
        products={PRODUCTS}
        isOpen={bulk}
        onClose={() => setBulk(false)}
        onApplied={() => setBulk(false)}
      />

    </div>
    </div>
  );
}
