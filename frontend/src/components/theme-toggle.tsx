import React, { useState, useRef, useEffect } from "react";
import { useTheme, type Theme } from "../hooks/use-theme";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Claro", icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { value: "dark", label: "Escuro", icon: <Moon className="w-3.5 h-3.5 text-zinc-400" /> },
    { value: "system", label: "Sistema", icon: <Laptop className="w-3.5 h-3.5 text-zinc-500" /> },
  ];

  const currentIcon = () => {
    if (theme === "system") {
      return <Laptop className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />;
    }
    return resolvedTheme === "dark" ? (
      <Moon className="w-4 h-4 text-zinc-400" />
    ) : (
      <Sun className="w-4 h-4 text-amber-600" />
    );
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        id="theme-toggle-btn"
        aria-label="Alterar tema"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 transition-colors cursor-pointer"
      >
        {currentIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-xl p-1 z-50 text-xs animate-in fade-in duration-100">
          {options.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {opt.icon}
                  <span className="font-medium">{opt.label}</span>
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
