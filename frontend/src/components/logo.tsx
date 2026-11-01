import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textMap = {
    sm: "text-sm font-bold tracking-tight",
    md: "text-base font-bold tracking-tight",
    lg: "text-xl font-bold tracking-tight",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <svg
        className={cn(
          sizeMap[size],
          "shrink-0 transition-transform duration-200 hover:scale-105 cursor-pointer drop-shadow-sm"
        )}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="smallerBgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="45%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id="smallerBorderGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="smallerTopLink" x1="25" y1="26" x2="70" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D4D4D8" />
          </linearGradient>
          <linearGradient id="smallerBottomLink" x1="75" y1="74" x2="30" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A1A1AA" />
            <stop offset="100%" stopColor="#FAFAFA" />
          </linearGradient>
        </defs>

        {/* Base Squircle Container */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="26"
          fill="url(#smallerBgGrad)"
          stroke="url(#smallerBorderGrad)"
          strokeWidth="1.5"
        />

        {/* Top Link forming upper part of S */}
        <path
          d="M 65 28 H 46 C 35 28 26 37 26 48 C 26 53.5 29.5 58 35.5 60.5 L 48 62.5"
          stroke="url(#smallerTopLink)"
          strokeWidth="7.5"
          strokeLinecap="round"
        />

        {/* Bottom Link forming lower part of S */}
        <path
          d="M 35 72 H 54 C 65 72 74 63 74 52 C 74 46.5 70.5 42 64.5 39.5 L 52 37.5"
          stroke="url(#smallerBottomLink)"
          strokeWidth="7.5"
          strokeLinecap="round"
        />

        {/* Compression Center Pin */}
        <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
      </svg>

      {showText && (
        <span className={cn("text-zinc-900 dark:text-zinc-100 flex items-center gap-0.5", textMap[size])}>
          Smaller
          <span className="w-1 h-1 rounded-full bg-zinc-400 ml-0.5 self-end mb-1" />
        </span>
      )}
    </div>
  );
}

export default Logo;
