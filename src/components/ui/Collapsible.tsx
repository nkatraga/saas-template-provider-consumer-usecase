"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// [Template] — Collapsible section with animated expand/collapse and chevron indicator.

interface CollapsibleProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

function Collapsible({ title, icon: Icon, children, defaultOpen = false, className = "" }: CollapsibleProps) {
  return (
    <div className={`bg-surface rounded-[var(--ds-radius-lg)] border border-border p-6 ${className}`}>
      <details open={defaultOpen || undefined}>
        <summary className="cursor-pointer select-none list-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <h3 className="font-semibold">{title}</h3>
          </div>
          <ChevronDown className="chevron-icon w-5 h-5 text-muted transition-transform" />
        </summary>
        <div className="mt-3">
          {children}
        </div>
      </details>
    </div>
  );
}

export { Collapsible };
export type { CollapsibleProps };
