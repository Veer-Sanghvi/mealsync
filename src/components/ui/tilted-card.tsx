"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function TiltedCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      className={cn("transform-gpu", className)}
      animate={{ rotateX: rotation.x, rotateY: rotation.y }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        setRotation({ x: (0.5 - y) * 6, y: (x - 0.5) * 8 });
      }}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
