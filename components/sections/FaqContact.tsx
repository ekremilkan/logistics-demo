"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SectionMark } from "@/components/ui/marks";
import { EASE_PLACE, Reveal } from "@/components/ui/motion";

export function Faq() {
  const { t } = useI18n();
  const f = t.faq;
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const base = useId();

  return (
    <section id="faq" className="bg-asphalt text-paper" aria-labelledby="faq-title">
      <div className="wrap py-24 lg:py-36">
        <SectionMark n="06" label={f.index} aside={`${f.items.length} × Q/A`} />
        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal className="lg:sticky lg:top-28">
              <h2
                id="faq-title"
                className="font-semi-expanded text-[2.35rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]"
              >
                {f.title}
              </h2>
            </Reveal>
          </div>
          <ul className="lg:col-span-8">
            {f.items.map((item, i) => {
              const isOpen = open === i;
              const id = `${base}-${i}`;
              return (
                <li key={item.q} className="border-t border-paper/20 last:border-b">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={id}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group grid w-full grid-cols-[2.5rem_1fr_2rem] items-baseline gap-2 py-6 text-left sm:grid-cols-[3.5rem_1fr_2.5rem] lg:py-7"
                    >
                      <span className={`label ${isOpen ? "text-signal" : "text-paper/45"}`}>Q.0{i + 1}</span>
                      <span className="font-semi-expanded text-xl font-bold leading-snug tracking-tight sm:text-2xl lg:text-[1.75rem]">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`relative ml-auto mt-1 block size-6 border transition-colors ${
                          isOpen ? "border-signal bg-signal text-asphalt" : "border-paper/40 group-hover:border-paper"
                        }`}
                      >
                        <span className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2 bg-current" />
                        <span
                          className={`absolute left-1/2 top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ${
                            isOpen ? "scale-y-0" : ""
                          }`}
                        />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={id}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.45, ease: EASE_PLACE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[62ch] pb-8 pl-[2.75rem] text-lg leading-relaxed text-paper/70 sm:pl-[4rem]">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function YardMap({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 400 260" role="img" aria-label={label} className="block h-auto w-full">
      <rect width="400" height="260" fill="var(--color-paper-2)" />
      {/* Streets */}
      <g stroke="var(--color-asphalt)" strokeOpacity={0.18} strokeWidth={6} fill="none">
        <path d="M0 70 L400 40" />
        <path d="M60 0 L120 260" />
        <path d="M250 0 L300 150" />
        <path d="M0 200 L170 160" />
      </g>
      {/* Weser */}
      <path d="M-10 250 C 120 230, 210 200, 300 205 S 380 230, 410 240 L410 270 L-10 270Z" fill="var(--color-asphalt)" fillOpacity={0.85} />
      {/* Harbour basins */}
      <path d="M140 118 L330 100 L334 132 L146 150Z" fill="var(--color-asphalt)" fillOpacity={0.85} />
      <path d="M180 185 L320 172 L322 190 L182 203Z" fill="var(--color-asphalt)" fillOpacity={0.85} />
      <text x="232" y="128" className="font-mono" fontSize="10" fill="var(--color-paper)" fillOpacity={0.7} letterSpacing="1.5">
        HOLZHAFEN
      </text>
      <text x="30" y="246" className="font-mono" fontSize="10" fill="var(--color-paper)" fillOpacity={0.7} letterSpacing="1.5">
        WESER
      </text>
      <text x="268" y="34" className="font-mono" fontSize="9" fill="var(--color-asphalt)" fillOpacity={0.55} letterSpacing="1.5" transform="rotate(-4 268 34)">
        ÜBERSEESTADT
      </text>
      {/* Yard */}
      <rect x="196" y="74" width="34" height="22" fill="var(--color-signal)" stroke="var(--color-asphalt)" strokeWidth="2" />
      <path d="M213 96 L213 112" stroke="var(--color-asphalt)" strokeWidth="2" />
      <text x="238" y="90" className="font-mono" fontSize="11" fontWeight={600} fill="var(--color-asphalt)">
        HK · 14
      </text>
      <path d="M370 30 l0 -16 m-5 6 l5 -6 l5 6" stroke="var(--color-asphalt)" strokeWidth="1.6" fill="none" />
      <text x="366" y="44" className="font-mono" fontSize="9" fill="var(--color-asphalt)">
        N
      </text>
    </svg>
  );
}

export function Contact() {
  const { t } = useI18n();
  const c = t.contact;
  return (
    <section id="contact" className="paper-fibre text-asphalt" aria-labelledby="contact-title">
      <div className="wrap py-24 lg:py-36">
        <SectionMark n="07" label={c.index} aside="53.0951° N · 8.7738° E" tone="light" />
        <div className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <h2
                id="contact-title"
                className="font-semi-expanded max-w-[14ch] text-[2.35rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]"
              >
                {c.title}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-12 lg:mt-16">
                <div className="label text-asphalt/55">{c.phoneTitle}</div>
                <p className="font-expanded tnum mt-2 whitespace-nowrap text-[clamp(2rem,10vw,3rem)] font-black leading-none tracking-[-0.05em] sm:text-6xl xl:text-[5.2rem]">
                  0421 98765 40
                </p>
                <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-asphalt/70">{c.lead}</p>
                <div className="label mt-8 text-asphalt/55">{c.emailTitle}</div>
                <p className="font-semi-expanded mt-1 text-2xl font-bold tracking-tight">hallo@hafenkraft.de</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="lg:col-span-5">
            <div className="border-[1.5px] border-asphalt bg-paper">
              <div className="label flex justify-between border-b-[1.5px] border-asphalt bg-asphalt px-4 py-2 text-paper">
                <span>{c.addressTitle}</span>
                <span className="text-signal">HB-28217</span>
              </div>
              <address className="px-4 py-5 not-italic">
                <div className="label text-asphalt/55">{c.company}</div>
                <div className="font-semi-expanded mt-2 text-3xl font-extrabold leading-tight tracking-tight">
                  {c.street}
                  <br />
                  {c.city}
                </div>
              </address>
              <div className="border-y-[1.5px] border-asphalt">
                <YardMap label={c.mapLabel} />
              </div>
              <div className="px-4 py-4">
                <div className="label text-asphalt/55">{c.hoursTitle}</div>
                <table className="mt-2 w-full font-mono text-sm">
                  <tbody>
                    {c.hours.map(([d, h]) => (
                      <tr key={d} className="border-b border-dashed border-asphalt/25 last:border-0">
                        <th scope="row" className="py-2 text-left font-normal text-asphalt/70">
                          {d}
                        </th>
                        <td className="tnum py-2 text-right font-medium">{h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
