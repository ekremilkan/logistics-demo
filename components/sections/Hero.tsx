"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/marks";
import { EASE_PLACE } from "@/components/ui/motion";
import { ShippingLabel } from "./ShippingLabel";

function BremenClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(
        new Date(),
      );
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 20_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tnum">HB {time ?? "--:--"}</span>;
}

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);

  const [a, b] = t.hero.headline;
  // Indent whichever line is shorter — keeps the composition asymmetric in both languages.
  const indentFirst = a.length < b.length;
  const lastSpace = b.lastIndexOf(" ");
  const bHead = lastSpace > 0 ? b.slice(0, lastSpace + 1) : "";
  const bTail = lastSpace > 0 ? b.slice(lastSpace + 1) : b;

  const line = (delay: number) => ({
    initial: { y: reduce ? 0 : "105%" },
    animate: { y: "0%" },
    transition: { duration: 0.9, delay, ease: EASE_PLACE },
  });

  return (
    <section ref={ref} id="top" className="relative overflow-hidden bg-asphalt pb-0 text-paper">
      <div className="wrap">
        <div className="label flex items-center gap-3 border-b border-paper/15 py-4 text-paper/60">
          <span className="text-signal">N° 001</span>
          <span>{t.hero.meta}</span>
          <span className="ml-auto hidden md:inline">53.0951° N · 8.7738° E</span>
        </div>

        <h1
          className="font-expanded mt-8 text-[clamp(3.1rem,14.6vw,5.6rem)] font-extrabold leading-[0.9] tracking-[-0.04em] lg:leading-[0.94] sm:mt-12 md:text-[11.2vw] lg:text-[10.4vw] 2xl:text-[9.6rem]"
          aria-label={`${a} ${b}`}
        >
          <span className={`block overflow-hidden pb-[0.06em] ${indentFirst ? "lg:pl-[28%]" : ""}`} aria-hidden="true">
            <motion.span className="block" {...line(0.05)}>
              {a}
            </motion.span>
          </span>
          <span className={`block overflow-hidden pb-[0.12em] ${indentFirst ? "" : "lg:pl-[24%]"}`} aria-hidden="true">
            <motion.span className="block" {...line(0.16)}>
              {bHead}
              <span className="relative inline-block">
                <span className="relative z-10">{bTail}</span>
                <motion.span
                  className="absolute -left-[0.04em] -right-[0.08em] bottom-[0.02em] z-0 h-[0.2em] origin-left bg-signal"
                  style={{ clipPath: "polygon(0 8%, 100% 0, 97% 34%, 100% 62%, 98% 100%, 0 92%)" }}
                  initial={{ scaleX: reduce ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.85, ease: EASE_PLACE }}
                />
              </span>
            </motion.span>
          </span>
        </h1>

        <div className="mt-8 grid gap-10 pb-0 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          <motion.div
            className="lg:col-span-4 lg:pt-4"
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE_PLACE }}
          >
            <p className="max-w-[34ch] text-[1.0625rem] leading-relaxed text-paper/75 sm:text-lg">{t.hero.sub}</p>
            <a
              href="#estimator"
              className="group mt-8 flex w-full items-center justify-between gap-6 bg-signal px-5 py-5 text-asphalt transition-colors hover:bg-paper sm:w-auto sm:max-w-sm"
            >
              <span className="font-semi-expanded text-lg font-extrabold leading-tight tracking-tight">
                {t.hero.cta}
              </span>
              <Arrow className="size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <p className="label mt-5 text-paper/55">
              {t.hero.call}{" "}
              <span className="text-paper">0421 98765 40</span>
            </p>
          </motion.div>

          <div className="relative lg:col-span-8 lg:-mr-8 xl:-mr-12">
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:aspect-auto lg:h-[min(64vh,680px)]">
              <motion.div className="absolute inset-0 scale-[1.14]" style={{ y: photoY }}>
                <Photo name="hero" alt={t.hero.photoAlt} sizes="(min-width: 1024px) 66vw, 100vw" priority />
              </motion.div>
              <span className="label absolute right-3 top-3 z-10 bg-asphalt/80 px-2 py-1 text-paper/80">
                Fig. 01 — Schwachhausen, 07:14
              </span>
            </div>
            <motion.div
              className="absolute -bottom-10 left-3 z-20 origin-top-left sm:left-6 lg:-bottom-16 lg:-left-10"
              initial={{ opacity: 0, y: reduce ? 0 : -40, rotate: reduce ? -2 : -7 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.9, delay: 0.7, ease: EASE_PLACE }}
            >
              <ShippingLabel />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-24 border-t border-paper/15 lg:mt-28">
        <div className="wrap label flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-paper/60">
          <span className="flex items-center gap-2 text-paper">
            <span className="size-2 bg-signal" aria-hidden="true" />
            <BremenClock />
          </span>
          {t.hero.status.map((s) => (
            <span key={s}>{s}</span>
          ))}
          <span className="ml-auto hidden items-center gap-2 md:flex">
            Scroll <Arrow dir="down" className="size-3.5" />
          </span>
        </div>
      </div>
    </section>
  );
}
