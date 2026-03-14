"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
};

export function OtpInput({ value, onChange, length = 6 }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, length);
  }, [length]);

  const digits = Array.from({ length }).map((_, idx) => value[idx] ?? "");

  return (
    <div className="flex items-center justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(-1);
            const chars = value.split("");
            chars[index] = next;
            const merged = chars.join("").slice(0, length);
            onChange(merged);

            if (next && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          className="h-12 w-10 rounded-xl border border-zinc-300 text-center text-lg font-semibold"
        />
      ))}
    </div>
  );
}
