import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchInput from "../components/search-input";
import SubmitButton from "../components/button-submit";
import QrModal from "../components/qr-modal";
import { useShortenUrl } from "../hooks/use-shorten-url";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import type { ShortenedUrlResponse } from "../types/api";
import {
  SlidersHorizontal,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  BarChart2,
  MousePointerClick
} from "lucide-react";

const RECENT_LINKS_KEY = "smaller_recent_links";

export default function Home() {
  const [urlInput, setUrlInput] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedQrLink, setSelectedQrLink] = useState<{ url: string; code?: string } | null>(null);

  const [recentLinks, setRecentLinks] = useState<ShortenedUrlResponse[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_LINKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { shortUrl, result, isLoading, error, shortenUrl } = useShortenUrl();
  const { isCopied, copy } = useCopyToClipboard();

  useEffect(() => {
    document.title = "Smaller - Encurtador de URLs";
  }, []);

  useEffect(() => {
    if (result) {
      setRecentLinks((prev) => {
        const filtered = prev.filter((item) => item.code !== result.code);
        const updated = [result, ...filtered].slice(0, 5);
        try {
          localStorage.setItem(RECENT_LINKS_KEY, JSON.stringify(updated));
        } catch {
          // ignore localStorage errors
        }
        return updated;
      });
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await shortenUrl({
      url: urlInput,
      customCode: customCode || undefined,
      expiresAtUtc: expiresAt || undefined,
      maxClicks: maxClicks ? Number(maxClicks) : undefined,
    });
  };

  const openQr = (url: string, code?: string) => {
    setSelectedQrLink({ url, code });
    setIsQrOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-16 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Encurte seus links
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md mx-auto">
          Cole uma URL longa para gerar um link curto com métricas de cliques em tempo real.
        </p>
      </section>

      {/* Main Form Box */}
      <section className="surface-card p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3" id="shorten-form">
          <div className="flex flex-col sm:flex-row gap-2">
            <SearchInput
              id="url-input"
              placeholder="Cole a URL longa aqui (ex: https://exemplo.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onClear={() => setUrlInput("")}
            />
            <SubmitButton id="btn-shorten" isLoading={isLoading}>
              Encurtar
            </SubmitButton>
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Opções avançadas (slug customizado, expiração)</span>
            </button>
          </div>

          {/* Collapsible Advanced Form */}
          {showAdvanced && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-zinc-200 dark:border-zinc-800/80 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">Slug Customizado</label>
                <div className="flex items-center">
                  <span className="px-2 py-2 bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-500 rounded-l-lg border border-r-0 border-zinc-300 dark:border-zinc-800 text-xs">/</span>
                  <input
                    type="text"
                    placeholder="meu-link"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-r-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">Expira em</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">Limite de Cliques</label>
                <input
                  type="number"
                  min="1"
                  placeholder="ex: 100"
                  value={maxClicks}
                  onChange={(e) => setMaxClicks(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs"
                />
              </div>
            </div>
          )}
        </form>

        {/* Error Notification */}
        {error && (
          <div
            className="p-3 rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
            role="alert"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Result Card */}
        {shortUrl && (
          <div className="p-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Link gerado
              </span>
              <div className="flex items-center gap-2">
                {result?.isCustom && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    custom slug
                  </span>
                )}
                {result?.maxClicks && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    máx: {result.maxClicks} cliques
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="short-url-result"
                type="text"
                readOnly
                value={shortUrl}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-xs sm:text-sm focus:outline-none"
              />

              <div className="flex gap-1.5 shrink-0">
                <button
                  id="btn-copy-url"
                  type="button"
                  onClick={() => copy(shortUrl)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? "Copiado" : "Copiar"}
                </button>

                <button
                  id="btn-qr-modal"
                  type="button"
                  onClick={() => openQr(shortUrl, result?.code)}
                  className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR Code
                </button>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
              >
                Abrir link <ExternalLink className="w-3 h-3" />
              </a>
              <Link
                to={`/dashboard?url=${encodeURIComponent(shortUrl)}`}
                className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                <BarChart2 className="w-3 h-3" /> Ver Analytics →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Recent Links Section */}
      {recentLinks.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Links Recentes
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">
              {recentLinks.length} {recentLinks.length === 1 ? "link" : "links"}
            </span>
          </div>

          <div className="surface-card rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800/80 overflow-hidden">
            {recentLinks.map((item) => (
              <div
                key={item.code}
                className="p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 surface-card-hover"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      /{item.code}
                    </span>
                    {item.isCustom && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                        custom
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" /> {item.clicks ?? 0} cliques
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md font-mono" title={item.originalUrl}>
                    {item.originalUrl}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copy(item.shortUrl)}
                    className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Copiar link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openQr(item.shortUrl, item.code)}
                    className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to={`/dashboard?url=${encodeURIComponent(item.shortUrl)}`}
                    className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Ver analytics"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QR Code Modal */}
      {selectedQrLink && (
        <QrModal
          isOpen={isQrOpen}
          onClose={() => {
            setIsQrOpen(false);
            setSelectedQrLink(null);
          }}
          url={selectedQrLink.url}
          code={selectedQrLink.code}
        />
      )}
    </div>
  );
}
