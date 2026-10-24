import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerActions,
  actions,
  footer,
  noPadding = false,
  className,
  children,
  ...props
}) => {
  const resolvedActions = actions || headerActions;

  return (
    <div
      className={cn(
        "bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg",
        className
      )}
      {...props}
    >
      {(title || resolvedActions) && (
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-[#141c2e]/60">
          <div>
            {title && (
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {resolvedActions && <div className="flex items-center gap-2">{resolvedActions}</div>}
        </div>
      )}

      <div className={cn(noPadding ? "" : "p-6")}>{children}</div>

      {footer && (
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0d131f]/60 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
