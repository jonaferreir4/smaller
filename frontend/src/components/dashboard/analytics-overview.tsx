import type { ReactNode } from "react";
import type { UrlAnalyticsResponse } from "../../types/api";
import { Globe, QrCode, ExternalLink, Copy, Check } from "lucide-react";

interface AnalyticsOverviewProps {
  analytics: UrlAnalyticsResponse;
  isCopied: boolean;
  onCopy: (url: string) => void;
  onOpenQr: () => void;
  getDeviceIcon: (device: string) => ReactNode;
}

export function AnalyticsOverview({
  analytics,
  isCopied,
  onCopy,
  onOpenQr,
  getDeviceIcon,
}: AnalyticsOverviewProps) {
  const primaryDevice = Object.keys(analytics.topDeviceTypes)[0] || "Desktop";

  return (
    <div className="space-y-6">
      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total de Cliques
          </span>
          <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {analytics.totalClicks}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Acessos confirmados</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Código do Link
          </span>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-200 pt-0.5">
            /{analytics.code}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Slug ativo no sistema</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Dispositivo Principal
          </span>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5 pt-1">
            {getDeviceIcon(primaryDevice)}
            <span>{primaryDevice}</span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Maior volume registrado</span>
        </div>
      </div>

      {/* Destination Details Card */}
      <div className="surface-card p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-2.5">
          <h2 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Detalhes de Redirecionamento
          </h2>
          <button
            type="button"
            onClick={onOpenQr}
            className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-medium border border-zinc-300 dark:border-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" /> QR Code
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-zinc-500 font-mono text-[11px]">URL Original de Destino:</span>
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span
                className="text-zinc-700 dark:text-zinc-300 font-mono text-xs truncate max-w-xs"
                title={analytics.originalUrl}
              >
                {analytics.originalUrl}
              </span>
              <a
                href={analytics.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                title="Abrir destino"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-500 font-mono text-[11px]">URL Encurtada Smaller:</span>
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-zinc-900 dark:text-zinc-200 font-mono font-semibold text-xs truncate">
                {analytics.shortUrl}
              </span>
              <button
                type="button"
                onClick={() => onCopy(analytics.shortUrl)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  isCopied
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950"
                }`}
              >
                {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {isCopied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
