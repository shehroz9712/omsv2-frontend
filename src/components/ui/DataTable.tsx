import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key?: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: (item: T, index: number) => string | number;
  keyExtractor?: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  loading = false,
  emptyMessage = "No records found.",
  className,
  rowKey,
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  const isBusy = isLoading || loading;
  const resolveRowKey = keyExtractor || rowKey || ((item: any, idx: number) => item.id || idx);

  return (
    <div
      className={cn(
        "w-full overflow-x-auto border border-slate-800 rounded-xl bg-[#111827] shadow-md",
        className
      )}
    >
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-[#161f33]/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {columns.map((col, i) => (
              <th
                key={col.key || i}
                className={cn("px-4 py-3.5 whitespace-nowrap", col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {isBusy ? (
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-4">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-400 font-medium"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg
                    className="w-8 h-8 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const key = resolveRowKey(item, index);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    "hover:bg-[#1a233a]/60 transition-colors duration-100",
                    onRowClick ? "cursor-pointer" : ""
                  )}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.key || cIdx}
                      className={cn(
                        "px-4 py-3.5 text-slate-200 align-middle",
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(item, index)
                        : col.key && item[col.key] !== undefined && item[col.key] !== null
                        ? String(item[col.key])
                        : "-"}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
