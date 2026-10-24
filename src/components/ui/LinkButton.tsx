import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0f19] cursor-pointer text-decoration-none";

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
    <Link href={href} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {leftIcon ? <span className="flex-shrink-0">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
    </Link>
  );
};
