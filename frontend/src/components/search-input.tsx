import React from "react";
import { cn } from "../lib/utils";
import { Link2, X } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  containerClassName?: string;
}

export function SearchInput({
  className,
  containerClassName,
  value,
  onChange,
  onClear,
  placeholder = "Cole a URL longa aqui (ex: https://exemplo.com/pagina)",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center w-full", containerClassName)}>
      <div className="absolute left-3.5 pointer-events-none flex items-center justify-center">
        <Link2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
      </div>

      <input
        type="url"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        className={cn(
          "w-full pl-10 pr-10 py-3 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-300/80 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm shadow-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-mono",
          className
        )}
        {...props}
      />

      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Limpar campo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
