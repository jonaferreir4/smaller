import { useState } from "react";
import { api } from "../services/axios";
import type { ShortenUrlRequest, ShortenedUrlResponse } from "../types/api";

export function useShortenUrl() {
  const [result, setResult] = useState<ShortenedUrlResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const shortenUrl = async (payload: ShortenUrlRequest): Promise<boolean> => {
    const trimmed = payload.url.trim();

    if (!trimmed) {
      setError("Por favor, insira uma URL para encurtar.");
      return false;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("Apenas URLs com protocolo http:// ou https:// são suportadas.");
        return false;
      }
    } catch {
      setError("Por favor, insira uma URL válida (ex: https://exemplo.com).");
      return false;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post<ShortenedUrlResponse>("/shorten", {
        url: trimmed,
        customCode: payload.customCode?.trim() || undefined,
        expiresAtUtc: payload.expiresAtUtc ? new Date(payload.expiresAtUtc).toISOString() : undefined,
        maxClicks: payload.maxClicks ? Number(payload.maxClicks) : undefined,
      });
      setResult(response.data);
      return true;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = err.response.data;
        const message =
          typeof data === "string"
            ? data
            : typeof data === "object" && data && "message" in data
            ? String(data.message)
            : "Ocorreu um erro ao encurtar a URL.";
        setError(message);
      } else {
        setError("Não foi possível conectar ao servidor para encurtar a URL.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
    setIsLoading(false);
  };

  return { shortUrl: result?.shortUrl || "", result, isLoading, error, shortenUrl, reset };
}
