import React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  id,
  htmlFor,
  children,
  className,
}) => {
  const targetId = htmlFor || id;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={targetId} className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          {label}
          {required && <span className="text-rose-400 ml-1 font-bold">*</span>}
        </label>
      )}

      {children}

      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}

      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
