'use client';

/**
 * MarginTrendChart — shows 30-day avg margin trend + critical products count.
 * Powered by GET /api/v1/dashboard/history?days=30
 * If no snapshots yet (first day), shows an "activating" empty state.
 */
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import { useApi } from '@/hooks/useApi';

interface HistoryPoint {
  date: string;
  avg_margin: number;
  negative_count: number;
  low_count: number;
  good_count: number;
  revenue_at_risk: number;
  potential_gain: number;
}

const GREEN = '#15803d';
const RED   = '#D64545';

function fmtDate(d: string) {
  const [, m, day] = d.split('-');
  return `${day}/${m}`;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function MarginTrendChart() {
  const [data, setData]       = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { call } = useApi();

  useEffect(() => {
    call('/api/v1/dashboard/history?days=30', { method: 'GET' }).then((d) => {
      if (Array.isArray(d)) setData(d as HistoryPoint[]);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5 animate-pulse">
        <div className="h-3 w-32 bg-slate-100 dark:bg-white/8 rounded mb-4" />
        <div className="h-40 bg-slate-50 dark:bg-white/4 rounded-lg" />
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
        <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4">
          Tendencia 30 días
        </p>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/8 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">El gráfico de tendencia</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            Se activa mañana. LETO captura un snapshot diario de tus márgenes para mostrar la evolución.
          </p>
        </div>
      </div>
    );
  }

  // Trend: last vs first
  const first = data[0].avg_margin;
  const last  = data[data.length - 1].avg_margin;
  const delta = last - first;
  const totalPotential = data[data.length - 1].potential_gain;

  return (
    <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/8 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            Tendencia 30 días
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black" style={{ color: GREEN }}>{last.toFixed(1)}%</span>
            <span className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}% vs hace 30d
            </span>
          </div>
        </div>
        {totalPotential > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Potencial mensual</p>
            <p className="text-sm font-bold text-[#15803d]">+{fmtMoney(totalPotential)}</p>
            <p className="text-[10px] text-slate-400">si corriges márgenes</p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={GREEN} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={GREEN} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            axisLine={false} tickLine={false}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            axisLine={false} tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, 'Margen promedio']}
            labelFormatter={(l) => fmtDate(String(l))}
          />
          <ReferenceLine y={20} stroke={GREEN} strokeDasharray="4 4" strokeWidth={1} opacity={0.4} />
          <Area
            type="monotone"
            dataKey="avg_margin"
            stroke={GREEN}
            strokeWidth={2}
            fill="url(#marginGrad)"
            dot={false}
            activeDot={{ r: 4, fill: GREEN }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Negative products sub-chart */}
      {data.some(d => d.negative_count > 0) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/6">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Productos críticos</p>
          <ResponsiveContainer width="100%" height={50}>
            <AreaChart data={data} margin={{ left: -20, right: 4, top: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={RED} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={RED} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 10 }}
                formatter={(v: number) => [v, 'Productos críticos']}
                labelFormatter={(l) => fmtDate(String(l))}
              />
              <Area type="monotone" dataKey="negative_count" stroke={RED} strokeWidth={1.5}
                fill="url(#redGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
