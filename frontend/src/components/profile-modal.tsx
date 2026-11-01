import React from "react";
import { useAuth } from "../hooks/use-auth";

interface ProfileModalProps {
  onClose: () => void;
  onOpenKeys: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onOpenKeys }) => {
  const { user } = useAuth();

  if (!user) return null;

  const initial = user.email.charAt(0).toUpperCase();
  const createdDate = new Date(user.createdAtUtc).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Perfil da Conta</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
            {initial}
          </div>
          <div>
            <h3 className="text-base font-bold text-white max-w-[240px] truncate">{user.email}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Plano {user.plan}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="block text-xs font-medium text-slate-400">Total de Links</span>
            <span className="block text-xl font-bold text-white mt-1">{user.totalLinksCreated}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="block text-xs font-medium text-slate-400">Membro Desde</span>
            <span className="block text-xs font-bold text-slate-200 mt-2">{createdDate}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenKeys();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
            </svg>
            <span>Gerenciar Chaves de API</span>
          </button>
        </div>
      </div>
    </div>
  );
};
