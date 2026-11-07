import { Link } from "react-router-dom";
import Logo from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/80 dark:bg-zinc-950/60 py-6 text-zinc-500 text-xs transition-colors">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Smaller Home">
            <Logo size="sm" />
          </Link>
          <span className="text-zinc-500 dark:text-zinc-600 text-[11px]">
            Encurtador de URLs rápido e seguro.
          </span>
        </div>

        <div className="flex items-center gap-6 text-zinc-600 dark:text-zinc-400 text-xs">
          <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Início
          </Link>
          <Link to="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Analytics
          </Link>
          <Link to="/termos" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Termos
          </Link>
          <Link to="/privacidade" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
