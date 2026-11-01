import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { useApiKeys } from "../hooks/use-api-keys";
import type { ApiKeyResponse } from "../types/api";
import { Key, User as UserIcon, CreditCard, Shield, Copy, Check, Trash2, Plus } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { keys, fetchKeys, createKey, revokeKey, isLoading: isKeysLoading } = useApiKeys();

  const [activeTab, setActiveTab] = useState<"account" | "apikeys" | "billing">("account");
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    refreshProfile();
    fetchKeys();
  }, [refreshProfile, fetchKeys]);

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

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Links Cadastrados
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{user.totalLinksCreated}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">/ 100 links (Free)</span>
          </div>
          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((user.totalLinksCreated / 100) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Chaves de API Ativas
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{keys.length}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">credenciais</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Integradas ao gateway REST</p>
        </div>

        <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Nível de Segurança
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Ótimo</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">· JWT + Rate Limit IP</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Autenticação com HMAC-SHA256</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-zinc-200 dark:border-zinc-800/80 pb-px">
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
        <div className="space-y-4">
          <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Criar Nova Chave de API
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Utilize o header <code className="font-mono text-zinc-800 dark:text-zinc-300">X-API-Key: sk_live_...</code> para autenticar chamadas a partir de seus serviços ou scripts.
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
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
      )}

      {/* Tab: Billing */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Plano Free</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Ativo
              </span>
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">R$ 0</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400"> / vitalício</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-zinc-400">✓</span> Até 100 links criados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-400">✓</span> Slugs customizados até 30 chars
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-400">✓</span> QR Code nativo em PNG
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-400">✓</span> Chaves de API para desenvolvedores
              </li>
            </ul>
          </div>

          <div className="surface-card p-5 rounded-xl border border-zinc-300 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Plano Pro</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold">
                SaaS
              </span>
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">R$ 29</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400"> / mês</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> Links ilimitados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> Domínio personalizado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> Métricas completas de cliques
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> SLA de 99.9% de disponibilidade
              </li>
            </ul>
            <button
              type="button"
              onClick={() => alert("Módulo de checkout será ativado com integração Stripe/MercadoPago.")}
              className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Fazer Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
