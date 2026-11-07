import { SlidersHorizontal } from "lucide-react";

interface AdvancedOptionsProps {
  showAdvanced: boolean;
  setShowAdvanced: (val: boolean) => void;
  customCode: string;
  setCustomCode: (val: string) => void;
  expiresAt: string;
  setExpiresAt: (val: string) => void;
  maxClicks: string;
  setMaxClicks: (val: string) => void;
}

export function AdvancedOptions({
  showAdvanced,
  setShowAdvanced,
  customCode,
  setCustomCode,
  expiresAt,
  setExpiresAt,
  maxClicks,
  setMaxClicks,
}: AdvancedOptionsProps) {
  return (
    <>
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

      {showAdvanced && (
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-zinc-200 dark:border-zinc-800/80 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60">
          <div>
            <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
              Slug Customizado
            </label>
            <div className="flex items-center">
              <span className="px-2 py-2 bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-500 rounded-l-lg border border-r-0 border-zinc-300 dark:border-zinc-800 text-xs">
                /
              </span>
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
            <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
              Expira em
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-2.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-700 dark:text-zinc-400 font-medium mb-1">
              Limite de Cliques
            </label>
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
    </>
  );
}
