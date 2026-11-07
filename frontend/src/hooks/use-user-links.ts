import { useState, useCallback } from "react";
import { api } from "../services/axios";
import type { ShortenedUrlResponse } from "../types/api";

export function useUserLinks() {
  const [links, setLinks] = useState<ShortenedUrlResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ShortenedUrlResponse[]>("/links");
      setLinks(response.data);
    } catch {
      setError("Não foi possível carregar seus links.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteLink = useCallback(async (code: string): Promise<boolean> => {
    try {
      await api.delete(`/links/${code}`);
      setLinks((prev) => prev.filter((l) => l.code !== code));
      return true;
    } catch {
      return false;
    }
  }, []);

  return { links, isLoading, error, fetchLinks, deleteLink };
}
