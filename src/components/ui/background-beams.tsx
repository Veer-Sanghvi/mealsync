import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-[-20%] h-64 bg-[radial-gradient(circle_at_top,rgba(45,106,79,0.18),transparent_58%)]" />
      <div className="absolute right-[-10%] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(224,122,95,0.22),transparent_70%)] blur-2xl" />
      <div className="absolute left-[-12%] bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(217,164,65,0.18),transparent_70%)] blur-2xl" />
      <div className="absolute inset-y-0 left-1/4 w-px bg-gradient-to-b from-transparent via-emerald-700/20 to-transparent" />
      <div className="absolute inset-y-0 right-1/3 w-px bg-gradient-to-b from-transparent via-orange-500/20 to-transparent" />
    </div>
  );
}
