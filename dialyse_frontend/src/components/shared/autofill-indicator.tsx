"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export interface AutofillIndicatorProps {
  isAutofilled: boolean;
  fieldName?: string;
  children: ReactNode;
}

export function AutofillIndicator({
  isAutofilled,
  children,
}: AutofillIndicatorProps) {
  if (!isAutofilled) {
    return children;
  }

  return (
    <div className="relative">
      <div className="ring-1 ring-emerald-300/50 rounded-[inherit]">{children}</div>
      <div className="absolute -top-2 right-2 flex items-center gap-1">
        <Sparkles size={10} className="text-emerald-500 shrink-0" />
        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
          Auto-complété
        </span>
      </div>
    </div>
  );
}
