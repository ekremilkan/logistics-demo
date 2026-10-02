"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import { Arrow } from "@/components/ui/marks";
import { EASE_PLACE } from "@/components/ui/motion";

const LINKS = ["services", "estimator", "process", "coverage", "trust", "faq", "contact"] as const;

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-expanded font-black uppercase tracking-[-0.02em] ${className}`}>Hafenkraft</span>;
}

function LangToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="group" aria-label={t.nav.language} className={`label flex items-center ${className}`}>
      {(["de", "en"] as Locale[]).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1 text-paper/30">|</span>}
          <button
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            lang={l}
            className={`min-h-11 min-w-9 px-1 transition-colors ${
              locale === l ? "text-signal" : "text-paper/60 hover:text-paper"
            }`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="label sr-only z-[60] bg-signal px-4 py-3 text-asphalt focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.nav.skip}
      </a>
      <header className="sticky top-0 z-50 border-b border-paper/12 bg-asphalt/95 text-paper backdrop-blur-[2px] supports-[backdrop-filter]:bg-asphalt/90">
        <div className="wrap flex h-16 items-center gap-4">
          <a href="#top" aria-label={t.nav.home} className="flex items-baseline gap-3">
            <Wordmark className="text-[1.05rem] sm:text-xl" />
            <span className="label hidden text-paper/50 xl:inline">Est. 1987 · HB</span>
          </a>

          <nav aria-label="Primary" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-6">
              {LINKS.filter((l) => l !== "estimator").map((l) => (
                <li key={l}>
                  <a href={`#${l}`} className="label text-paper/70 transition-colors hover:text-paper">
                    {t.nav[l]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <LangToggle className="ml-auto hidden sm:flex lg:ml-2" />

          <a
            href="#estimator"
            className="group label ml-auto flex h-10 items-center gap-2 bg-signal px-3 font-medium text-asphalt transition-colors hover:bg-paper sm:ml-0 sm:px-4"
          >
            <span className="hidden sm:inline">{t.nav.cta}</span>
            <span className="sm:hidden">{t.nav.ctaShort}</span>
            <Arrow className="size-4 transition-transform duration-300 ease-[var(--ease-place)] group-hover:translate-x-0.5" />
          </a>

          <button
            type="button"
            className="label -mr-2 flex h-11 items-center gap-2 px-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <span className="flex w-5 flex-col gap-[5px]" aria-hidden="true">
              <span className="h-[2px] bg-paper" />
              <span className="h-[2px] w-3/5 bg-paper" />
            </span>
            <span className="sr-only">{t.nav.menu}</span>
          </button>
        </div>
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-signal"
          style={{ scaleX: reduce ? scrollYProgress : progress }}
        />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            className="fixed inset-0 z-[70] flex flex-col bg-asphalt text-paper lg:hidden"
            initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
            animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
            exit={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
            transition={{ duration: 0.5, ease: EASE_PLACE }}
          >
            <div className="wrap flex h-16 items-center justify-between border-b border-paper/12">
              <Wordmark className="text-[1.05rem]" />
              <button
                type="button"
                className="label -mr-2 flex h-11 items-center gap-2 px-2"
                onClick={() => setOpen(false)}
                autoFocus
              >
                {t.nav.close} <span aria-hidden="true" className="text-lg leading-none">×</span>
              </button>
            </div>
            <nav aria-label="Mobile" className="wrap flex-1 overflow-y-auto py-6">
              <ol>
                {LINKS.map((l, i) => (
                  <motion.li
                    key={l}
                    initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.15 + i * 0.04, duration: 0.5, ease: EASE_PLACE }}
                    className="border-b border-paper/12"
                  >
                    <a
                      href={`#${l}`}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 py-4"
                    >
                      <span className="label w-6 text-signal">0{i + 1}</span>
                      <span className="font-semi-expanded text-[1.9rem] font-extrabold leading-none tracking-tight">
                        {t.nav[l]}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <div className="wrap flex items-center justify-between border-t border-paper/12 py-4">
              <LangToggle />
              <span className="label text-paper/50">0421 98765 40</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
