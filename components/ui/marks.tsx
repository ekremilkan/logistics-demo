/** Small, reusable pieces of the waybill design language. */

/** Deterministic Code-128-ish barcode drawn from a seed string. */
export function Barcode({ seed, className = "", bars = 46 }: { seed: string; className?: string; bars?: number }) {
  let h = 2166136261;
  const widths: number[] = [];
  for (let i = 0; i < bars; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i % seed.length) ^ i, 16777619);
    widths.push(1 + ((h >>> 0) % 4));
  }
  const total = widths.reduce((a, b) => a + b, 0);
  let x = 0;
  return (
    <svg viewBox={`0 0 ${total} 40`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {widths.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} fill="currentColor" /> : null;
        x += w;
        return rect;
      })}
    </svg>
  );
}

/** Two upward arrows over a bar — "this side up". */
export function ThisSideUp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="currentColor">
      <path d="M6 22 13 8l7 14h-5v8h-4v-8zM20 22 27 8l7 14h-5v8h-4v-8z" />
      <rect x="4" y="33" width="32" height="3" />
    </svg>
  );
}

/** Wine glass — "fragile". */
export function Fragile({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M11 4h18c0 10-3 16-9 16S11 14 11 4zM20 20v12M13 34h14" />
      <path d="M17 6l5 5-3 2 4 4" strokeWidth="1.6" />
    </svg>
  );
}

/** Mono-weight arrow used in links and CTAs. */
export function Arrow({ className = "", dir = "right" }: { className?: string; dir?: "right" | "down" | "up" | "left" }) {
  const rot = { right: 0, down: 90, left: 180, up: -90 }[dir];
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ transform: `rotate(${rot}deg)` }}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <path d="M3 12h17M14 5l7 7-7 7" />
    </svg>
  );
}

/**
 * Section header styled as a box marking:
 * `02 / KOSTENRECHNER ——————— 53.0793° N · 8.8017° E`
 */
export function SectionMark({
  n,
  label,
  aside,
  tone = "dark",
  className = "",
}: {
  n: string;
  label: string;
  aside?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const muted = tone === "dark" ? "text-paper/55" : "text-asphalt/55";
  const rule = tone === "dark" ? "bg-paper/20" : "bg-asphalt/20";
  return (
    <div className={`label flex items-center gap-3 ${className}`}>
      <span className={tone === "dark" ? "text-signal" : "text-asphalt"}>{n}</span>
      <span className={muted}>/</span>
      <span>{label}</span>
      <span className={`h-px flex-1 ${rule}`} />
      {aside && <span className={`hidden sm:inline ${muted}`}>{aside}</span>}
    </div>
  );
}
