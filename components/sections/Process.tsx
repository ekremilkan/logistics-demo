"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { PhotoKey } from "@/lib/images";
import { Photo } from "@/components/ui/Photo";
import { SectionMark } from "@/components/ui/marks";
import { Reveal } from "@/components/ui/motion";

const STEP_PHOTOS: PhotoKey[] = ["survey", "packing", "privateMove", "highway", "newHome"];

function Heading() {
  const { t } = useI18n();
  const p = t.process;
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <h2
        className="font-semi-expanded text-[2.35rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:col-span-7 lg:text-[3.6rem]"
      >
        {p.title}
      </h2>
      <p className="max-w-[38ch] text-lg leading-relaxed text-asphalt/70 lg:col-span-4 lg:col-start-9">{p.intro}</p>
    </div>
  );
}

/** Desktop: the section pins and the day scrolls sideways along a route line. */
function Horizontal() {
  const { t } = useI18n();
  const steps = t.process.steps;
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [reached, setReached] = useState(0);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 });
  const x = useTransform(smooth, (v) => -v * distance);
  const line = useTransform(smooth, [0.02, 0.92], [0, 1], { clamp: true });
  const head = useTransform(line, (v) => `${v * 100}%`);
  useMotionValueEvent(line, "change", (v) => setReached(Math.min(steps.length - 1, Math.floor(v * (steps.length - 1) + 0.08))));

  if (reduce) {
    return (
      <div className="wrap py-28">
        <SectionMark n="03" label={t.process.index} aside="01 — 05" tone="light" />
        <div className="mt-14">
          <Heading />
        </div>
        <ol className="no-scrollbar mt-16 grid grid-cols-5 gap-8">
          {steps.map((s, i) => (
            <Station key={s.title} step={s} i={i} active />
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
        <div className="wrap pt-10 xl:pt-14">
          <SectionMark n="03" label={t.process.index} aside={`0${reached + 1} / 05`} tone="light" />
          <div className="mt-8 xl:mt-12">
            <Heading />
          </div>
        </div>

        <div className="relative mt-auto pb-10 xl:pb-14">
          <motion.div ref={trackRef} style={{ x }} className="w-max pl-[max(3rem,calc((100vw-92rem)/2+3rem))] pr-[12vw]">
            <div className="relative">
            {/* Route line: from the first station's node to the last one's */}
            <div className="pointer-events-none absolute left-2 right-[calc(min(26rem,30vw)-0.5rem)] top-[calc(1rem+clamp(2.4rem,4.2vw,4.4rem)+1.25rem+0.6rem)] h-0">
              <div className="absolute inset-x-0 border-t-2 border-dashed border-asphalt/25" />
              <motion.div className="absolute left-0 top-[-2px] h-1 w-full origin-left bg-signal" style={{ scaleX: line }} />
              <motion.div
                className="label absolute -top-[13px] -translate-x-1/2 bg-asphalt px-2 py-1 text-paper"
                style={{ left: head }}
              >
                HK·07
              </motion.div>
            </div>
            <ol className="flex gap-14">
              {steps.map((s, i) => (
                <Station key={s.title} step={s} i={i} active={i <= reached} />
              ))}
            </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Station({
  step,
  i,
  active,
}: {
  step: { time: string; title: string; text: string };
  i: number;
  active: boolean;
}) {
  const tall = i % 2 === 1;
  return (
    <li className="relative w-[min(26rem,30vw)] shrink-0 list-none">
      <div className="label text-asphalt/50">Station 0{i + 1}</div>
      <div className="tnum mt-1 whitespace-nowrap font-mono text-[clamp(2.4rem,4.2vw,4.4rem)] font-medium leading-none tracking-[-0.04em]">
        {step.time}
      </div>
      <div className="relative mt-5 h-5">
        <span
          className={`absolute left-0 top-1/2 size-4 -translate-y-1/2 border-2 border-asphalt transition-colors duration-500 ${
            active ? "bg-signal" : "bg-paper"
          }`}
        />
      </div>
      <h3 className="font-semi-expanded mt-6 text-2xl font-extrabold tracking-tight xl:text-[1.75rem]">{step.title}</h3>
      <p className="mt-2 max-w-[34ch] leading-relaxed text-asphalt/70">{step.text}</p>
      <div className={`relative mt-6 w-full overflow-hidden ${tall ? "h-[24vh]" : "h-[17vh]"}`}>
        <Photo name={STEP_PHOTOS[i]} alt="" sizes="30vw" width={900} />
      </div>
    </li>
  );
}

/** Mobile: a vertical route that draws itself as you scroll. */
function Vertical() {
  const { t } = useI18n();
  const steps = t.process.steps;
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });

  return (
    <div className="wrap py-24">
      <SectionMark n="03" label={t.process.index} aside="01 — 05" tone="light" />
      <div className="mt-10">
        <Heading />
      </div>
      <ol ref={ref} className="relative mt-14 pl-10">
        <span className="absolute bottom-2 left-[7px] top-2 border-l-2 border-dashed border-asphalt/25" aria-hidden="true" />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-2 left-[6px] top-2 w-1 origin-top bg-signal"
          style={{ scaleY: reduce ? 1 : scrollYProgress }}
        />
        {steps.map((s, i) => (
          <Reveal as="li" key={s.title} className="relative pb-14 last:pb-0" y={20}>
            <span className="absolute -left-10 top-3 size-4 border-2 border-asphalt bg-signal" aria-hidden="true" />
            <div className="label text-asphalt/50">Station 0{i + 1}</div>
            <div className="tnum font-mono text-[2.6rem] font-medium leading-tight tracking-[-0.04em]">{s.time}</div>
            <h3 className="font-semi-expanded mt-2 text-2xl font-extrabold tracking-tight">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-asphalt/70">{s.text}</p>
            {(i === 0 || i === 3 || i === 4) && (
              <div className="relative mt-5 aspect-[16/10] overflow-hidden">
                <Photo name={STEP_PHOTOS[i]} alt="" sizes="100vw" width={900} />
              </div>
            )}
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export function Process() {
  const { t } = useI18n();
  return (
    <section id="process" className="paper-fibre relative text-asphalt" aria-label={t.process.title}>
      <div className="hidden lg:block">
        <Horizontal />
      </div>
      <div className="lg:hidden">
        <Vertical />
      </div>
    </section>
  );
}
