import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import Logo from "./logo";
import { useAuth } from "../hooks/use-auth";
import { LoginModal } from "./login-modal";
import { ApiKeysModal } from "./api-keys-modal";
import { UserDropdown } from "./user-dropdown";
import ThemeToggle from "./theme-toggle";

export function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showKeysModal, setShowKeysModal] = useState(false);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const navLinks = [
    { name: "Início", path: "/" },
    { name: "Analytics", path: "/dashboard" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" aria-label="Smaller Home" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/50"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <ThemeToggle />

            {isAuthenticated ? (
              <UserDropdown onOpenKeys={() => setShowKeysModal(true)} />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-colors shadow-xs cursor-pointer"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAuthModal && (
        <LoginModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showKeysModal && (
        <ApiKeysModal onClose={() => setShowKeysModal(false)} />
      )}
    </>
  );
}

export default Header;
