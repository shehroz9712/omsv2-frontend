import React from "react";
import { cn } from "@/lib/utils";

export interface FilterBarProps {
  search?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceholder?: string;
  placeholder?: string;
  children?: React.ReactNode;
  rightActions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Search records...",
  placeholder,
  children,
  rightActions,
  className,
}) => {
  const resolvedSearch = searchValue !== undefined ? searchValue : search || "";
  const resolvedPlaceholder = placeholder || searchPlaceholder;
  return (
    <div
      className={cn(
        "p-4 bg-[#111827] border border-slate-800 rounded-xl mb-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm",
        className
      )}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={resolvedSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.()}
              placeholder={resolvedPlaceholder}
              className="w-full bg-[#161f33] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
          </div>
        )}
        {children}
      </div>

      {rightActions && (
        <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
          {rightActions}
        </div>
      )}
    </div>
  );
};
