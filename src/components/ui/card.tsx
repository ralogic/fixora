import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
