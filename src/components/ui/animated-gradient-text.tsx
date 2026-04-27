"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function AnimatedGradientText({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex animate-gradient bg-[linear-gradient(90deg,#2D6A4F,#E07A5F,#D9A441,#2D6A4F)] bg-[length:200%_100%] bg-clip-text text-transparent",
        className,
      )}
      {...props}
    />
  );
}
