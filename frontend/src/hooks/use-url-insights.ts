import { useState, useCallback } from "react";
import { api } from "../services/axios";
import type { UrlAnalyticsResponse } from "../types/api";

export function useUrlInsights() {
  const [analytics, setAnalytics] = useState<UrlAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInsights = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Por favor, insira o código ou a URL encurtada.");
      return;
    }

    let code = trimmed;
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const urlObj = new URL(trimmed);
        code = urlObj.pathname.split("/").filter(Boolean).pop() || trimmed;
      }
    } catch {
      // Se não for URL parseável, usamos o próprio texto como código
    }

    setIsLoading(true);
    setError("");
    setAnalytics(null);

    try {
      const response = await api.get<UrlAnalyticsResponse>(`/links/${code}/analytics`);
      setAnalytics(response.data);
    } catch {
      setError("Não foi possível encontrar estatísticas para esta URL. Verifique o código informado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analytics, insights: analytics ? { clicks: analytics.totalClicks, originalUrl: analytics.originalUrl, shortUrl: analytics.shortUrl, createdOnUtc: "" } : null, isLoading, error, fetchInsights };
}
