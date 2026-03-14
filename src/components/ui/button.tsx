"use client";

import { type ButtonHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-cyan-400",
  secondary:
    "bg-slate-900 text-slate-100 hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-200/60",
};

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", onClick, ...props },
  ref,
) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] = (event) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (event.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setRipples((prev) => [...prev, { id, x, y, size }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 620);

    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl px-5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      ))}
      <span className="relative z-[1] inline-flex items-center justify-center">{props.children}</span>
    </button>
  );
});
