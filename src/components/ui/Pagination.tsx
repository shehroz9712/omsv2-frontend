import React from "react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems = 0,
  itemsPerPage = 50,
  onPageChange,
  className,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-[#111827] border border-slate-800 rounded-xl mt-4 text-xs text-slate-400",
        className
      )}
    >
      <div>
        Showing <span className="font-bold text-slate-200">{from}</span> to{" "}
        <span className="font-bold text-slate-200">{to}</span> of{" "}
        <span className="font-bold text-slate-200">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors min-h-[36px]"
        >
          Previous
        </button>

        <span className="px-3 py-1.5 font-bold text-slate-200">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors min-h-[36px]"
        >
          Next
        </button>
      </div>
    </div>
  );
};
