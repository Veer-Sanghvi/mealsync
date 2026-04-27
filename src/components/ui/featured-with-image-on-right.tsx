import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function FeaturedWithImageOnRight({
  content,
  visual,
  className,
}: {
  content: ReactNode;
  visual: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-center",
        className,
      )}
    >
      <div>{content}</div>
      <div>{visual}</div>
    </section>
  );
}
