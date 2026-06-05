'use client';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  title   = 'No se pudo cargar',
  message = 'Ocurrió un error al conectar con el servidor.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#16603D] hover:bg-[#0f4a2d] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Reintentar
        </button>
      )}
    </div>
  );
}
