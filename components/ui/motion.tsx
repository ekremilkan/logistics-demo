"use client";

import { animate, motion, useInView, useReducedMotion as useFramerReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const EASE_PLACE = [0.2, 0.7, 0.1, 1] as const;

/**
 * Reduced-motion preference that is `false` during SSR and the first client
 * render, so server and client markup match; the real value applies after mount.
 */
export function useReducedMotion(): boolean {
  const pref = useFramerReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!pref : false;
}

/**
 * Sets an element down like a box being placed: a short rise, no overshoot.
 * Falls back to a plain fade when the user prefers reduced motion.
 */
export function Reveal({
  delay = 0,
  y = 28,
  className,
  children,
  as = "div",
  ...rest
}: { delay?: number; y?: number; as?: "div" | "li" | "section" | "article" } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.3 : 0.75, delay: reduce ? 0 : delay, ease: EASE_PLACE }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Number that counts up once when scrolled into view. */
export function CountUp({
  value,
  format,
  duration = 1.8,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={className}>
      {/* Screen readers get the final figure, not the ticking one. */}
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
