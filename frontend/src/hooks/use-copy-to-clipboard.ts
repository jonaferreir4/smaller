import { useState, useCallback } from "react";

function fallbackCopyText(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Evita scroll e esconde o elemento sem display:none (necessário para execCommand funcionar)
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  textArea.setAttribute("readonly", "");

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  try {
    const successful = document.execCommand("copy");
    return successful;
  } catch (err) {
    console.error("Falha ao copiar com execCommand:", err);
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}

export function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let success = false;

      // 1. Tenta a API assíncrona do Clipboard (disponível em contextos seguros: HTTPS ou localhost)
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        try {
          await navigator.clipboard.writeText(text);
          success = true;
        } catch {
          // Em caso de falha de permissão no navegador, recorre ao fallback
          success = fallbackCopyText(text);
        }
      } else {
        // 2. Fallback síncrono via execCommand para contextos HTTP não-seguros (ex: http://short.local)
        success = fallbackCopyText(text);
      }

      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
        return true;
      }

      setIsCopied(false);
      return false;
    },
    [timeout]
  );

  return { isCopied, copy };
}
