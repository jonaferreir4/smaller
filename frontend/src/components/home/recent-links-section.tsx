import { Link } from "react-router-dom";
import type { ShortenedUrlResponse } from "../../types/api";
import { Copy, QrCode, BarChart2, MousePointerClick } from "lucide-react";

interface RecentLinksSectionProps {
  recentLinks: ShortenedUrlResponse[];
  onCopy: (url: string) => void;
  onOpenQr: (url: string, code?: string) => void;
}

export function RecentLinksSection({
  recentLinks,
  onCopy,
  onOpenQr,
}: RecentLinksSectionProps) {
  if (recentLinks.length === 0) return null;

  return (
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
              <p
                className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md font-mono"
                title={item.originalUrl}
              >
                {item.originalUrl}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onCopy(item.shortUrl)}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copiar link"
                aria-label={`Copiar link ${item.code}`}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onOpenQr(item.shortUrl, item.code)}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="QR Code"
                aria-label={`Abrir QR code do link ${item.code}`}
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <Link
                to={`/dashboard?url=${encodeURIComponent(item.shortUrl)}`}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Ver analytics"
                aria-label={`Ver analytics do link ${item.code}`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

