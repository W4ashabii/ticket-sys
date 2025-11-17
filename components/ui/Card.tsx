import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  description?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  footer?: ReactNode;
}

export function Card({
  title,
  description,
  className,
  style,
  children,
  footer,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-modern transition-all duration-300 hover:shadow-modern-lg hover:border-black/20 hover:-translate-y-1",
        className
      )}
      style={style}
    >
      {(title || description) && (
        <div className="mb-4 sm:mb-6 space-y-2 border-b border-black/10 pb-3 sm:pb-4">
          {title && (
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-black">{title}</h3>
          )}
          {description && (
            <p className="text-xs sm:text-sm font-normal text-black/60 leading-relaxed">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-6 border-t border-black/10 pt-4 text-sm">{footer}</div>}
    </div>
  );
}

