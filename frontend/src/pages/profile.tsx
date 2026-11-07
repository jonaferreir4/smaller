import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { useApiKeys } from "../hooks/use-api-keys";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import type { ApiKeyResponse } from "../types/api";
import { ProfileApiKeysTab } from "../components/profile/profile-api-keys-tab";
import { ProfileBillingTab } from "../components/profile/profile-billing-tab";
import { Key, User as UserIcon, CreditCard, Shield } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile, isLoading: isAuthLoading } = useAuth();
  const { keys, fetchKeys, createKey, revokeKey, isLoading: isKeysLoading } = useApiKeys();
  const { isCopied: copiedKey, copy: handleCopyKey } = useCopyToClipboard();

  const [activeTab, setActiveTab] = useState<"account" | "apikeys" | "billing">("account");
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);

  useEffect(() => {
    refreshProfile();
    fetchKeys();
  }, [refreshProfile, fetchKeys]);

  if (isAuthLoading && !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-lg">
          <Shield className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Acesso Restrito</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs max-w-xs">
            Você precisa estar conectado à sua conta para gerenciar seu perfil e chaves de API.
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-medium text-xs transition-colors shadow-xs"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  const initial = user.email.charAt(0).toUpperCase();
  const createdDate = new Date(user.createdAtUtc).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const result = await createKey(newKeyName.trim());
    if (result) {
      setCreatedKey(result);
      setNewKeyName("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Account Header */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 text-xl font-bold font-mono">
            {initial}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user.email}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                Plano {user.plan}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Membro desde <span className="text-zinc-900 dark:text-zinc-300">{createdDate}</span> · Permissão:{" "}
              <span className="text-zinc-900 dark:text-zinc-300 capitalize">{user.role}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
        >
          Gerenciar Plano
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-1">
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "account"
              ? "bg-zinc-200/80 dark:bg-zinc-900 border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Configurações</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("apikeys")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "apikeys"
              ? "bg-zinc-200/80 dark:bg-zinc-900 border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Chaves de API</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "billing"
              ? "bg-zinc-200/80 dark:bg-zinc-900 border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Assinatura & Planos</span>
        </button>
      </div>

      {/* Tab: Account Settings */}
      {activeTab === "account" && (
        <div className="space-y-4">
          <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Dados Cadastrais
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 font-medium mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 font-medium mb-1">Identificador de Usuário (UUID)</label>
                <input
                  type="text"
                  disabled
                  value={user.id}
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Sessões & Segurança
            </h2>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Sessão Web Atual</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Assinatura HMAC-SHA256 validada</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Ativa
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: API Keys */}
      {activeTab === "apikeys" && (
        <ProfileApiKeysTab
          keys={keys}
          isKeysLoading={isKeysLoading}
          newKeyName={newKeyName}
          setNewKeyName={setNewKeyName}
          createdKey={createdKey}
          copiedKey={copiedKey}
          handleCreateKey={handleCreateKey}
          handleCopyKey={handleCopyKey}
          revokeKey={revokeKey}
        />
      )}

      {/* Tab: Billing */}
      {activeTab === "billing" && <ProfileBillingTab />}
    </div>
  );
};

export default ProfilePage;
