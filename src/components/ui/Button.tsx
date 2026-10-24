import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isBusy = isLoading || loading;
    const resolvedLeftIcon = leftIcon || icon;
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0f19] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 focus:ring-blue-500 shadow-md shadow-blue-600/20",
      secondary:
        "bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 focus:ring-slate-500",
      danger:
        "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 focus:ring-rose-500 shadow-md shadow-rose-600/20",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus:ring-emerald-500 shadow-md shadow-emerald-600/20",
      ghost:
        "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-slate-600",
      outline:
        "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-slate-600 focus:ring-slate-500",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 min-h-[36px]",
      md: "text-sm px-4 py-2 gap-2 min-h-[44px]",
      lg: "text-base px-6 py-2.5 gap-2.5 min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isBusy}
        {...props}
      >
        {isBusy ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : resolvedLeftIcon ? (
          <span className="flex-shrink-0">{resolvedLeftIcon}</span>
        ) : null}
        {children}
        {!isBusy && rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = "Button";
