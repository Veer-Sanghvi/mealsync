"use client";

import Link from "next/link";

import { motion } from "framer-motion";

type FloatingNavbarProps = {
  items: Array<{ label: string; href: string }>;
};

export function FloatingNavbar({ items }: FloatingNavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-4 z-50 mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 shadow-[0_18px_45px_rgba(65,53,39,0.12)] backdrop-blur"
    >
      <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
        MealSync
      </span>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full px-3 py-1 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
        >
          {item.label}
        </Link>
      ))}
    </motion.nav>
  );
}
