"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function TextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.p
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
}
