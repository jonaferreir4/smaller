import { useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, X, Lock } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean>;
  userEmail: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Por favor, digite sua senha para confirmar.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const success = await onConfirm(password);
      if (!success) {
        setError("Não foi possível excluir a conta. Verifique sua senha e tente novamente.");
      }
    } catch {
      setError("Ocorreu um erro inesperado ao tentar excluir sua conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setPassword("");
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="w-full max-w-md surface-card rounded-2xl border border-red-200 dark:border-red-900/50 shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-account-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Excluir Conta
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Esta ação é permanente e irreversível</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 space-y-1.5">
          <p className="font-semibold">Atenção ao excluir a conta ({userEmail}):</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-700 dark:text-red-400">
            <li>Todos os seus links encurtados deixarão de funcionar de imediato.</li>
            <li>Suas chaves de API ativas serão revogadas.</li>
            <li>Todo o histórico de cliques e métricas será apagado.</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="confirm-delete-password"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Confirme com sua senha atual
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="confirm-delete-password"
                type="password"
                required
                autoFocus
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isLoading ? "Excluindo..." : "Excluir Definitivamente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

