import { useState, useMemo } from "react";
import type { ShortenedUrlResponse } from "../../types/api";
import {
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Trash2,
  BarChart2,
  Search,
  MousePointerClick,
} from "lucide-react";

interface UserLinksTableProps {
  links: ShortenedUrlResponse[];
  isLoading: boolean;
  onSelectLink: (url: string) => void;
  onCopy: (url: string) => void;
  isCopied: boolean;
  onOpenQr: (url: string, code?: string) => void;
  onDeleteLink: (code: string) => Promise<boolean>;
}

export function UserLinksTable({
  links,
  isLoading,
  onSelectLink,
  onCopy,
  onOpenQr,
  onDeleteLink,
}: UserLinksTableProps) {
  const [filter, setFilter] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const filteredLinks = useMemo(() => {
    if (!filter.trim()) return links;
    const term = filter.toLowerCase();
    return links.filter(
      (l) => l.code.toLowerCase().includes(term) || l.originalUrl.toLowerCase().includes(term)
    );
  }, [links, filter]);

  const handleCopy = (url: string, code: string) => {
    onCopy(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o link /${code}?`)) return;
    setDeletingCode(code);
    try {
      await onDeleteLink(code);
    } finally {
      setDeletingCode(null);
    }
  };

  return (
    <div className="surface-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Meus Links Criados
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {links.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Selecione um link para visualizar métricas detalhadas de acessos
          </p>
        </div>

        {links.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por slug ou URL..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Você ainda não encurtou nenhum link nesta conta.</p>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500">Nenhum link encontrado para o filtro "{filter}".</div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden">
          {filteredLinks.map((link) => {
            const isItemCopied = copiedCode === link.code;
            const isDeleting = deletingCode === link.code;

            return (
              <div
                key={link.code}
                className="p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 surface-card-hover"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectLink(link.shortUrl)}
                      className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                      title="Ver métricas deste link"
                    >
                      /{link.code}
                      <BarChart2 className="w-3.5 h-3.5 text-zinc-400 hover:text-emerald-500 shrink-0" />
                    </button>
                    {link.isCustom && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        custom
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" /> {link.clicks} cliques
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-lg font-mono" title={link.originalUrl}>
                    {link.originalUrl}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectLink(link.shortUrl)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Carregar gráficos de analytics"
                  >
                    <BarChart2 className="w-3.5 h-3.5" /> Analytics
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(link.shortUrl, link.code)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title={isItemCopied ? "Copiado!" : "Copiar link"}
                    aria-label={`Copiar link ${link.code}`}
                  >
                    {isItemCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenQr(link.shortUrl, link.code)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="QR Code"
                    aria-label={`QR Code do link ${link.code}`}
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Abrir destino"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDelete(link.code)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-50"
                    title="Excluir link"
                    aria-label={`Excluir link ${link.code}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
