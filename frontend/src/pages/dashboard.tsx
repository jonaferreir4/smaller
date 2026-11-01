import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchInput from "../components/search-input";
import SubmitButton from "../components/button-submit";
import QrModal from "../components/qr-modal";
import { useUrlInsights } from "../hooks/use-url-insights";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import {
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Calendar,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [shortUrlInput, setShortUrlInput] = useState("");
  const [isQrOpen, setIsQrOpen] = useState(false);
  const { analytics, isLoading, error, fetchInsights } = useUrlInsights();
  const { isCopied, copy } = useCopyToClipboard();

  useEffect(() => {
    document.title = "Analytics & Métricas - Smaller";
    const urlFromQuery = searchParams.get("url");
    if (urlFromQuery) {
      setShortUrlInput(urlFromQuery);
      fetchInsights(urlFromQuery);
    }
  }, [searchParams, fetchInsights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchInsights(shortUrlInput);
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5 text-zinc-400" />;
      case "tablet":
        return <Tablet className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Header Section */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Analytics & Métricas
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
          Consulte estatísticas de cliques em tempo real, origens por dispositivo, navegadores e sistemas operacionais.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="surface-card p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5" id="insights-form">
          <SearchInput
            id="insights-url-input"
            placeholder="Cole o código do link ou a URL encurtada (ex: /blackfriday ou https://smaller.app/AbCdEfG)"
            value={shortUrlInput}
            onChange={(e) => setShortUrlInput(e.target.value)}
            onClear={() => setShortUrlInput("")}
          />
          <SubmitButton id="btn-search-insights" isLoading={isLoading}>
            Consultar
          </SubmitButton>
        </form>

        {error && (
          <div
            className="mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analytics Content */}
      {analytics && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
                {getDeviceIcon(Object.keys(analytics.topDeviceTypes)[0] || "Desktop")}
                <span>{Object.keys(analytics.topDeviceTypes)[0] || "Desktop"}</span>
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
                onClick={() => setIsQrOpen(true)}
                className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-medium border border-zinc-300 dark:border-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" /> QR Code
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 font-mono text-[11px]">URL Original de Destino:</span>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono text-xs truncate max-w-xs" title={analytics.originalUrl}>
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
                    onClick={() => copy(analytics.shortUrl)}
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

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Devices */}
            <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
                <Monitor className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Dispositivos
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.topDeviceTypes).map(([device, count]) => {
                  const percent = Math.round((count / (analytics.totalClicks || 1)) * 100);
                  return (
                    <div key={device} className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          {getDeviceIcon(device)} {device}
                        </span>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-700 dark:bg-zinc-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Browsers */}
            <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
                <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Navegadores
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.topBrowsers).map(([browser, count]) => {
                  const percent = Math.round((count / (analytics.totalClicks || 1)) * 100);
                  return (
                    <div key={browser} className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span>{browser}</span>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-700 dark:bg-zinc-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operating Systems */}
            <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Sistemas Operacionais
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.topOperatingSystems).map(([os, count]) => {
                  const percent = Math.round((count / (analytics.totalClicks || 1)) * 100);
                  return (
                    <div key={os} className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span>{os}</span>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-700 dark:bg-zinc-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QR Code Modal */}
          <QrModal
            isOpen={isQrOpen}
            onClose={() => setIsQrOpen(false)}
            url={analytics.shortUrl}
            code={analytics.code}
          />
        </div>
      )}
    </div>
  );
}
