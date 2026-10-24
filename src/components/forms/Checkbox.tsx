import React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={cn(
            "w-5 h-5 rounded border-slate-700 bg-[#161f33] text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0b0f19] cursor-pointer mt-0.5",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <label htmlFor={id} className="text-sm font-medium text-slate-300 select-none cursor-pointer">
            {label && <div>{label}</div>}
            {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
