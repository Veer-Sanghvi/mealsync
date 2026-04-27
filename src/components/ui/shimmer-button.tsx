import * as React from "react";

import { cn } from "@/lib/utils";

type ShimmerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-3 font-semibold text-white shadow-[0_14px_32px_rgba(45,106,79,0.22)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 bg-current opacity-100" />
      <span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/30 blur-sm transition-transform duration-700 group-hover:translate-x-[420%]" />
      <span className="relative z-10">{children}</span>
    </button>
  );
});

ShimmerButton.displayName = "ShimmerButton";
