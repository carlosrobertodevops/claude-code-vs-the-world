import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] px-4 py-2 text-white hover:opacity-90 focus-visible:ring-[var(--primary)]",
        secondary: "bg-white/70 px-4 py-2 text-slate-900 ring-1 ring-slate-200 hover:bg-white focus-visible:ring-slate-300",
        ghost: "px-3 py-2 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
        danger: "bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 focus-visible:ring-rose-400",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
