"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CITIES, OUTLINE_PATH, arc, project, type CityKey } from "@/lib/geo";
import { haversineKm } from "@/lib/estimator";
import { RULES } from "@/lib/estimator";
import { SectionMark } from "@/components/ui/marks";
import { EASE_PLACE, Reveal, useReducedMotion } from "@/components/ui/motion";

const ROUTES: { from: CityKey; to: CityKey; bow: number }[] = [
  { from: "bremen", to: "muenchen", bow: 0.16 },
  { from: "hamburg", to: "koeln", bow: -0.18 },
  { from: "bremen", to: "berlin", bow: -0.2 },
  { from: "bremen", to: "frankfurt", bow: 0.2 },
  { from: "bremen", to: "dresden", bow: 0.12 },
];

const EU: { code: string; from: [number, number]; to: [number, number] }[] = [
  { code: "NL", from: [6.6, 52.6], to: [5.2, 52.75] },
  { code: "BE", from: [6.0, 50.55], to: [4.8, 50.45] },
  { code: "DK", from: [9.3, 54.95], to: [9.4, 55.55] },
  { code: "PL", from: [14.7, 52.3], to: [16.1, 52.3] },
  { code: "AT", from: [13.2, 47.95], to: [14.6, 47.75] },
  { code: "CH", from: [8.4, 47.7], to: [8.3, 47.12] },
  { code: "FR", from: [7.55, 48.4], to: [6.25, 48.3] },
];

const routeKey = (r: (typeof ROUTES)[number]) => `${r.from}-${r.to}`;

function RouteLine({
  route,
  index,
  start,
  dim,
  highlight,
}: {
  route: (typeof ROUTES)[number];
  index: number;
  start: boolean;
  dim: boolean;
  highlight: boolean;
}) {
  const reduce = useReducedMotion();
  const { d, at } = useMemo(() => arc(route.from, route.to, route.bow), [route]);
  const t = useMotionValue(reduce ? 1 : 0);
  const cx = useTransform(t, (v) => at(v)[0]);
  const cy = useTransform(t, (v) => at(v)[1]);
  const [done, setDone] = useState(!!reduce);

  useEffect(() => {
    if (reduce) {
      t.set(1);
      setDone(true);
      return;
    }
    if (!start) return;
    const c = animate(t, 1, {
      duration: 1.6,
      delay: 0.3 + index * 0.45,
      ease: [0.45, 0.05, 0.25, 1],
      onComplete: () => setDone(true),
    });
    return () => c.stop();
  }, [start, reduce, index, t]);

  const [tx, ty] = project(CITIES[route.to].lon, CITIES[route.to].lat);

  return (
    <g style={{ opacity: dim ? 0.18 : 1, transition: "opacity .4s" }}>
      <path d={d} fill="none" stroke="var(--color-paper)" strokeOpacity={0.22} strokeWidth={1.5} strokeDasharray="3 5" />
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth={highlight ? 4 : 2.75}
        strokeLinecap="square"
        style={{ pathLength: t }}
      />
      {done && (
        <rect x={tx - 6} y={ty - 6} width={12} height={12} fill="var(--color-signal)" stroke="var(--color-asphalt)" strokeWidth={2} />
      )}
      {!done && start && (
        <motion.rect width={10} height={10} x={-5} y={-5} fill="var(--color-paper)" style={{ x: cx, y: cy }} />
      )}
    </g>
  );
}

export function Coverage() {
  const { t, n } = useI18n();
  const c = t.coverage;
  const mapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(mapRef, { once: true, margin: "0px 0px -20% 0px" });
  const [active, setActive] = useState<string | null>(null);

  const board = ROUTES.map((r) => {
    const a = CITIES[r.from];
    const b = CITIES[r.to];
    const km = Math.round(haversineKm(a, b) * RULES.travel.roadFactor);
    const hours = km / RULES.travel.avgSpeedKmh;
    return { ...r, key: routeKey(r), a, b, km, hours, sameDay: hours < 7 };
  });

  const hb = project(CITIES.bremen.lon, CITIES.bremen.lat);

  return (
    <section id="coverage" className="relative bg-asphalt text-paper" aria-labelledby="coverage-title">
      <div className="wrap py-24 lg:py-36">
        <SectionMark n="04" label={c.index} aside="47.3° – 55.1° N" />

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="flex min-w-0 flex-col lg:col-span-5">
            <Reveal>
              <h2
                id="coverage-title"
                className="font-expanded text-[2.6rem] font-extrabold leading-[1] tracking-[-0.04em] sm:text-6xl lg:text-[4.2rem]"
              >
                {c.title}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-paper/70">{c.intro}</p>
            </Reveal>

            {/* Departure board */}
            <Reveal delay={0.12} className="mt-12">
              <div className="label flex items-center justify-between border-b border-paper/25 pb-2 text-paper/55">
                <span className="text-signal">{c.board}</span>
                <span className="hidden sm:inline">
                  {c.columns.km} · {c.columns.time}
                </span>
              </div>
              <ul className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pt-3 sm:mx-0 sm:block sm:overflow-visible sm:px-0 sm:pt-0">
                {board.map((r) => {
                  const on = active === r.key;
                  return (
                    <li key={r.key} className="shrink-0 snap-start sm:border-b sm:border-paper/12">
                      <button
                        type="button"
                        aria-pressed={on}
                        onMouseEnter={() => setActive(r.key)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(r.key)}
                        onBlur={() => setActive(null)}
                        onClick={() => setActive(on ? null : r.key)}
                        className={`grid w-full grid-cols-[auto_auto] items-baseline gap-x-4 gap-y-1 border border-paper/15 px-3 py-3 text-left transition-colors sm:grid-cols-[6rem_1fr_auto_4.5rem] sm:border-0 sm:px-2 sm:py-3.5 ${
                          on ? "bg-signal text-asphalt" : "hover:bg-paper/5"
                        }`}
                      >
                        <span className="font-mono text-base font-semibold tracking-tight">
                          {r.a.code} → {r.b.code}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm ${on ? "text-asphalt/80" : "text-paper/70"}`}>
                            {r.a.name} – {r.b.name}
                          </span>
                          <span className={`label mt-0.5 block ${on ? "" : r.sameDay ? "text-paper/45" : "text-kraft"}`}>
                            {r.sameDay ? c.sameDay : c.overnight}
                          </span>
                        </span>
                        <span className="tnum label">
                          {n(r.km)} {t.units.km}
                        </span>
                        <span className="tnum label sm:text-right">≈ {n(Math.round(r.hours * 10) / 10)} h</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal delay={0.16} className="mt-10 lg:mt-auto lg:pt-12">
              <div className="flex gap-4 border-l-4 border-signal pl-4">
                <div>
                  <div className="font-semi-expanded text-xl font-extrabold tracking-tight">{c.eu}</div>
                  <p className="mt-1 max-w-[44ch] text-paper/65">{c.euText}</p>
                </div>
              </div>
            </Reveal>
          </div>

          <div ref={mapRef} className="relative min-w-0 lg:col-span-7">
            <svg
              viewBox="-90 -60 780 920"
              className="mx-auto block h-auto w-full max-w-[40rem] lg:max-h-[88vh]"
              role="img"
              aria-label={c.mapLabel}
            >
              {/* Graticule */}
              <g stroke="var(--color-paper)" strokeOpacity={0.07} strokeWidth={1}>
                {[48, 49, 50, 51, 52, 53, 54, 55].map((lat) => {
                  const [, y] = project(6, lat);
                  return <line key={lat} x1={-90} x2={690} y1={y} y2={y} />;
                })}
                {[6, 8, 10, 12, 14, 16].map((lon) => {
                  const [x] = project(lon, 50);
                  return <line key={lon} y1={-60} y2={860} x1={x} x2={x} />;
                })}
              </g>
              <g className="font-mono" fontSize={13} fill="var(--color-paper)" fillOpacity={0.35}>
                {[48, 50, 52, 54].map((lat) => (
                  <text key={lat} x={-84} y={project(6, lat)[1] - 6}>
                    {lat}°N
                  </text>
                ))}
                {[6, 10, 14].map((lon) => (
                  <text key={lon} x={project(lon, 50)[0] + 6} y={852}>
                    {lon}°E
                  </text>
                ))}
              </g>

              {/* Country */}
              <motion.path
                d={OUTLINE_PATH}
                fill="var(--color-asphalt-2)"
                stroke="var(--color-paper)"
                strokeOpacity={0.55}
                strokeWidth={1.5}
                strokeLinejoin="bevel"
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={inView ? { pathLength: 1, fillOpacity: 1 } : {}}
                transition={{ duration: 1.4, ease: EASE_PLACE }}
              />

              {/* EU arrows */}
              <g>
                {EU.map((e, i) => {
                  const [x1, y1] = project(...e.from);
                  const [x2, y2] = project(...e.to);
                  const ang = Math.atan2(y2 - y1, x2 - x1);
                  const ah = 9;
                  const p1 = [x2 - ah * Math.cos(ang - 0.5), y2 - ah * Math.sin(ang - 0.5)];
                  const p2 = [x2 - ah * Math.cos(ang + 0.5), y2 - ah * Math.sin(ang + 0.5)];
                  const lx = x2 + Math.cos(ang) * 22;
                  const ly = y2 + Math.sin(ang) * 22 + 5;
                  return (
                    <motion.g
                      key={e.code}
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 2.4 + i * 0.08, duration: 0.5 }}
                    >
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-kraft)" strokeWidth={1.5} strokeDasharray="4 4" />
                      <path d={`M${x2} ${y2}L${p1[0]} ${p1[1]}M${x2} ${y2}L${p2[0]} ${p2[1]}`} stroke="var(--color-kraft)" strokeWidth={1.5} />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        className="font-mono"
                        fontSize={15}
                        fontWeight={600}
                        fill="var(--color-kraft)"
                      >
                        {e.code}
                      </text>
                    </motion.g>
                  );
                })}
              </g>

              {/* Routes */}
              {ROUTES.map((r, i) => (
                <RouteLine
                  key={routeKey(r)}
                  route={r}
                  index={i}
                  start={inView}
                  dim={active !== null && active !== routeKey(r)}
                  highlight={active === routeKey(r)}
                />
              ))}

              {/* Cities */}
              <g className="font-mono" fontSize={14} fill="var(--color-paper)">
                {(Object.keys(CITIES) as CityKey[])
                  .filter((k) => k !== "bremen")
                  .map((k) => {
                    const [x, y] = project(CITIES[k].lon, CITIES[k].lat);
                    const left = ["koeln", "frankfurt", "stuttgart"].includes(k);
                    return (
                      <g key={k}>
                        <circle cx={x} cy={y} r={3.5} fill="var(--color-paper)" />
                        <text x={left ? x - 10 : x + 10} y={y + 5} textAnchor={left ? "end" : "start"} fillOpacity={0.8}>
                          {CITIES[k].name.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
              </g>

              {/* HQ */}
              <g>
                <rect x={hb[0] - 9} y={hb[1] - 9} width={18} height={18} fill="var(--color-signal)" />
                <rect x={hb[0] - 3} y={hb[1] - 3} width={6} height={6} fill="var(--color-asphalt)" />
                <text x={hb[0] - 16} y={hb[1] - 2} textAnchor="end" className="font-expanded" fontSize={22} fontWeight={800} fill="var(--color-paper)">
                  BREMEN
                </text>
                <text x={hb[0] - 16} y={hb[1] + 16} textAnchor="end" className="font-mono" fontSize={12} fill="var(--color-paper)" fillOpacity={0.55}>
                  53.08°N 8.80°E · HQ
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
