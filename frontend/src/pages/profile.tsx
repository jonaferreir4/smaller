import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { useApiKeys } from "../hooks/use-api-keys";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import type { ApiKeyResponse } from "../types/api";
import { ProfileAccountTab } from "../components/profile/profile-account-tab";
import { ProfileApiKeysTab } from "../components/profile/profile-api-keys-tab";
import { ProfileBillingTab } from "../components/profile/profile-billing-tab";
import { DeleteAccountModal } from "../components/profile/delete-account-modal";
import { ChangePasswordModal } from "../components/profile/change-password-modal";
import { Key, User as UserIcon, CreditCard, Shield } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, deleteAccount, changePassword, isLoading: isAuthLoading } = useAuth();
  const { keys, fetchKeys, createKey, revokeKey, isLoading: isKeysLoading } = useApiKeys();
  const { isCopied: copiedKey, copy: handleCopyKey } = useCopyToClipboard();

  const [activeTab, setActiveTab] = useState<"account" | "apikeys" | "billing">("account");
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
    year: "numeric",
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

  const handleDeleteAccountConfirm = async (password: string): Promise<boolean> => {
    const success = await deleteAccount(password);
    if (success) {
      setIsDeleteModalOpen(false);
      navigate("/");
    }
    return success;
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
              Membro desde <span className="text-zinc-900 dark:text-zinc-300">{createdDate}</span>
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
        {(
          [
            { id: "account", label: "Configurações", icon: UserIcon },
            { id: "apikeys", label: "Chaves de API", icon: Key },
            { id: "billing", label: "Assinatura & Planos", icon: CreditCard },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === id
                ? "bg-zinc-200/80 dark:bg-zinc-900 border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Account Settings */}
      {activeTab === "account" && (
        <ProfileAccountTab
          user={user}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
          onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        />
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

      {/* Modal: Confirm Delete Account */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccountConfirm}
        userEmail={user.email}
      />

      {/* Modal: Change Password */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={changePassword}
      />
    </div>
  );
};

export default ProfilePage;
