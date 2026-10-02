"use client";

import { useI18n } from "@/lib/i18n";
import { Arrow } from "@/components/ui/marks";
import { Wordmark } from "./Header";

export function Footer() {
  const { t } = useI18n();
  const f = t.footer;
  const tape = Array.from({ length: 8 }, () => f.tape).join("   ✕   ");

  return (
    <footer className="relative overflow-hidden bg-asphalt text-paper">
      {/* Warning-tape band */}
      <div className="relative -mx-4 -rotate-[1.2deg] border-y-2 border-asphalt bg-signal py-2.5 text-asphalt">
        <div className="label whitespace-nowrap font-semibold" aria-hidden="true">
          {tape}
        </div>
      </div>
      <div className="tape-hatch h-3" aria-hidden="true" />

      <div className="wrap grid gap-12 pb-10 pt-16 sm:grid-cols-2 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-5">
          <p className="font-semi-expanded max-w-[20ch] text-2xl font-extrabold leading-tight tracking-tight">{f.tagline}</p>
          <a href="#top" className="label mt-8 inline-flex items-center gap-2 text-paper/60 hover:text-paper">
            {f.top} <Arrow dir="up" className="size-3.5" />
          </a>
        </div>
        <nav aria-label={f.columns.services} className="lg:col-span-3 lg:col-start-7">
          <div className="label text-paper/45">{f.columns.services}</div>
          <ul className="mt-4 space-y-2">
            {t.services.items.map((s) => (
              <li key={s.title}>
                <a href="#services" className="text-paper/80 hover:text-signal">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-3">
          <div className="label text-paper/45">{f.columns.legal}</div>
          <ul className="mt-4 space-y-2">
            {f.legal.map((l) => (
              <li key={l} className="text-paper/80">
                {l}
              </li>
            ))}
          </ul>
          <address className="mt-8 not-italic text-paper/60">
            {t.contact.street}
            <br />
            {t.contact.city}
          </address>
        </div>
      </div>

      <div className="wrap label flex flex-col gap-2 border-t border-paper/15 py-5 text-paper/50 sm:flex-row sm:justify-between">
        <span>© 1987–2026 Hafenkraft Umzüge & Transporte GmbH</span>
        <span className="text-paper/70">{f.concept}</span>
      </div>

      {/* Giant wordmark, cropped by the bottom edge like a box marking running off the side. */}
      <div aria-hidden="true" className="pointer-events-none h-[8.2vw] select-none overflow-hidden">
        <Wordmark className="-ml-[0.04em] block whitespace-nowrap text-[10.6vw] leading-[1] text-paper" />
      </div>
    </footer>
  );
}
