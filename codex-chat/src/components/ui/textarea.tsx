import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--primary)_18%,white)]",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
