import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  color?: "emerald" | "blue" | "indigo" | "amber" | "rose" | "purple" | string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  color,
  trend,
  className,
}) => {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
    blue: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
    indigo: "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30",
    amber: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
    rose: "bg-rose-600/20 text-rose-400 border border-rose-500/30",
    purple: "bg-purple-600/20 text-purple-400 border border-purple-500/30",
  };
  const resolvedIconBg = (color && colorMap[color]) || iconBgColor || "bg-blue-600/20 text-blue-400 border border-blue-500/30";
  return (
    <div
      className={cn(
        "bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-all duration-200 flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-white tracking-tight mt-1">
            {value}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              "w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
              resolvedIconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                "font-semibold flex items-center gap-1",
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.value}</span>
              {trend.label && <span className="text-slate-500 font-normal">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
