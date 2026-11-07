import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SearchInput from "../components/search-input";
import SubmitButton from "../components/button-submit";
import QrModal from "../components/qr-modal";
import { AnalyticsOverview } from "../components/dashboard/analytics-overview";
import { AnalyticsBreakdown } from "../components/dashboard/analytics-breakdown";
import { UserLinksTable } from "../components/dashboard/user-links-table";
import { useUrlInsights } from "../hooks/use-url-insights";
import { useUserLinks } from "../hooks/use-user-links";
import { useAuth } from "../hooks/use-auth";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import { Smartphone, Monitor, Tablet, AlertCircle, Sparkles } from "lucide-react";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [shortUrlInput, setShortUrlInput] = useState("");
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ url: string; code?: string } | null>(null);

  const { isAuthenticated } = useAuth();
  const { analytics, isLoading, error, fetchInsights } = useUrlInsights();
  const { links, isLoading: isLinksLoading, fetchLinks, deleteLink } = useUserLinks();
  const { isCopied, copy } = useCopyToClipboard();

  useEffect(() => {
    document.title = "Analytics & Métricas - Smaller";
    const urlFromQuery = searchParams.get("url");
    if (urlFromQuery) {
      setShortUrlInput(urlFromQuery);
      fetchInsights(urlFromQuery);
    }
  }, [searchParams, fetchInsights]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinks();
    }
  }, [isAuthenticated, fetchLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchInsights(shortUrlInput);
  };

  const handleSelectLink = async (url: string) => {
    setShortUrlInput(url);
    await fetchInsights(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openQr = (url: string, code?: string) => {
    setQrModalData({ url, code });
    setIsQrOpen(true);
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
          <AnalyticsOverview
            analytics={analytics}
            isCopied={isCopied}
            onCopy={copy}
            onOpenQr={() => openQr(analytics.shortUrl, analytics.code)}
            getDeviceIcon={getDeviceIcon}
          />

          <AnalyticsBreakdown
            analytics={analytics}
            getDeviceIcon={getDeviceIcon}
          />
        </div>
      )}

      {/* User Links Section (Logged-In User) */}
      {isAuthenticated ? (
        <UserLinksTable
          links={links}
          isLoading={isLinksLoading}
          onSelectLink={handleSelectLink}
          onCopy={copy}
          isCopied={isCopied}
          onOpenQr={openQr}
          onDeleteLink={deleteLink}
        />
      ) : (
        <div className="surface-card p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Salve e gerencie todos os seus links
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Conecte-se para ter histórico na nuvem, slugs personalizados e chaves de API para desenvolvedores.
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold shrink-0 transition-colors shadow-xs"
          >
            Criar Conta Grátis
          </Link>
        </div>
      )}

      {/* QR Modal */}
      {qrModalData && (
        <QrModal
          isOpen={isQrOpen}
          onClose={() => {
            setIsQrOpen(false);
            setQrModalData(null);
          }}
          url={qrModalData.url}
          code={qrModalData.code}
        />
      )}
    </div>
  );
}
