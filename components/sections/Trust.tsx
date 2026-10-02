"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { SectionMark } from "@/components/ui/marks";
import { CountUp, EASE_PLACE, Reveal } from "@/components/ui/motion";

function Stamp({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`inline-flex flex-col items-center border-[3px] border-asphalt p-[3px] text-asphalt ${className}`}
      initial={{ opacity: 0, scale: reduce ? 1 : 1.25, rotate: -9 }}
      whileInView={{ opacity: 0.88, scale: 1, rotate: -6 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 0.35, ease: [0.6, 0, 0.9, 0.4] }}
      style={{
        maskImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='s'><feTurbulence baseFrequency='.7' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75'/></filter><rect width='100%' height='100%' filter='url(%23s)'/></svg>\")",
      }}
    >
      <div className="border border-asphalt px-4 py-2 text-center">
        <div className="label text-[0.6rem]">Hafenkraft · Geprüft</div>
        <div className="font-expanded text-xl font-black uppercase leading-none tracking-tight">{text}</div>
        <div className="label mt-0.5 text-[0.6rem]">HB · 1987</div>
      </div>
    </motion.div>
  );
}

function Tag({
  quote,
  name,
  route,
  i,
}: {
  quote: string;
  name: string;
  route: string;
  i: number;
}) {
  const tilt = [-1.6, 1.1, -0.6][i % 3];
  const drop = ["md:mt-0", "md:mt-24", "md:mt-10"][i % 3];
  return (
    <Reveal as="li" delay={i * 0.1} className={`relative ${drop}`}>
      {/* String */}
      <svg viewBox="0 0 60 70" className="absolute -top-16 left-9 h-[4.4rem] w-14 text-asphalt/50" aria-hidden="true">
        <path d="M30 70 C 10 40, 50 25, 22 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <figure
        className="kraft-paper relative px-6 pb-7 pt-12 text-asphalt"
        style={{
          transform: `rotate(${tilt}deg)`,
          clipPath: "polygon(10% 0, 90% 0, 100% 7%, 100% 100%, 0 100%, 0 7%)",
        }}
      >
        <span
          className="absolute left-9 top-4 size-4 rounded-full border-2 border-kraft-deep bg-paper"
          aria-hidden="true"
        />
        <span className="label absolute right-5 top-4 text-asphalt/60">N° 0{i + 1}</span>
        <blockquote className="font-semi-expanded text-[1.2rem] font-bold leading-snug tracking-[-0.01em]">
          „{quote}“
        </blockquote>
        <figcaption className="mt-6 border-t border-asphalt/30 pt-3">
          <div className="font-medium">{name}</div>
          <div className="label mt-0.5 text-asphalt/65">{route}</div>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export function Trust() {
  const { t, n } = useI18n();
  const s = t.trust;

  return (
    <section id="trust" className="paper-fibre relative overflow-hidden text-asphalt" aria-labelledby="trust-title">
      <div className="wrap py-24 lg:py-36">
        <SectionMark n="05" label={s.index} aside="10 / 2026" tone="light" />
        <Reveal>
          <h2
            id="trust-title"
            className="font-semi-expanded mt-12 max-w-[16ch] text-[2.35rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:mt-16 lg:text-[3.6rem]"
          >
            {s.title}
          </h2>
        </Reveal>

        {/* Big numbers, staggered */}
        <dl className="mt-14 lg:mt-20">
          {s.stats.map((st, i) => {
            const right = i === 1;
            return (
              <div
                key={st.label}
                className={`grid items-end gap-x-8 gap-y-3 border-t border-asphalt/25 py-8 lg:grid-cols-12 lg:py-10 ${
                  i === s.stats.length - 1 ? "border-b" : ""
                }`}
              >
                <dd
                  className={`font-expanded tnum text-[clamp(3.6rem,19vw,5.5rem)] font-black leading-[0.8] tracking-[-0.06em] sm:text-[14vw] lg:col-span-8 lg:text-[min(11.5vw,11rem)] ${
                    right ? "lg:order-2 lg:col-start-5 lg:text-right" : ""
                  }`}
                >
                  <CountUp
                    value={st.value}
                    format={(v) => `${st.prefix}${n(v)}${st.suffix}`}
                    duration={i === 1 ? 2.4 : 1.6}
                  />
                </dd>
                <dt className={`lg:col-span-4 ${right ? "lg:order-1 lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div className="font-semi-expanded text-xl font-extrabold tracking-tight">{st.label}</div>
                  <div className="label mt-1.5 max-w-[34ch] normal-case tracking-[0.02em] text-asphalt/60">{st.note}</div>
                </dt>
              </div>
            );
          })}
        </dl>

        {/* Guarantees */}
        <div className="mt-20 grid gap-14 md:grid-cols-2 lg:mt-28 lg:gap-8">
          {s.guarantees.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.1} className="relative border-t-4 border-asphalt pt-8">
              <Stamp text={g.stamp} className="float-right -mt-2 ml-4 sm:mr-4" />
              <div className="label text-asphalt/55">N° 0{i + 1}</div>
              <h3 className="font-semi-expanded mt-3 max-w-[18ch] text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl">
                {g.title}
              </h3>
              <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-asphalt/70">{g.text}</p>
            </Reveal>
          ))}
        </div>

        {/* Testimonials as parcel tags */}
        <div className="mt-28 lg:mt-36">
          <motion.div
            className="label flex items-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_PLACE }}
          >
            <span>{s.testimonialsTitle}</span>
            <span className="h-px flex-1 bg-asphalt/20" />
          </motion.div>
          <ul className="mt-24 grid gap-24 md:grid-cols-3 md:gap-8 lg:gap-12">
            {s.testimonials.map((q, i) => (
              <Tag key={q.name} {...q} i={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
