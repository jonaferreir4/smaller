import type { FormEvent } from "react";
import type { ApiKeyResponse } from "../../types/api";
import { Copy, Check, Trash2, Plus } from "lucide-react";

interface ProfileApiKeysTabProps {
  keys: ApiKeyResponse[];
  isKeysLoading: boolean;
  newKeyName: string;
  setNewKeyName: (val: string) => void;
  createdKey: ApiKeyResponse | null;
  copiedKey: boolean;
  handleCreateKey: (e: FormEvent) => void;
  handleCopyKey: (text: string) => void;
  revokeKey: (id: string) => void;
}

export function ProfileApiKeysTab({
  keys,
  isKeysLoading,
  newKeyName,
  setNewKeyName,
  createdKey,
  copiedKey,
  handleCreateKey,
  handleCopyKey,
  revokeKey,
}: ProfileApiKeysTabProps) {
  return (
    <div className="space-y-4">
      <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Criar Nova Chave de API
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Utilize o header{" "}
          <code className="font-mono text-zinc-800 dark:text-zinc-300">
            X-API-Key: sk_live_...
          </code>{" "}
          para autenticar chamadas a partir de seus serviços ou scripts.
        </p>

        {createdKey && createdKey.secretKey && (
          <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Chave gerada (copie agora, ela não será exibida novamente):
              </span>
              <button
                type="button"
                onClick={() => handleCopyKey(createdKey.secretKey!)}
                className="px-2.5 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedKey ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey ? "Copiada" : "Copiar"}
              </button>
            </div>
            <code className="block p-2.5 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 font-mono text-xs break-all border border-zinc-300 dark:border-zinc-800">
              {createdKey.secretKey}
            </code>
          </div>
        )}

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Identificador da chave (ex: Backend Principal)"
            className="w-full sm:flex-1 px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs font-mono"
          />
          <button
            type="submit"
            disabled={isKeysLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Criar Chave
          </button>
        </form>
      </div>

      <div className="surface-card rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800/80">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Chaves Registradas
          </h3>
        </div>

        {keys.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 py-8 text-center font-mono">
            Nenhuma chave de API registrada até o momento.
          </p>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="p-4 flex items-center justify-between gap-4 surface-card-hover">
              <div>
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{k.name}</h4>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Prefixo: <span className="text-zinc-700 dark:text-zinc-300">{k.keyPrefix}...</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => revokeKey(k.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-300 dark:border-red-900/50 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Revogar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
