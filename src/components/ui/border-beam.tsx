import { cn } from "@/lib/utils";

export function BorderBeam({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border border-white/40 [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className,
      )}
    />
  );
}
