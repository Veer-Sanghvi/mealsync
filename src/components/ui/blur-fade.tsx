"use client";

import type { ComponentPropsWithoutRef } from "react";

import { motion } from "framer-motion";

export function BlurFade(
  props: ComponentPropsWithoutRef<typeof motion.div> & { delay?: number },
) {
  const { delay = 0, children, ...rest } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
