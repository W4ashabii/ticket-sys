"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white border border-black rounded-xl hover:bg-black/90 hover:shadow-modern-lg focus-visible:ring-black active:scale-[0.98]",
  secondary:
    "bg-white text-black border border-black/20 rounded-xl hover:bg-black hover:text-white hover:border-black hover:shadow-modern-lg focus-visible:ring-black active:scale-[0.98]",
  ghost:
    "bg-transparent text-black border border-transparent rounded-xl hover:bg-black/5 hover:border-black/20 focus-visible:ring-black active:scale-[0.98]",
};

export function Button({
  children,
  className,
  variant = "primary",
  disabled,
  loading = false,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-5 sm:px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px] touch-manipulation",
        variantStyles[variant],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

