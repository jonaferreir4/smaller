import type { UserProfileResponse } from "../../types/api";
import { AlertTriangle, ShieldCheck, KeyRound } from "lucide-react";

interface ProfileAccountTabProps {
  user: UserProfileResponse;
  onOpenDeleteModal: () => void;
  onOpenPasswordModal: () => void;
}

export function ProfileAccountTab({
  user,
  onOpenDeleteModal,
  onOpenPasswordModal,
}: ProfileAccountTabProps) {
  return (
    <div className="space-y-5">
      {/* Dados Cadastrais */}
      <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Dados Cadastrais
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-500 dark:text-zinc-400 font-medium mb-1">
              E-mail Cadastrado
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 font-mono text-xs cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-zinc-500 dark:text-zinc-400 font-medium mb-1">
              Total de Links Criados
            </label>
            <input
              type="text"
              disabled
              value={`${user.totalLinksCreated} link${user.totalLinksCreated === 1 ? "" : "s"}`}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 font-mono text-xs cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Sessões & Segurança */}
      <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Sessões & Segurança
        </h2>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Sessão Web Atual</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Conectado com segurança neste navegador</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              Ativa
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <KeyRound className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Senha de Acesso</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Proteja sua conta alterando sua senha periodicamente</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPasswordModal}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              Alterar Senha
            </button>
          </div>
        </div>
      </div>

      {/* Zona de Perigo (LGPD - Direito ao Esquecimento) */}
      <div className="p-5 rounded-xl border border-red-200 dark:border-red-950/80 bg-red-50/50 dark:bg-red-950/15 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Zona de Perigo
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md">
              Ao excluir sua conta, todos os seus dados pessoais, links encurtados e chaves de API associados serão apagados permanentemente.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenDeleteModal}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  );
}

