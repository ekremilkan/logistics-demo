"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  EU_CITIES,
  dateFactorOf,
  estimate,
  isValidGermanPostcode,
  pickTruck,
  resolvePlace,
  volumeOf,
  type Address,
  type Estimate,
  type EstimateInput,
  type Extras,
} from "@/lib/estimator";
import { fill, useI18n } from "@/lib/i18n";
import { Photo } from "@/components/ui/Photo";
import { EASE_PLACE, useReducedMotion } from "@/components/ui/motion";
import { CheckBox, Segmented, Stepper } from "./controls";

export type Update = (patch: (draft: EstimateInput) => void) => void;

export interface StepProps {
  input: EstimateInput;
  est: Estimate;
  update: Update;
  onAutoAdvance?: () => void;
}

/* ───────────────────────────── 01 · Type ───────────────────────────── */

export function TypeStep({ input, update, onAutoAdvance }: StepProps) {
  const { t } = useI18n();
  const s = t.estimator.steps.type;
  const options = [
    { value: "private" as const, title: s.private, sub: s.privateSub, photo: "newHome" as const, code: "PRV" },
    { value: "office" as const, title: s.office, sub: s.officeSub, photo: "office" as const, code: "BÜRO" },
  ];
  return (
    <div role="radiogroup" aria-label={s.q} className="grid grid-cols-2 gap-3 sm:gap-5">
      {options.map((o) => {
        const on = input.moveType === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              update((d) => {
                if (d.moveType !== o.value) {
                  d.moveType = o.value;
                  d.rooms = null;
                  d.sqm = null;
                }
              });
              onAutoAdvance?.();
            }}
            className={`group relative flex flex-col border-2 text-left transition-colors ${
              on ? "border-signal" : "border-paper/20 hover:border-paper/60"
            }`}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[4/3]">
              <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-place)] group-hover:scale-[1.03]">
                <Photo name={o.photo} alt="" sizes="(min-width:1024px) 25vw, 50vw" width={900} />
              </div>
              <span className="label absolute left-2 top-2 z-10 bg-asphalt px-1.5 py-0.5 text-paper">{o.code}</span>
            </div>
            <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
              <div>
                <div className="font-semi-expanded text-xl font-extrabold leading-none tracking-tight sm:text-3xl">
                  {o.title}
                </div>
                <div className="mt-1.5 text-sm text-paper/60">{o.sub}</div>
              </div>
              <CheckBox on={on} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────────── 02 · Route ───────────────────────────── */

function PostcodeField({
  id,
  label,
  address,
  onChange,
}: {
  id: string;
  label: string;
  address: Address;
  onChange: (v: string) => void;
}) {
  const { t } = useI18n();
  const s = t.estimator.steps.route;
  const value = address.postcode ?? "";
  const place = resolvePlace("DE", address.postcode);
  const invalid = value.length === 5 && !isValidGermanPostcode(value);
  return (
    <div>
      <label htmlFor={id} className="label flex justify-between text-paper/60">
        <span>
          <span className="text-signal">{label}</span> · {s.plz}
        </span>
        <span>DE</span>
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="postal-code"
        pattern="[0-9]*"
        maxLength={5}
        placeholder={s.placeholder}
        value={value}
        aria-invalid={invalid}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
        className="tnum mt-1 w-full border-b-2 border-paper/30 bg-transparent py-2 font-mono text-[2.6rem] font-medium leading-none tracking-[0.12em] text-paper placeholder:text-paper/15 focus:border-signal focus:outline-none sm:text-5xl"
      />
      <div id={`${id}-hint`} className="label mt-2 h-4" aria-live="polite">
        {place ? (
          <span className="text-paper">✓ {place.name}</span>
        ) : invalid ? (
          <span className="text-signal">{s.invalid}</span>
        ) : null}
      </div>
    </div>
  );
}

export function RouteStep({ input, est, update }: StepProps) {
  const { t, n } = useI18n();
  const s = t.estimator.steps.route;
  const reduce = useReducedMotion();
  const abroad = input.to.country !== "DE";
  const both = !!est.from && !!est.to;

  return (
    <div className="grid gap-8">
      <div className="grid gap-8 sm:grid-cols-[1fr_auto_1fr] sm:items-start sm:gap-6">
        <PostcodeField
          id="from-plz"
          label={s.from}
          address={input.from}
          onChange={(v) => update((d) => void (d.from.postcode = v || null))}
        />

        {/* Route connector */}
        <div className="hidden w-28 flex-col items-center pt-9 sm:flex" aria-hidden="true">
          <svg viewBox="0 0 112 24" className="w-full">
            <path d="M4 12 H108" stroke="var(--color-paper)" strokeOpacity={0.2} strokeWidth={2} strokeDasharray="3 4" />
            <motion.path
              d="M4 12 H108"
              stroke="var(--color-signal)"
              strokeWidth={3}
              initial={false}
              animate={{ pathLength: both ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.8, ease: EASE_PLACE }}
            />
            <rect x={0} y={8} width={8} height={8} fill="var(--color-paper)" />
            <rect x={104} y={8} width={8} height={8} fill={both ? "var(--color-signal)" : "var(--color-paper)"} />
          </svg>
          <span className="label mt-2 text-paper/70">{both ? `${n(est.distanceKm)} km` : "— km"}</span>
        </div>

        <div>
          <Segmented
            label={s.to}
            className="mb-4 w-full"
            value={abroad ? "eu" : "de"}
            options={[
              { value: "de", label: s.germany },
              { value: "eu", label: s.abroad },
            ]}
            onChange={(v) =>
              update((d) => {
                if (v === "de" && d.to.country !== "DE") d.to = { ...d.to, country: "DE", postcode: null };
                if (v === "eu" && d.to.country === "DE") d.to = { ...d.to, country: "NL", postcode: null };
              })
            }
          />
          {abroad ? (
            <div>
              <div className="label text-paper/60">
                <span className="text-signal">{s.to}</span> · {s.chooseCity}
              </div>
              <div role="radiogroup" aria-label={s.chooseCity} className="mt-3 flex flex-wrap gap-1.5">
                {EU_CITIES.map((c) => {
                  const on = input.to.postcode === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => update((d) => void (d.to = { ...d.to, country: c.country, postcode: c.key }))}
                      className={`min-h-10 border px-2.5 text-sm transition-colors ${
                        on ? "border-signal bg-signal text-asphalt" : "border-paper/25 text-paper/80 hover:border-paper/60"
                      }`}
                    >
                      <span className="label mr-1.5 opacity-60">{c.country}</span>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <PostcodeField
              id="to-plz"
              label={s.to}
              address={input.to}
              onChange={(v) => update((d) => void (d.to.postcode = v || null))}
            />
          )}
        </div>
      </div>
      <div className="label flex items-center gap-2 text-paper/60 sm:hidden">
        <span className="h-px flex-1 bg-paper/20" />
        {s.distance}: <span className="text-paper">{both ? `${n(est.distanceKm)} km` : "—"}</span>
        <span className="h-px flex-1 bg-paper/20" />
      </div>
    </div>
  );
}

/* ───────────────────────────── 03 · Size ───────────────────────────── */

const RANGES = {
  private: { rooms: [1, 8, 1], sqm: [20, 300, 5] },
  office: { rooms: [2, 80, 1], sqm: [40, 1500, 10] },
} as const;

/** Plan view of the truck's cargo bed, one cell per m³. */
function CargoBed({ volume }: { volume: number }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const { truck, count } = pickTruck(volume);
  const cap = truck.capacityM3 * count;
  const cols = cap > 40 ? 15 : 10;
  return (
    <div aria-hidden="true">
      <div className="label flex justify-between text-paper/55">
        <span>
          {t.estimator.label.truck} · {count > 1 ? `${count}× ` : ""}
          {truck.weight}
        </span>
        <span className="tnum">
          {volume} / {cap} m³
        </span>
      </div>
      <div className="mt-2 flex items-stretch">
        <div className="grid flex-1 gap-[3px] border-2 border-paper/35 p-[5px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cap }, (_, i) => (
            <motion.span
              key={`${cap}-${i}`}
              className="aspect-square"
              initial={false}
              animate={{ backgroundColor: i < volume ? "var(--color-kraft)" : "rgba(242,241,236,0.07)" }}
              transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : Math.min(i, 60) * 0.006 }}
            />
          ))}
        </div>
        {/* Cab */}
        <div className="ml-1 w-[12%] max-w-10 border-2 border-l-0 border-paper/35" />
      </div>
    </div>
  );
}

export function SizeStep({ input, update }: StepProps) {
  const { t } = useI18n();
  const s = t.estimator.steps.size;
  const type = input.moveType ?? "private";
  const mode = input.sizeMode;
  const [min, max, step] = RANGES[type][mode];
  const fallback = mode === "rooms" ? (type === "office" ? 12 : 3) : type === "office" ? 220 : 75;
  const value = (mode === "rooms" ? input.rooms : input.sqm) ?? fallback;
  const set = (v: number) => update((d) => void (mode === "rooms" ? (d.rooms = v) : (d.sqm = v)));
  const volume = volumeOf({ ...input, rooms: input.rooms ?? fallback, sqm: input.sqm ?? fallback });
  const unit = mode === "rooms" ? (type === "office" ? s.roomsOffice : s.rooms) : s.sqm;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-10">
      <div>
        <Segmented
          label={s.q}
          value={mode}
          options={[
            { value: "rooms", label: type === "office" ? s.roomsOffice : s.rooms },
            { value: "sqm", label: s.sqm },
          ]}
          onChange={(m) =>
            update((d) => {
              d.sizeMode = m;
            })
          }
        />
        <div className="mt-6 flex items-end gap-4">
          <Stepper value={value} min={min} max={max} step={step} onChange={set} label={unit} less={s.less} more={s.more} />
          <span className="label pb-3 text-paper/60">{unit}</span>
        </div>
        <input
          type="range"
          className="tape-range mt-4"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={unit}
          onChange={(e) => set(Number(e.target.value))}
        />
        {/* Ruler */}
        <div className="-mt-3 flex justify-between" aria-hidden="true">
          {Array.from({ length: 21 }, (_, i) => (
            <span key={i} className={`w-px bg-paper/35 ${i % 5 === 0 ? "h-3" : "h-1.5"}`} />
          ))}
        </div>
        <div className="label mt-1 flex justify-between text-paper/45" aria-hidden="true">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <div>
        <p className="label mb-3 text-paper">{fill(s.volumeHint, { v: volume })}</p>
        <CargoBed volume={volume} />
      </div>
    </div>
  );
}

/* ───────────────────────────── 04 · Floors ───────────────────────────── */

const FLOORS = [6, 5, 4, 3, 2, 1, 0];

function Building({
  label,
  address,
  onFloor,
  onElevator,
}: {
  label: string;
  address: Address;
  onFloor: (f: number) => void;
  onElevator: (e: boolean) => void;
}) {
  const { t } = useI18n();
  const s = t.estimator.steps.floors;
  const floor = address.floor;
  const lift = address.elevator;
  return (
    <fieldset className="min-w-0">
      <legend className="label mb-3 text-paper/60">
        <span className="text-signal">{label}</span> · {s.floor} {floor === null ? "—" : floor === 0 ? s.ground : floor}
      </legend>
      <div className="flex gap-2">
        <div role="radiogroup" aria-label={`${label}: ${s.floor}`} className="flex flex-1 flex-col border-2 border-paper/35">
          {/* Roof */}
          <div className="h-2 bg-paper/35" aria-hidden="true" />
          {FLOORS.map((f) => {
            const on = floor === f;
            const below = floor !== null && f < floor;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${s.floor} ${f === 0 ? s.ground : f}`}
                onClick={() => onFloor(f)}
                className={`flex h-10 items-center justify-between border-t border-paper/15 px-3 font-mono text-sm transition-colors sm:h-11 ${
                  on ? "bg-signal text-asphalt" : below ? "bg-paper/[0.08] text-paper/70" : "text-paper/50 hover:bg-paper/5"
                }`}
              >
                <span>{f === 0 ? s.ground : `${f}.`}</span>
                {/* Stairs climbed without a lift */}
                <span aria-hidden="true" className="flex gap-[2px]">
                  {(on || below) && !lift && Array.from({ length: 3 }, (_, i) => <span key={i} className="h-2 w-[3px] bg-current opacity-60" />)}
                </span>
              </button>
            );
          })}
        </div>
        {/* Lift shaft */}
        <div className="flex w-9 flex-col border-2 border-paper/35 sm:w-11" aria-hidden="true">
          <div className="relative flex-1">
            {lift && floor !== null && (
              <motion.span
                className="absolute inset-x-1 h-[calc(100%/7-6px)] bg-paper"
                initial={false}
                animate={{ top: `calc(${(FLOORS.indexOf(floor) / 7) * 100}% + 3px)` }}
                transition={{ duration: 0.6, ease: EASE_PLACE }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="label text-paper/60">{s.elevator}</span>
        <Segmented
          className="w-full sm:w-auto"
          label={`${label}: ${s.elevator}`}
          value={lift === null ? null : lift ? "yes" : "no"}
          options={[
            { value: "yes", label: s.yes },
            { value: "no", label: s.no },
          ]}
          onChange={(v) => onElevator(v === "yes")}
        />
      </div>
    </fieldset>
  );
}

export function FloorsStep({ input, update }: StepProps) {
  const { t } = useI18n();
  const s = t.estimator.steps.floors;
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:gap-10">
        {(["from", "to"] as const).map((k) => (
          <Building
            key={k}
            label={s.at[k]}
            address={input[k]}
            onFloor={(f) => update((d) => void (d[k].floor = f))}
            onElevator={(e) => update((d) => void (d[k].elevator = e))}
          />
        ))}
      </div>
      <p className="mt-6 text-paper/60">{s.hint}</p>
    </div>
  );
}

/* ───────────────────────────── 05 · Extras ───────────────────────────── */

export function ExtrasStep({ input, est, update }: StepProps) {
  const { t, eur } = useI18n();
  const s = t.estimator.steps.extras;

  /** What an extra adds to the point estimate at the given setting. */
  const delta = (key: keyof Extras, onValue: boolean | number) => {
    const offValue = typeof onValue === "boolean" ? false : 0;
    const on = estimate({ ...input, extras: { ...input.extras, [key]: onValue } }).total;
    const off = estimate({ ...input, extras: { ...input.extras, [key]: offValue } }).total;
    return Math.max(0, on - off);
  };

  const rows: {
    key: keyof Extras;
    title: string;
    sub: string;
    kind: "toggle" | "count";
    max?: number;
    unit?: string;
    code: string;
  }[] = [
    { key: "packing", title: s.packing, sub: s.packingSub, kind: "toggle", code: "PCK" },
    { key: "assembly", title: s.assembly, sub: s.assemblySub, kind: "toggle", code: "MNT" },
    { key: "storageWeeks", title: s.storage, sub: s.storageSub, kind: "count", max: 12, unit: s.weeks, code: "LGR" },
    { key: "heavyItems", title: s.heavy, sub: s.heavySub, kind: "count", max: 3, unit: s.pieces, code: "SWL" },
  ];

  const setExtra = (key: keyof Extras, v: boolean | number) =>
    update((d) => {
      (d.extras as unknown as Record<string, boolean | number>)[key] = v;
    });

  return (
    <ul className="border-t border-paper/20">
      {rows.map((r) => {
        const value = input.extras[r.key];
        const on = r.kind === "toggle" ? (value as boolean) : (value as number) > 0;
        const price = r.kind === "toggle" ? delta(r.key, true) : delta(r.key, Math.max(1, value as number));
        return (
          <li key={r.key} className="border-b border-paper/20">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
              <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => setExtra(r.key, r.kind === "toggle" ? !on : on ? 0 : 1)}
                className="flex min-h-12 min-w-0 flex-1 items-center gap-4 text-left"
              >
                <CheckBox on={on} />
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span className="font-semi-expanded text-lg font-extrabold tracking-tight sm:text-xl">{r.title}</span>
                    <span className="label hidden text-paper/40 sm:inline">{r.code}</span>
                  </span>
                  <span className="block text-sm text-paper/60">{r.sub}</span>
                </span>
              </button>
              <div
                className={`flex items-center justify-between gap-4 ${
                  r.kind === "count" ? "w-full pl-11 sm:w-auto sm:pl-0" : "ml-auto"
                }`}
              >
                {r.kind === "count" && (
                  <Stepper
                    size="sm"
                    value={value as number}
                    min={0}
                    max={r.max!}
                    onChange={(v) => setExtra(r.key, v)}
                    label={r.title}
                    less="−1"
                    more="+1"
                    format={(v) => `${v} ${r.unit}`}
                  />
                )}
                <span className={`tnum label w-24 text-right ${on ? "text-signal" : "text-paper/45"}`}>
                  + {eur(price)}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ───────────────────────────── 06 · Date ───────────────────────────── */

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function DateStep({ input, update }: StepProps) {
  const { t, locale } = useI18n();
  const s = t.estimator.steps.date;
  const [page, setPage] = useState(0);
  const reduce = useReducedMotion();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);
  const loc = locale === "de" ? "de-DE" : "en-GB";

  // 3 weeks per page, starting on the Monday of the week 3 days from now.
  const start = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 3);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + page * 21);
    return d;
  }, [today, page]);
  const days = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const earliest = new Date(today);
  earliest.setDate(today.getDate() + 3);
  const weekday = new Intl.DateTimeFormat(loc, { weekday: "short" });
  const monthFmt = new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" });
  const fullFmt = new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="font-mono text-sm uppercase tracking-[0.08em] text-paper/80">{monthFmt.format(days[10])}</div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label={s.prev}
            className="flex size-11 items-center justify-center border border-paper/30 font-mono disabled:opacity-25"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(8, p + 1))}
            aria-label={s.nextWeeks}
            className="flex size-11 items-center justify-center border border-paper/30 font-mono"
          >
            →
          </button>
        </div>
      </div>

      <div className="label mt-4 grid grid-cols-7 gap-1 text-center text-paper/45" aria-hidden="true">
        {days.slice(0, 7).map((d) => (
          <span key={d.toISOString()}>{weekday.format(d).replace(".", "")}</span>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={page}
          className="mt-1.5 grid grid-cols-7 gap-1"
          initial={{ opacity: 0, x: reduce ? 0 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduce ? 0 : -16 }}
          transition={{ duration: 0.25, ease: EASE_PLACE }}
        >
          {days.map((d) => {
            const key = iso(d);
            const disabled = d < earliest;
            const on = input.date === key;
            const { factor } = dateFactorOf(key, false, today);
            const pressure = Math.min(1, Math.max(0, (factor - 1) / 0.25));
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                aria-pressed={on}
                aria-label={`${fullFmt.format(d)}${pressure > 0.3 ? ` · ${s.legendPeak}` : ""}`}
                onClick={() => update((dr) => void (dr.date = key))}
                className={`relative flex h-14 flex-col items-center justify-center border transition-colors sm:h-16 ${
                  on
                    ? "border-signal bg-signal text-asphalt"
                    : disabled
                      ? "border-transparent text-paper/20"
                      : "border-paper/15 hover:border-paper/60"
                }`}
              >
                <span className="tnum font-mono text-lg font-medium leading-none sm:text-xl">{d.getDate()}</span>
                {!disabled && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-1.5 bottom-1.5 h-1 ${on ? "bg-asphalt/60" : ""}`}
                    style={on ? undefined : { backgroundColor: `color-mix(in srgb, var(--color-kraft) ${Math.round(18 + pressure * 82)}%, transparent)` }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="label mt-3 flex items-center gap-4 text-paper/55" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-5" style={{ backgroundColor: "color-mix(in srgb, var(--color-kraft) 18%, transparent)" }} /> {s.legendCalm}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-5 bg-kraft" /> {s.legendPeak}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={input.flexibleDate}
        onClick={() => update((d) => void (d.flexibleDate = !d.flexibleDate))}
        className="mt-6 flex w-full items-center gap-4 border-t border-paper/20 pt-5 text-left"
      >
        <CheckBox on={input.flexibleDate} />
        <span>
          <span className="font-semi-expanded block text-lg font-extrabold tracking-tight">{s.flexible}</span>
          <span className="block text-sm text-paper/60">{s.flexibleSub}</span>
        </span>
      </button>
    </div>
  );
}
