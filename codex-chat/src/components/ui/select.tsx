import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--primary)_18%,white)]",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";
