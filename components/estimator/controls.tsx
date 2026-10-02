"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_PLACE } from "@/components/ui/motion";

/** Odometer-style number: each digit rolls to its new value. */
export function RollingNumber({ value, className = "" }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const chars = value.split("");
  return (
    <span className={`inline-flex overflow-hidden leading-none ${className}`}>
      <span className="sr-only">{value}</span>
      {chars.map((ch, i) => {
        const key = chars.length - i; // key from the right, so units stay put as numbers grow
        if (!/\d/.test(ch)) {
          return (
            <span key={`s${key}`} aria-hidden="true" className="inline-block whitespace-pre">
              {ch}
            </span>
          );
        }
        const d = Number(ch);
        return (
          <span key={`d${key}`} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden">
            <span className="invisible">0</span>
            <motion.span
              className="absolute left-0 top-0 flex flex-col"
              initial={false}
              animate={{ y: `${-d}em` }}
              transition={{ duration: reduce ? 0 : 0.55, ease: EASE_PLACE }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[1em]">
                  {n}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

export function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  less,
  more,
  size = "lg",
  format = (v) => String(v),
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  less: string;
  more: string;
  size?: "lg" | "sm";
  format?: (v: number) => string;
}) {
  const btn =
    size === "lg"
      ? "size-14 text-2xl sm:size-16"
      : "size-11 text-lg";
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={`${label}: ${less}`}
        className={`${btn} flex shrink-0 items-center justify-center border-2 border-paper/40 font-mono transition-colors hover:border-paper disabled:opacity-30 disabled:hover:border-paper/40`}
      >
        –
      </button>
      <output
        aria-live="polite"
        className={`tnum text-center ${
          size === "lg"
            ? "font-expanded min-w-[2.2ch] text-[4.2rem] font-black leading-none tracking-[-0.05em] sm:text-[5.5rem]"
            : "min-w-[4.5rem] whitespace-nowrap font-mono text-lg font-medium"
        }`}
      >
        {format(value)}
      </output>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={`${label}: ${more}`}
        className={`${btn} flex shrink-0 items-center justify-center border-2 border-paper/40 font-mono transition-colors hover:border-paper disabled:opacity-30 disabled:hover:border-paper/40`}
      >
        +
      </button>
    </div>
  );
}

/** Two-option segmented switch. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex border-2 border-paper/30 p-1 ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`label min-h-10 flex-1 px-4 font-medium transition-colors ${
              on ? "bg-paper text-asphalt" : "text-paper/65 hover:text-paper"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Square check mark used by tiles and extras. */
export function CheckBox({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-7 shrink-0 items-center justify-center border-2 transition-colors ${
        on ? "border-signal bg-signal text-asphalt" : "border-paper/40"
      } ${className}`}
    >
      <svg viewBox="0 0 16 16" className={`size-4 transition-opacity ${on ? "opacity-100" : "opacity-0"}`} fill="none">
        <path d="M2.5 8.5 6 12l7.5-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
      </svg>
    </span>
  );
}
