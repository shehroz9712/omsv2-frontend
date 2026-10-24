import React from "react";
import { cn } from "@/lib/utils";

export interface DefinitionItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

export const DefinitionItem: React.FC<DefinitionItemProps> = ({ label, value, className }) => {
  return (
    <div className={cn("py-2.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0", className)}>
      <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200 sm:col-span-2 sm:mt-0 font-medium">
        {value !== null && value !== undefined && value !== "" ? value : "-"}
      </dd>
    </div>
  );
};

export interface DefinitionListProps {
  children?: React.ReactNode;
  items?: DefinitionItemProps[];
  className?: string;
}

export const DefinitionList: React.FC<DefinitionListProps> = ({ children, items, className }) => {
  return (
    <dl className={cn("divide-y divide-slate-800/80", className)}>
      {items
        ? items.map((it, idx) => (
            <DefinitionItem key={idx} label={it.label} value={it.value} className={it.className} />
          ))
        : children}
    </dl>
  );
};
