import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { api } from "../services/axios";
import type { LoginRequest, RegisterRequest, AuthResponse, UserProfileResponse } from "../types/api";

interface AuthContextType {
  user: UserProfileResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<boolean>;
  register: (payload: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  deleteAccount: (password: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("smaller_token"));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (authToken?: string) => {
    const activeToken = authToken ?? localStorage.getItem("smaller_token");
    if (!activeToken) {
      setUser(null);
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get<UserProfileResponse>("/auth/me", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setUser(response.data);
      setError(null);
    } catch (err: unknown) {
      // Apenas revoga a sessão se for erro 401 (token expirado ou inválido)
      // Não desconecta em caso de 429 (rate limit) ou instabilidade temporária
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("smaller_token");
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hidrata a sessão apenas na montagem inicial a partir do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("smaller_token");
    if (stored) {
      fetchProfile(stored);
    }
  }, [fetchProfile]);

  const login = useCallback(
    async (payload: LoginRequest): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.post<AuthResponse>("/auth/login", payload);
        const newToken = response.data.token;
        localStorage.setItem("smaller_token", newToken);
        setToken(newToken);
        await fetchProfile(newToken);
        return true;
      } catch (err: unknown) {
        let msg = "Falha ao realizar login.";
        if (axios.isAxiosError(err) && err.response?.data) {
          msg = typeof err.response.data === "string" ? err.response.data : "Credenciais inválidas.";
        }
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile]
  );

  const register = useCallback(
    async (payload: RegisterRequest): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.post<AuthResponse>("/auth/register", payload);
        const newToken = response.data.token;
        localStorage.setItem("smaller_token", newToken);
        setToken(newToken);
        await fetchProfile(newToken);
        return true;
      } catch (err: unknown) {
        let msg = "Falha ao realizar cadastro.";
        if (axios.isAxiosError(err) && err.response?.data) {
          msg = typeof err.response.data === "string" ? err.response.data : "Erro ao criar conta.";
        }
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("smaller_token");
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const deleteAccount = useCallback(async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const activeToken = localStorage.getItem("smaller_token");
      await api.delete("/auth/me", {
        data: { password },
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : undefined,
      });
      logout();
      return true;
    } catch (err: unknown) {
      let msg = "Falha ao excluir a conta.";
      if (axios.isAxiosError(err) && err.response?.data) {
        msg = typeof err.response.data === "string" ? err.response.data : "Senha incorreta.";
      }
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      deleteAccount,
    }),
    [user, token, isLoading, error, login, register, logout, refreshProfile, deleteAccount]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
