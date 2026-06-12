'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import * as XLSX from 'xlsx'; // v0.20.x+ — prototype pollution CVE patched
import LetoLogo from '@/components/LetoLogo';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost: number | null;
}

interface ParsedRow {
  identifier: string;
  cost: number;
  raw_cost: string;
  valid: boolean;
}

interface ImportResult {
  matched: number;
  skipped: number;
  not_found: string[];
  updated: { id: number; name: string; cost: number }[];
}

type Step = 'choose' | 'preview' | 'result' | 'manual';

const STEP_ORDER: Step[] = ['choose', 'preview', 'result'];
const STEP_LABELS: Record<Step, string> = {
  choose:  'Subir archivo',
  preview: 'Revisar datos',
  result:  'Listo',
  manual:  'Carga manual',
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function parseFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb   = XLSX.read(data, { type: 'binary' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];

        // Skip header row if first cell looks like a label
        const start = isNaN(Number(rows[0]?.[1])) ? 1 : 0;
        const parsed: ParsedRow[] = rows
          .slice(start)
          .filter((r) => r[0] != null && r[0] !== '')
          .map((r) => {
            const identifier = String(r[0] ?? '').trim();
            const raw_cost   = String(r[1] ?? '').replace(',', '.').trim();
            const cost       = parseFloat(raw_cost);
            return {
              identifier,
              cost: isNaN(cost) ? 0 : cost,
              raw_cost,
              valid: identifier !== '' && !isNaN(cost) && cost >= 0,
            };
          });

        resolve(parsed);
      } catch {
        reject(new Error('No se pudo leer el archivo. Verificá que sea .xlsx o .csv válido.'));
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsBinaryString(file);
  });
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      ok ? 'bg-[#16603D]/10 text-[#16603D]' : 'bg-red-500/10 text-red-400'
    }`}>
      {ok ? '✔' : '✘'} {label}
    </span>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Onboarding() {
  const { user, isLoading } = useAuth();
  const router  = useRouter();
  const { call } = useApi();

  const [step,        setStep]        = useState<Step>('choose');
  const [dragging,    setDragging]    = useState(false);
  const [fileName,    setFileName]    = useState('');
  const [parsed,      setParsed]      = useState<ParsedRow[]>([]);
  const [parseError,  setParseError]  = useState('');
  const [importing,   setImporting]   = useState(false);
  const [result,      setResult]      = useState<ImportResult | null>(null);

  // Manual fallback
  const [products,    setProducts]    = useState<Product[]>([]);
  const [costs,       setCosts]       = useState<Record<number, string>>({});
  const [saving,      setSaving]      = useState<Record<number, boolean>>({});
  const [saved,       setSaved]       = useState<Record<number, boolean>>({});
  const [manualErrors, setManualErrors] = useState<Record<number, string>>({});
  const [fetching,    setFetching]    = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  /* ── File handling ──────────────────────────────────────────────────── */

  const handleFile = useCallback(async (file: File) => {
    setParseError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      setParseError('Formato no soportado. Usá .xlsx o .csv');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError('El archivo supera los 10MB');
      return;
    }

    try {
      const rows = await parseFile(file);
      if (rows.length === 0) { setParseError('El archivo no tiene filas válidas.'); return; }
      setFileName(file.name);
      setParsed(rows);
      setStep('preview');
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  /* ── Import ─────────────────────────────────────────────────────────── */

  const handleImport = async () => {
    const validRows = parsed.filter((r) => r.valid);
    if (validRows.length === 0) { setParseError('No hay filas válidas para importar.'); return; }

    setImporting(true);
    const res = await call<ImportResult>('/api/v1/products/costs/import', {
      method: 'POST',
      body: JSON.stringify(
        validRows.map((r) => ({ identifier: r.identifier, cost: r.cost }))
      ),
    });
    setImporting(false);

    if (res) {
      setResult(res);
      setStep('result');
    } else {
      setParseError('Error al importar. Intentá de nuevo.');
    }
  };

  /* ── Manual fallback ─────────────────────────────────────────────────── */

  const loadManual = async () => {
    setFetching(true);
    const data = await call<{ products: Product[] }>('/api/v1/products/without-cost', { method: 'GET' });
    if (data) setProducts(data.products);
    setFetching(false);
    setStep('manual');
  };

  const handleSaveCost = async (product: Product) => {
    const cost = parseFloat(costs[product.id]);
    if (isNaN(cost) || cost < 0) {
      setManualErrors((e) => ({ ...e, [product.id]: 'Ingresá un costo válido' }));
      return;
    }
    setManualErrors((e) => ({ ...e, [product.id]: '' }));
    setSaving((s) => ({ ...s, [product.id]: true }));
    const ok = await call(`/api/v1/products/${product.id}/cost`, {
      method: 'PUT',
      body: JSON.stringify({ cost }),
    });
    setSaving((s) => ({ ...s, [product.id]: false }));
    if (ok) setSaved((s) => ({ ...s, [product.id]: true }));
    else setManualErrors((e) => ({ ...e, [product.id]: 'No se pudo guardar.' }));
  };

  const allManualSaved = products.length > 0 && products.every((p) => saved[p.id]);

  const goToDashboard = async () => {
    await call('/api/v1/auth/complete-onboarding', { method: 'POST' });
    router.push('/dashboard');
  };

  /* ── Loading ─────────────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#000000]">
        <div className="spinner border-[#16603D] h-10 w-10" />
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-slate-900 dark:text-white transition-colors">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#000000]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <LetoLogo size={32} />
        </div>
      </header>

      {/* Progress bar */}
      {step !== 'manual' && (
        <div className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#000000]">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2">
            {STEP_ORDER.map((s, i) => {
              const currentIdx = STEP_ORDER.indexOf(step as Step) ?? 0;
              const done    = i < currentIdx;
              const active  = i === currentIdx;
              return (
                <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all ${
                      done   ? 'bg-[#16603D] text-white'
                      : active ? 'bg-[#16603D] text-white ring-4 ring-[#16603D]/20'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      active ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                    }`}>{STEP_LABELS[s]}</span>
                  </div>
                  {i < STEP_ORDER.length - 1 && (
                    <div className={`flex-1 h-px mx-2 transition-all ${done ? 'bg-[#16603D]' : 'bg-slate-200 dark:bg-white/10'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-12">

        {/* ── STEP: choose (drag & drop) ──────────────────────────── */}
        {step === 'choose' && (
          <div className="space-y-8">
            <div>
              <span className="inline-block text-xs font-bold tracking-widest text-[#16603D] uppercase mb-3">
                Paso 1 de 1
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                Cargá tus costos reales
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                LETO necesita el costo de cada producto para calcular tu margen real.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
                dragging
                  ? 'border-[#16603D] bg-[#16603D]/5 scale-[1.01]'
                  : 'border-slate-300 dark:border-white/20 hover:border-[#16603D] hover:bg-[#16603D]/5'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={onInputChange}
              />

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors ${
                dragging ? 'bg-[#16603D]/20' : 'bg-slate-100 dark:bg-white/5'
              }`}>
                <svg className={`w-8 h-8 ${dragging ? 'text-[#16603D]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <p className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                {dragging ? 'Soltá el archivo acá' : 'Arrastrá tu archivo Excel o CSV acá'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                o hacé click para seleccionarlo
              </p>

              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#16603D] hover:bg-[#0f4a2d] text-black hover:text-white font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Examinar archivo
              </button>
            </div>

            {/* Format guide */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 p-5 bg-slate-50 dark:bg-[#101215]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                El archivo debe tener dos columnas
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#000000] border-b border-slate-200 dark:border-white/10">
                      <th className="px-4 py-2 text-left font-bold text-slate-600 dark:text-slate-300">SKU o nombre del producto</th>
                      <th className="px-4 py-2 text-left font-bold text-slate-600 dark:text-slate-300">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Zapatilla Running X', '78.00'],
                      ['Remera Básica', '22.50'],
                      ['ZAP-001', '65.00'],
                    ].map(([name, cost]) => (
                      <tr key={name} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{name}</td>
                        <td className="px-4 py-2 text-[#16603D] font-semibold">{cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Formatos aceptados: <strong>.xlsx</strong> · <strong>.csv</strong> — Máx. 10MB
              </p>
            </div>

            {/* Error */}
            {parseError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {parseError}
              </div>
            )}

            {/* Legal acceptance */}
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 leading-relaxed">
              Al continuar, aceptás los{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[#16603D] transition-colors">
                Términos de Servicio
              </a>{' '}
              y reconocés haber leído la{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[#16603D] transition-colors">
                Política de Privacidad
              </a>.
            </p>

            {/* Manual fallback */}
            <div className="text-center pt-2">
              <button
                onClick={loadManual}
                className="text-sm text-slate-400 hover:text-[#16603D] transition-colors underline underline-offset-4"
              >
                Preferís cargar los costos uno por uno →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: preview ───────────────────────────────────────── */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <span className="inline-block text-xs font-bold tracking-widest text-[#16603D] uppercase mb-3">
                Vista previa
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                Revisá los datos antes de importar
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Archivo: <strong className="text-slate-700 dark:text-slate-200">{fileName}</strong>
                {' · '}{parsed.length} filas · {parsed.filter((r) => r.valid).length} válidas
              </p>
            </div>

            {/* Preview table — first 10 rows */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#101215] border-b border-slate-200 dark:border-white/10">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">#</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">SKU / Nombre</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Costo</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 10).map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-slate-100 dark:border-white/5 last:border-0 ${
                        !row.valid ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{row.identifier || <em className="text-slate-400">vacío</em>}</td>
                      <td className="px-5 py-3">
                        {row.valid
                          ? <span className="font-semibold text-[#16603D]">${row.cost.toFixed(2)}</span>
                          : <span className="text-red-400">{row.raw_cost || '—'}</span>
                        }
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge ok={row.valid} label={row.valid ? 'Válido' : 'Inválido'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsed.length > 10 && (
              <p className="text-xs text-slate-400 text-center">
                Mostrando las primeras 10 de {parsed.length} filas
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total filas',   value: parsed.length,                           color: 'text-slate-900 dark:text-white' },
                { label: 'Válidas',       value: parsed.filter((r) => r.valid).length,    color: 'text-[#16603D]' },
                { label: 'Con errores',   value: parsed.filter((r) => !r.valid).length,   color: 'text-red-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-200 dark:border-white/10 p-4 text-center bg-white dark:bg-[#101215]">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {parseError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {parseError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep('choose'); setParsed([]); setFileName(''); setParseError(''); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/20 text-slate-600 dark:text-slate-300 font-semibold hover:border-[#16603D] transition-colors"
              >
                ← Cambiar archivo
              </button>
              <button
                onClick={handleImport}
                disabled={importing || parsed.filter((r) => r.valid).length === 0}
                className="flex-1 py-3 rounded-xl bg-[#16603D] hover:bg-[#0f4a2d] text-black hover:text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {importing ? (
                  <><div className="spinner border-current h-4 w-4" /> Importando…</>
                ) : (
                  <>Confirmar y calcular márgenes</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: result ────────────────────────────────────────── */}
        {step === 'result' && result && (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#16603D]/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-[#16603D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                ¡Costos importados!
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                LETO ya está calculando tus márgenes reales.
              </p>
            </div>

            {/* Result stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#16603D]/30 bg-[#16603D]/5 p-5 text-center">
                <p className="text-4xl font-black text-[#16603D]">{result.matched}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Productos actualizados</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#101215] p-5 text-center">
                <p className="text-4xl font-black text-slate-900 dark:text-white">{result.not_found.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">No encontrados</p>
              </div>
            </div>

            {/* Not found list */}
            {result.not_found.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-sm font-bold text-red-400 mb-3">
                  Estos productos no se encontraron en tu catálogo:
                </p>
                <ul className="space-y-1">
                  {result.not_found.slice(0, 10).map((name) => (
                    <li key={name} className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="text-red-400">·</span> {name}
                    </li>
                  ))}
                  {result.not_found.length > 10 && (
                    <li className="text-xs text-slate-400">…y {result.not_found.length - 10} más</li>
                  )}
                </ul>
                <p className="text-xs text-slate-400 mt-3">
                  Verificá que el nombre o SKU coincida exactamente con el de TiendaNube.
                </p>
              </div>
            )}

            <button
              onClick={goToDashboard}
              className="w-full py-4 rounded-xl bg-[#16603D] hover:bg-[#0f4a2d] text-black hover:text-white font-bold text-base transition-colors"
            >
              Ver mi análisis completo →
            </button>

            {result.not_found.length > 0 && (
              <button
                onClick={loadManual}
                className="w-full text-center text-sm text-slate-400 hover:text-[#16603D] transition-colors"
              >
                Cargar los faltantes uno por uno
              </button>
            )}
          </div>
        )}

        {/* ── STEP: manual (fallback) ──────────────────────────────── */}
        {step === 'manual' && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep('choose')}
                className="text-sm text-slate-400 hover:text-[#16603D] transition-colors mb-4 flex items-center gap-1"
              >
                ← Volver a importar archivo
              </button>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                Ingresá el costo de tus productos
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Sin el costo no podemos calcular tu margen real.
              </p>
            </div>

            {fetching ? (
              <div className="text-center py-12">
                <div className="spinner border-[#16603D] mx-auto mb-4 h-8 w-8" />
                <p className="text-slate-400 text-sm">Cargando productos…</p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-[#16603D]/30 bg-[#16603D]/5 p-10 text-center">
                <svg className="w-12 h-12 text-[#16603D] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-bold text-slate-900 dark:text-white mb-1">¡Todos los productos tienen costo!</p>
                <p className="text-sm text-slate-400 mb-6">Ya podés ver tu análisis completo.</p>
                <button onClick={goToDashboard} className="px-6 py-3 rounded-lg bg-[#16603D] hover:bg-[#0f4a2d] text-black hover:text-white font-bold transition-colors">
                  Ir al dashboard →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#101215] p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-sm text-slate-400">{product.sku && `SKU: ${product.sku} · `}Precio: ${product.price.toFixed(2)}</p>
                      </div>

                      {saved[product.id] ? (
                        <div className="flex items-center gap-2 text-[#16603D] font-semibold text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Guardado
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={costs[product.id] ?? ''}
                              onChange={(e) => setCosts((c) => ({ ...c, [product.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCost(product)}
                              className="pl-7 pr-3 py-2.5 border border-slate-300 dark:border-white/20 rounded-lg bg-white dark:bg-[#000000] text-slate-900 dark:text-white text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#16603D]"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveCost(product)}
                            disabled={saving[product.id]}
                            className="px-4 py-2.5 rounded-lg bg-[#16603D] hover:bg-[#0f4a2d] text-black hover:text-white text-sm font-semibold transition-colors disabled:opacity-40"
                          >
                            {saving[product.id] ? <div className="spinner border-current w-4 h-4" /> : 'Guardar'}
                          </button>
                        </div>
                      )}
                    </div>
                    {manualErrors[product.id] && (
                      <p className="text-xs text-red-400 mt-2">{manualErrors[product.id]}</p>
                    )}
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    onClick={goToDashboard}
                    disabled={!allManualSaved}
                    className={`w-full py-4 rounded-xl font-bold text-base transition-colors ${
                      allManualSaved
                        ? 'bg-[#16603D] hover:bg-[#0f4a2d] text-black hover:text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {allManualSaved
                      ? 'Ver mi análisis completo →'
                      : `Completá ${products.filter((p) => !saved[p.id]).length} costos restantes`
                    }
                  </button>
                  <button onClick={goToDashboard} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-3 transition-colors">
                    Omitir por ahora
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
