import React, { createContext, useState, useEffect, useCallback } from "react";
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
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      setUser(response.data);
      setError(null);
    } catch {
      localStorage.removeItem("smaller_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    }
  }, [token, fetchProfile]);

  const login = async (payload: LoginRequest): Promise<boolean> => {
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
  };

  const register = async (payload: RegisterRequest): Promise<boolean> => {
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
  };

  const logout = () => {
    localStorage.removeItem("smaller_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshProfile: () => fetchProfile()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
