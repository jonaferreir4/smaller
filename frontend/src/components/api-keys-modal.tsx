import React, { useState, useEffect } from "react";
import { useApiKeys } from "../hooks/use-api-keys";
import type { ApiKeyResponse } from "../types/api";
import { X, Copy, Check, Trash2, Plus } from "lucide-react";

interface ApiKeysModalProps {
  onClose: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ onClose }) => {
  const { keys, fetchKeys, createKey, revokeKey, isLoading } = useApiKeys();
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const result = await createKey(newKeyName.trim());
    if (result) {
      setCreatedKey(result);
      setNewKeyName("");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 max-h-[85vh] flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Chaves de API</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Autenticação REST via header X-API-Key</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {createdKey && createdKey.secretKey && (
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Chave gerada (não será exibida novamente):
              </span>
              <button
                type="button"
                onClick={() => handleCopy(createdKey.secretKey!)}
                className="px-2.5 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey ? "Copiada" : "Copiar"}
              </button>
            </div>
            <code className="block p-2 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 font-mono text-xs break-all border border-zinc-300 dark:border-zinc-800">
              {createdKey.secretKey}
            </code>
          </div>
        )}

        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nome da chave (ex: CLI Scripts)"
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs font-mono"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Gerar Chave
          </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-zinc-200 dark:divide-zinc-800/80 pr-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 pt-1 font-mono">
            Chaves Ativas ({keys.length})
          </div>
          {keys.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 py-6 text-center font-mono">
              Nenhuma chave de API gerada ainda.
            </p>
          ) : (
            keys.map((k) => (
              <div
                key={k.id}
                className="pt-2 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{k.name}</div>
                  <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    Prefixo: <span className="text-zinc-700 dark:text-zinc-300">{k.keyPrefix}...</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => revokeKey(k.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-300 dark:border-red-900/50 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Revogar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeysModal;
