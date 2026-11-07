import { useState, useEffect } from "react";
import SearchInput from "../components/search-input";
import SubmitButton from "../components/button-submit";
import QrModal from "../components/qr-modal";
import { AdvancedOptions } from "../components/home/advanced-options";
import { ShortenResultCard } from "../components/home/shorten-result-card";
import { RecentLinksSection } from "../components/home/recent-links-section";
import { useShortenUrl } from "../hooks/use-shorten-url";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import type { ShortenedUrlResponse } from "../types/api";

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
    document.title = "Smaller - Encurtador de URLs Rápido e Seguro";
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
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 space-y-6">
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

          <AdvancedOptions
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            customCode={customCode}
            setCustomCode={setCustomCode}
            expiresAt={expiresAt}
            setExpiresAt={setExpiresAt}
            maxClicks={maxClicks}
            setMaxClicks={setMaxClicks}
          />
        </form>

        {error && (
          <div
            className="p-3 rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
            role="alert"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {shortUrl && (
          <ShortenResultCard
            shortUrl={shortUrl}
            result={result}
            isCopied={isCopied}
            onCopy={copy}
            onOpenQr={openQr}
          />
        )}
      </section>

      {/* Recent Links Section */}
      <RecentLinksSection
        recentLinks={recentLinks}
        onCopy={copy}
        onOpenQr={openQr}
      />

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
