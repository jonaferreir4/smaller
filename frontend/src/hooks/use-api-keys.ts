import { useState, useCallback } from "react";
import { api } from "../services/axios";
import type { ApiKeyResponse } from "../types/api";

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeyResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ApiKeyResponse[]>("/keys");
      setKeys(response.data);
    } catch (err: any) {
      setError("Erro ao carregar chaves de API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createKey = async (name: string): Promise<ApiKeyResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<ApiKeyResponse>("/keys", { name });
      await fetchKeys();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data || "Erro ao criar chave de API.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeKey = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/keys/${id}`);
      await fetchKeys();
      return true;
    } catch {
      setError("Erro ao revogar chave de API.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    keys,
    isLoading,
    error,
    fetchKeys,
    createKey,
    revokeKey
  };
}
