"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { PhotoKey } from "@/lib/images";
import { Photo } from "@/components/ui/Photo";
import { Arrow, SectionMark } from "@/components/ui/marks";
import { EASE_PLACE, Reveal } from "@/components/ui/motion";

const SERVICE_PHOTOS: PhotoKey[] = ["privateMove", "office", "packing", "assembly", "storage", "international"];

export function Services() {
  const { t, eur } = useI18n();
  const s = t.services;
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 32, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 32, mass: 0.6 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !listRef.current) return;
    const r = listRef.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <section id="services" className="paper-fibre relative text-asphalt" aria-labelledby="services-title">
      <div className="wrap py-24 lg:py-36">
        <SectionMark n="01" label={s.index} aside="6 / 6 · Manifest" tone="light" />

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <h2
                  id="services-title"
                  className="font-semi-expanded text-[2.35rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]"
                >
                  {s.title}
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-[36ch] text-lg leading-relaxed text-asphalt/70">{s.intro}</p>
              </Reveal>
            </div>
          </div>

          <ol
            ref={listRef}
            onPointerMove={onMove}
            onPointerLeave={() => setActive(null)}
            className="relative lg:col-span-8"
          >
            {s.items.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 0.05} y={20} className="border-t border-asphalt/25 last:border-b">
                <a
                  href="#estimator"
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onFocus={() => setActive(null)}
                  className="group grid grid-cols-[2.75rem_1fr_auto] items-start gap-x-3 py-6 sm:grid-cols-[4rem_1fr_auto] sm:gap-x-6 sm:py-8"
                >
                  <span
                    className={`label mt-1.5 inline-flex h-7 w-fit items-center px-1.5 font-medium transition-colors duration-300 ${
                      active === i ? "bg-signal text-asphalt" : "text-asphalt/50"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className={`font-semi-expanded text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] transition-transform duration-500 ease-[var(--ease-place)] sm:text-4xl lg:text-[2.9rem] ${
                        active === i ? "translate-x-2" : ""
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="label mt-3 text-asphalt/55">{item.spec}</p>
                    <p className="mt-3 max-w-[52ch] leading-relaxed text-asphalt/75">{item.text}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="label whitespace-nowrap text-asphalt/60">
                      {s.from} <span className="tnum font-medium text-asphalt">{eur(item.price)}</span>
                    </span>
                    <div className="relative size-16 overflow-hidden sm:size-20 lg:hidden">
                      <Photo name={SERVICE_PHOTOS[i]} alt="" sizes="80px" width={300} />
                    </div>
                    <Arrow className="hidden size-6 text-asphalt/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-asphalt lg:block" />
                  </div>
                </a>
              </Reveal>
            ))}

            {/* Cursor-following preview (desktop, fine pointer only). */}
            <AnimatePresence>
              {active !== null && !reduce && (
                <motion.div
                  key="preview"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 z-20 hidden h-64 w-52 lg:block"
                  style={{ x: sx, y: sy, translateX: "40px", translateY: "-50%" }}
                  initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
                  animate={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
                  exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
                  transition={{ duration: 0.4, ease: EASE_PLACE }}
                >
                  {SERVICE_PHOTOS.map((p, i) => (
                    <div
                      key={p}
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{ opacity: active === i ? 1 : 0 }}
                    >
                      <Photo name={p} alt="" sizes="208px" width={600} />
                    </div>
                  ))}
                  <span className="label absolute -bottom-6 left-0 text-asphalt/60">
                    Fig. 0{active + 2}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </ol>
        </div>
      </div>
    </section>
  );
}
