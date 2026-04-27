"use client";

import type { ComponentPropsWithoutRef } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function AnimatedList({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof motion.div>) {
  return (
    <motion.div
      className={cn("grid gap-4", className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof motion.div>) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
