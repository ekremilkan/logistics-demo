"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Estimate, EstimateInput } from "@/lib/estimator";
import { fill, useI18n } from "@/lib/i18n";
import { Barcode, ThisSideUp } from "@/components/ui/marks";
import { EASE_PLACE, useReducedMotion } from "@/components/ui/motion";
import { RollingNumber } from "./controls";

export function useEstimateText(input: EstimateInput, est: Estimate) {
  const { t, n, locale } = useI18n();
  const L = t.estimator.label;
  const sizeKnown = (input.sizeMode === "rooms" ? input.rooms : input.sqm) !== null;
  const routeKnown = !!est.from && !!est.to;

  const route = routeKnown ? `${est.from!.name} → ${est.to!.name}` : null;
  const km = routeKnown
    ? est.distanceKm <= 10
      ? t.estimator.steps.route.local
      : `${n(est.distanceKm)} ${t.units.km}`
    : null;
  const volume = sizeKnown ? `${n(est.volumeM3)} ${t.units.m3}` : null;
  const truck = sizeKnown ? `${est.truckCount > 1 ? `${est.truckCount}× ` : ""}${est.truck.weight}` : null;
  const crew = sizeKnown ? fill(L.people, { n: est.crew }) : null;
  const duration =
    sizeKnown && routeKnown
      ? est.days > 1
        ? fill(L.days, { n: est.days })
        : fill(L.hours, { n: Math.max(2, Math.round(est.hours.total)) })
      : null;
  const date = input.date
    ? new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${input.date}T12:00:00`)) + (input.flexibleDate ? ` ± 3` : "")
    : input.flexibleDate
      ? L.flexible
      : null;
  const mid = (est.priceLow + est.priceHigh) / 2;
  const spread = Math.round(((est.priceHigh - est.priceLow) / 2 / mid) * 100);
  return { route, km, volume, truck, crew, duration, date, spread };
}

function Field({ label, value, big = false }: { label: string; value: string | null; big?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="min-w-0">
      <dt className="label text-asphalt/55">{label}</dt>
      <dd
        className={`truncate ${
          big ? "font-semi-expanded text-lg font-extrabold tracking-tight sm:text-xl" : "font-mono text-[0.95rem] font-medium"
        } ${value ? "" : "text-asphalt/30"}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={value ?? "pending"}
            className="inline-block"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE_PLACE }}
          >
            {value ?? t.estimator.label.pending}
          </motion.span>
        </AnimatePresence>
      </dd>
    </div>
  );
}

export function PriceRange({ est, className = "" }: { est: Estimate; className?: string }) {
  const { n } = useI18n();
  return (
    <span className={`font-expanded tnum inline-flex items-baseline font-black tracking-[-0.045em] ${className}`}>
      <RollingNumber value={n(est.priceLow)} />
      <span className="px-[0.18em] font-normal opacity-60">–</span>
      <RollingNumber value={n(est.priceHigh)} />
      <span className="ml-[0.2em] text-[0.5em] tracking-normal">€</span>
    </span>
  );
}

export function LiveLabel({
  input,
  est,
  className = "",
}: {
  input: EstimateInput;
  est: Estimate;
  className?: string;
}) {
  const { t, eur } = useI18n();
  const L = t.estimator.label;
  const x = useEstimateText(input, est);
  const reduce = useReducedMotion();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const ticks = 24;
  const filled = Math.round(est.confidence * ticks);

  return (
    <div className={`paper-fibre border-[1.5px] border-asphalt text-asphalt ${className}`}>
      <div className="kraft-paper flex items-center justify-between border-b-[1.5px] border-asphalt px-4 py-2">
        <span className="label font-medium">Hafenkraft · {L.title}</span>
        <span className="label flex items-center gap-1.5">
          <span className={`size-2 bg-asphalt ${reduce ? "" : "animate-pulse"}`} aria-hidden="true" />
          {L.live}
        </span>
      </div>

      <dl>
        <div className="flex items-end justify-between gap-4 border-b-[1.5px] border-asphalt px-4 py-3">
          <Field label={L.route} value={x.route} big />
          <span className="label shrink-0 pb-1 text-asphalt/70">{x.km}</span>
        </div>
        <div className="grid grid-cols-2 border-b border-asphalt/40">
          <div className="border-r border-asphalt/40 px-4 py-2.5">
            <Field label={L.volume} value={x.volume} />
          </div>
          <div className="px-4 py-2.5">
            <Field label={L.truck} value={x.truck} />
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-asphalt/40">
          <div className="border-r border-asphalt/40 px-4 py-2.5">
            <Field label={L.crew} value={x.crew} />
          </div>
          <div className="px-4 py-2.5">
            <Field label={L.duration} value={x.duration} />
          </div>
        </div>
        <div className="border-b-[1.5px] border-asphalt px-4 py-2.5">
          <Field label={L.date} value={x.date} />
        </div>
      </dl>

      <div className="px-4 pb-4 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="label text-asphalt/55">{L.price}</span>
          <ThisSideUp className="size-5 shrink-0" />
        </div>
        <div className="mt-2 text-[clamp(2rem,9vw,2.9rem)] leading-none lg:text-[2.6rem] xl:text-[3rem]">
          <PriceRange est={est} />
        </div>
        <p className="label mt-2 normal-case tracking-[0.02em] text-asphalt/60">{L.priceNote}</p>

        <div className="mt-5">
          <div className="label flex justify-between text-asphalt/60">
            <span>{L.accuracy}</span>
            <span className="tnum text-asphalt">± {x.spread} %</span>
          </div>
          <div className="mt-1.5 flex h-3 gap-[3px]" aria-hidden="true">
            {Array.from({ length: ticks }, (_, i) => (
              <span
                key={i}
                className={`flex-1 transition-colors duration-500 ${i < filled ? "bg-asphalt" : "bg-asphalt/15"}`}
                style={{ transitionDelay: `${i * 12}ms` }}
              />
            ))}
          </div>
        </div>

        {est.dateFlags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {est.dateFlags.map((f) => (
              <li
                key={f}
                className={`label px-2 py-1 ${f === "flexible" ? "bg-asphalt text-paper" : "bg-signal text-asphalt"}`}
              >
                {L.dateFlags[f]}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setShowBreakdown((v) => !v)}
          aria-expanded={showBreakdown}
          className="label mt-5 flex min-h-11 w-full items-center justify-between border-t border-dashed border-asphalt/40 pt-3 text-asphalt/70 hover:text-asphalt"
        >
          <span>{L.breakdown}</span>
          <span aria-hidden="true">{showBreakdown ? "–" : "+"}</span>
        </button>
        <AnimatePresence initial={false}>
          {showBreakdown && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: EASE_PLACE }}
              className="overflow-hidden font-mono text-[0.8rem]"
            >
              {est.breakdown.map((b) => (
                <li key={b.key} className="flex justify-between gap-4 border-b border-dotted border-asphalt/25 py-1.5">
                  <span className="text-asphalt/70">{t.estimator.lines[b.key]}</span>
                  <span className="tnum">{eur(b.amount)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 py-1.5 font-semibold">
                <span>Σ</span>
                <span className="tnum">{eur(est.total)}</span>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t-[1.5px] border-asphalt px-4 py-2.5">
        <Barcode seed={`${x.route}${est.volumeM3}${input.date}`} className="h-8 w-full" />
        <div className="label mt-1 flex justify-between text-asphalt/70">
          <span>HK-26-······</span>
          <span>{t.estimator.demoNote.split("—")[0].trim()}</span>
        </div>
      </div>
    </div>
  );
}
