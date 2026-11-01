import { Download, X } from "lucide-react";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  code?: string;
}

export function QrModal({ isOpen, onClose, url, code }: QrModalProps) {
  if (!isOpen) return null;

  const extractCode = (shortUrl: string) => {
    try {
      const u = new URL(shortUrl);
      return u.pathname.split("/").filter(Boolean).pop() || "";
    } catch {
      return shortUrl;
    }
  };

  const shortCode = code || extractCode(url);
  const qrCodeEndpoint = shortCode ? `/api/links/${shortCode}/qrcode` : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&color=09090b&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl text-center space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">QR Code da URL</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 break-all px-2 font-mono">{url}</p>

        <div className="flex justify-center p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <img
            src={qrCodeEndpoint}
            alt="QR Code da URL Encurtada"
            className="w-44 h-44 rounded-lg bg-white p-2 border border-zinc-200 dark:border-zinc-700"
            loading="lazy"
          />
        </div>

        <div className="pt-2 flex justify-center gap-2">
          <a
            href={qrCodeEndpoint}
            download={`qrcode-${shortCode || "url"}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar PNG
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default QrModal;
