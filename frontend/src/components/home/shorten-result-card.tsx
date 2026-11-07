import { Link } from "react-router-dom";
import type { ShortenedUrlResponse } from "../../types/api";
import { Check, Copy, QrCode, ExternalLink, BarChart2 } from "lucide-react";

interface ShortenResultCardProps {
  shortUrl: string;
  result: ShortenedUrlResponse | null;
  isCopied: boolean;
  onCopy: (url: string) => void;
  onOpenQr: (url: string, code?: string) => void;
}

export function ShortenResultCard({
  shortUrl,
  result,
  isCopied,
  onCopy,
  onOpenQr,
}: ShortenResultCardProps) {
  return (
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
            onClick={() => onCopy(shortUrl)}
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
            onClick={() => onOpenQr(shortUrl, result?.code)}
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
  );
}

