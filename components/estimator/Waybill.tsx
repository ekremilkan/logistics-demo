"use client";

import { motion } from "framer-motion";
import type { Estimate, EstimateInput } from "@/lib/estimator";
import { useI18n } from "@/lib/i18n";
import { Arrow, Barcode, Fragile, ThisSideUp } from "@/components/ui/marks";
import { EASE_PLACE, useReducedMotion } from "@/components/ui/motion";
import type { Contact } from "./QuoteStep";
import { PriceRange, useEstimateText } from "./LiveLabel";

export function Waybill({
  input,
  est,
  contact,
  reference,
  issued,
  onReset,
}: {
  input: EstimateInput;
  est: Estimate;
  contact: Contact;
  reference: string;
  issued: Date;
  onReset: () => void;
}) {
  const { t, locale, n } = useI18n();
  const d = t.estimator.done;
  const L = t.estimator.label;
  const s = t.estimator.steps;
  const x = useEstimateText(input, est);
  const reduce = useReducedMotion();
  const loc = locale === "de" ? "de-DE" : "en-GB";

  const floorText = (a: EstimateInput["from"]) =>
    `${s.floors.floor} ${a.floor === 0 ? s.floors.ground : a.floor ?? "—"} · ${s.floors.elevator} ${
      a.elevator ? s.floors.yes : s.floors.no
    }`;
  const extras = [
    input.extras.packing && s.extras.packing,
    input.extras.assembly && s.extras.assembly,
    input.extras.storageWeeks > 0 && `${s.extras.storage} (${input.extras.storageWeeks} ${s.extras.weeks})`,
    input.extras.heavyItems > 0 && `${s.extras.heavy} (${input.extras.heavyItems} ${s.extras.pieces})`,
  ].filter(Boolean) as string[];
  const size =
    input.sizeMode === "rooms"
      ? `${input.rooms} ${input.moveType === "office" ? s.size.roomsOffice : s.size.rooms}`
      : `${input.sqm} m²`;
  const place = (p: Estimate["from"], pc: string | null) =>
    p ? `${p.country === "DE" ? `${pc} ` : `${p.country} · `}${p.name}` : "—";

  return (
    <div>
      <motion.div
        initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", y: reduce ? 0 : -12 }}
        animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
        transition={{ duration: 1.1, ease: EASE_PLACE }}
        className="paper-fibre relative mx-auto max-w-4xl border-2 border-asphalt text-asphalt"
        aria-live="polite"
      >
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto] border-b-2 border-asphalt">
          <div className="p-4 sm:p-6">
            <div className="label text-asphalt/60">Hafenkraft Umzüge & Transporte GmbH · {L.title}</div>
            <h3 className="font-expanded mt-3 max-w-[18ch] text-[1.9rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl">
              {d.title}
            </h3>
          </div>
          <div className="kraft-paper flex w-16 flex-col items-center justify-center gap-2 border-l-2 border-asphalt text-asphalt sm:w-28">
            <ThisSideUp className="size-9 sm:size-12" />
            <Fragile className="size-7 sm:size-9" />
          </div>
        </div>

        {/* Reference */}
        <div className="grid border-b-2 border-asphalt sm:grid-cols-[1.2fr_1fr]">
          <div className="border-b border-asphalt/40 p-4 sm:border-b-0 sm:border-r sm:p-6">
            <div className="label text-asphalt/60">{d.reference}</div>
            <div className="tnum mt-1 font-mono text-[1.7rem] font-semibold tracking-[0.04em] sm:text-4xl">{reference}</div>
            <Barcode seed={reference} className="mt-3 h-12 w-full max-w-sm" bars={60} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1">
            <div className="border-r border-asphalt/40 p-4 sm:border-b sm:border-r-0 sm:px-6">
              <div className="label text-asphalt/60">{d.issued}</div>
              <div className="tnum font-mono">
                {new Intl.DateTimeFormat(loc, { dateStyle: "medium", timeStyle: "short" }).format(issued)}
              </div>
            </div>
            <div className="min-w-0 p-4 sm:px-6">
              <div className="label text-asphalt/60">{d.customer}</div>
              <div className="truncate font-medium">{contact.name}</div>
              <div className="truncate text-sm text-asphalt/70">{contact.email}</div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid border-b-2 border-asphalt sm:grid-cols-2">
          {(
            [
              [d.sender, est.from, input.from],
              [d.recipient, est.to, input.to],
            ] as const
          ).map(([label, p, a], i) => (
            <div key={label} className={`p-4 sm:p-6 ${i === 0 ? "border-b border-asphalt/40 sm:border-b-0 sm:border-r" : ""}`}>
              <div className="label text-asphalt/60">{label}</div>
              <div className="font-semi-expanded mt-1 text-2xl font-extrabold tracking-tight">{place(p, a.postcode)}</div>
              <div className="label mt-1 text-asphalt/70">{floorText(a)}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <dl className="grid grid-cols-2 border-b-2 border-asphalt sm:grid-cols-4">
          {[
            [d.goods, `${size} · ${n(est.volumeM3)} m³`],
            [L.truck, `${x.truck} · ${x.crew}`],
            [L.duration, `${x.duration} · ${x.km}`],
            [L.date, x.date ?? "—"],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`p-4 sm:px-6 ${i % 2 === 0 ? "border-r border-asphalt/40" : "sm:border-r"} ${
                i < 2 ? "border-b border-asphalt/40 sm:border-b-0" : ""
              } ${i === 3 ? "sm:border-r-0" : ""}`}
            >
              <dt className="label text-asphalt/60">{k}</dt>
              <dd className="mt-1 font-mono text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="grid sm:grid-cols-[1fr_1.3fr]">
          <div className="border-b border-asphalt/40 p-4 sm:border-b-0 sm:border-r sm:p-6">
            <div className="label text-asphalt/60">{d.extras}</div>
            <ul className="mt-2 space-y-1">
              {extras.length ? extras.map((e) => <li key={e}>— {e}</li>) : <li className="text-asphalt/50">{d.none}</li>}
            </ul>
          </div>
          <div className="relative p-4 sm:p-6">
            <div className="label text-asphalt/60">{d.estimate}</div>
            <div className="mt-2 text-[2.2rem] leading-none sm:text-5xl">
              <PriceRange est={est} />
            </div>
            <div className="label mt-2 normal-case tracking-[0.02em] text-asphalt/60">{L.priceNote}</div>

            {/* Stamp */}
            <motion.div
              aria-hidden="true"
              className="absolute -top-8 right-4 border-[3px] border-asphalt p-[3px] sm:-top-12 sm:right-8"
              initial={{ opacity: 0, scale: reduce ? 1 : 1.6, rotate: -14 }}
              animate={{ opacity: 0.9, scale: 1, rotate: -8 }}
              transition={{ delay: reduce ? 0 : 1.1, duration: 0.28, ease: [0.6, 0, 0.9, 0.4] }}
            >
              <div className="font-expanded border border-asphalt bg-signal/80 px-3 py-1.5 text-lg font-black uppercase tracking-tight sm:text-2xl">
                {d.stamp}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[52ch]">
          <p className="text-lg leading-relaxed text-paper/80">{d.text}</p>
          <p className="label mt-3 text-signal">{d.demo}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="group label flex min-h-12 shrink-0 items-center gap-2 border-2 border-paper/40 px-5 hover:border-paper"
        >
          {d.again} <Arrow className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
