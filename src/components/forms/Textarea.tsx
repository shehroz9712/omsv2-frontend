import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full bg-[#161f33] border rounded-lg px-3.5 py-2.5 text-base text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-900 resize-y",
          hasError
            ? "border-rose-500 focus:ring-rose-500"
            : "border-slate-700 hover:border-slate-600 focus:border-blue-500",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
