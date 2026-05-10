import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  footer,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden ${className}`}
    >
      {(title ?? description) && (
        <div className="px-5 pt-5 pb-3">
          {title && (
            <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      )}
      {children && <div className="px-5 pb-5">{children}</div>}
      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
}
