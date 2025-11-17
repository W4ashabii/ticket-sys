"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  id,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-black">
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-black">
          {label}
        </span>
      )}
      <input
        id={id}
        className={cn(
          "rounded-xl border border-black/20 bg-white px-4 py-3 text-base sm:text-base text-black transition-all duration-200 placeholder:text-black/40 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-0 hover:border-black/40 shadow-sm min-h-[44px] touch-manipulation",
          error && "border-red-500 ring-2 ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-black/70">{error}</span>}
    </label>
  );
}

