"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emptyInput, estimate, referenceNumber, type EstimateInput } from "@/lib/estimator";
import { useI18n } from "@/lib/i18n";
import { Arrow, SectionMark } from "@/components/ui/marks";
import { EASE_PLACE, Reveal } from "@/components/ui/motion";
import { LiveLabel, PriceRange, useEstimateText } from "./LiveLabel";
import { QuoteStep, type Contact } from "./QuoteStep";
import { DateStep, ExtrasStep, FloorsStep, RouteStep, SizeStep, TypeStep, type StepProps } from "./Steps";
import { Waybill } from "./Waybill";

const STEPS = ["type", "route", "size", "floors", "extras", "date", "quote"] as const;
type StepKey = (typeof STEPS)[number];
const QUESTION_STEPS = STEPS.length - 1;

const VIEWS: Record<Exclude<StepKey, "quote">, (p: StepProps) => React.ReactNode> = {
  type: TypeStep,
  route: RouteStep,
  size: SizeStep,
  floors: FloorsStep,
  extras: ExtrasStep,
  date: DateStep,
};

function canAdvance(step: StepKey, input: EstimateInput, est: ReturnType<typeof estimate>) {
  switch (step) {
    case "type":
      return input.moveType !== null;
    case "route":
      return !!est.from && !!est.to;
    case "date":
      return input.date !== null || input.flexibleDate;
    default:
      return true;
  }
}

export function Estimator() {
  const { t } = useI18n();
  const e = t.estimator;
  const reduce = useReducedMotion();

  const [input, setInput] = useState<EstimateInput>(emptyInput);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState<{ contact: Contact; reference: string; issued: Date } | null>(null);
  const [sheet, setSheet] = useState(false);
  const focusOnChange = useRef(false);

  const est = useMemo(() => estimate(input), [input]);
  const key = STEPS[step];
  const ok = canAdvance(key, input, est);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inView = useInView(sectionRef, { margin: "-35% 0px -35% 0px" });

  const update = useCallback((patch: (d: EstimateInput) => void) => {
    setInput((prev) => {
      const next = structuredClone(prev);
      patch(next);
      return next;
    });
  }, []);

  /** Lock in the defaults the user saw, so the range tightens as they move on. */
  const commit = (k: StepKey) => {
    if (k === "size")
      update((d) => {
        const office = d.moveType === "office";
        if (d.sizeMode === "rooms" && d.rooms === null) d.rooms = office ? 12 : 3;
        if (d.sizeMode === "sqm" && d.sqm === null) d.sqm = office ? 220 : 75;
      });
    if (k === "floors")
      update((d) => {
        for (const a of [d.from, d.to]) {
          if (a.floor === null) a.floor = 0;
          if (a.elevator === null) a.elevator = false;
        }
      });
  };

  const go = (to: number) => {
    if (to === step || to < 0 || to > STEPS.length - 1) return;
    if (to > step) {
      for (let i = step; i < to; i++) if (!canAdvance(STEPS[i], input, est)) return;
      for (let i = step; i < to; i++) commit(STEPS[i]);
    }
    setDir(to > step ? 1 : -1);
    setStep(to);
    setMaxStep((m) => Math.max(m, to));
    focusOnChange.current = true;
  };
  const next = () => ok && go(step + 1);
  /** Picking a move type is answer enough — slide on without a click on "Next". */
  const autoAdvance = () =>
    setTimeout(() => {
      setDir(1);
      setStep((s) => (s === 0 ? 1 : s));
      setMaxStep((m) => Math.max(m, 1));
      focusOnChange.current = true;
    }, 320);
  const back = () => go(step - 1);

  // After a step change: bring the stage into view (mobile) and move focus to the question.
  useEffect(() => {
    if (!focusOnChange.current) return;
    focusOnChange.current = false;
    const stage = stageRef.current;
    if (stage && stage.getBoundingClientRect().top < 64) {
      window.scrollTo({ top: window.scrollY + stage.getBoundingClientRect().top - 80, behavior: reduce ? "auto" : "smooth" });
    }
    const id = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), reduce ? 0 : 320);
    return () => clearTimeout(id);
  }, [step, reduce]);

  const submit = (contact: Contact) => {
    const issued = new Date();
    setDone({ contact, issued, reference: referenceNumber(JSON.stringify(input) + contact.email, issued) });
    requestAnimationFrame(() =>
      sectionRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }),
    );
  };

  const reset = () => {
    setInput(emptyInput());
    setStep(0);
    setMaxStep(0);
    setDone(null);
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    const el = ev.target as HTMLElement;
    if (ev.key === "Enter" && el.tagName === "INPUT" && (el as HTMLInputElement).type !== "checkbox" && key !== "quote") {
      ev.preventDefault();
      next();
    }
  };

  const question =
    key === "size" && input.moveType === "office" ? e.steps.size.qOffice : e.steps[key].q;
  const View = key === "quote" ? null : VIEWS[key];
  const x = useEstimateText(input, est);

  const nextButton = (cls: string, compact = false) =>
    key === "quote" ? (
      <button type="submit" form="quote-form" className={cls}>
        <span>{compact ? e.toQuote : e.steps.quote.submit}</span>
        <Arrow className="size-5 shrink-0" />
      </button>
    ) : (
      <button type="button" onClick={next} aria-disabled={!ok} className={`${cls} ${ok ? "" : "cursor-not-allowed opacity-40"}`}>
        <span>{step === QUESTION_STEPS - 1 ? e.toQuote : e.next}</span>
        <Arrow className="size-5 shrink-0" />
      </button>
    );

  return (
    <section
      ref={sectionRef}
      id="estimator"
      className="relative bg-asphalt pb-40 text-paper lg:pb-0"
      aria-labelledby="estimator-title"
    >
      <div className="wrap py-24 lg:py-36">
        <SectionMark n="02" label={e.index} aside={`${e.step} 0${Math.min(step + 1, 7)} / 07`} />

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-8">
            <h2
              id="estimator-title"
              className="font-expanded text-[2.9rem] font-extrabold leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-[5.6rem]"
            >
              {e.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-4">
            <p className="max-w-[36ch] text-lg leading-relaxed text-paper/70">{e.intro}</p>
            <p className="label mt-4 inline-block border border-paper/25 px-2 py-1 text-paper/60">{e.demoNote}</p>
          </Reveal>
        </div>

        {done ? (
          <div className="mt-14 lg:mt-20">
            <Waybill input={input} est={est} contact={done.contact} reference={done.reference} issued={done.issued} onReset={reset} />
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:items-start">
            {/* Stage */}
            <div ref={stageRef} className="scroll-mt-20 border border-paper/15 bg-asphalt-2 lg:col-span-7 xl:col-span-8" onKeyDown={onKeyDown}>
              {/* Tape-measure progress */}
              <nav aria-label={e.index} className="border-b border-paper/15">
                <ol className="grid grid-cols-7">
                  {STEPS.map((s, i) => {
                    const reachable = i <= maxStep;
                    const current = i === step;
                    return (
                      <li key={s} className="relative">
                        <button
                          type="button"
                          onClick={() => reachable && go(i)}
                          disabled={!reachable}
                          aria-current={current ? "step" : undefined}
                          className={`flex h-14 w-full flex-col justify-center px-1.5 text-left transition-colors sm:h-16 sm:px-3 ${
                            current ? "text-paper" : reachable ? "text-paper/65 hover:text-paper" : "text-paper/25"
                          }`}
                        >
                          <span className="label tnum">{String(i + 1).padStart(2, "0")}</span>
                          <span className="label hidden truncate xl:block">{e.steps[s].short}</span>
                        </button>
                        {/* ticks */}
                        <span className="absolute bottom-0 left-0 h-2.5 w-px bg-paper/30" aria-hidden="true" />
                        <span className="absolute bottom-0 left-1/2 h-1.5 w-px bg-paper/20" aria-hidden="true" />
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 bottom-0 h-1 origin-left transition-transform duration-500 ease-[var(--ease-place)] ${
                            i < step ? "scale-x-100 bg-paper/60" : current ? "scale-x-100 bg-signal" : "scale-x-0 bg-signal"
                          }`}
                        />
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="relative overflow-hidden p-5 sm:p-8 xl:p-10">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div
                    key={key}
                    custom={dir}
                    initial={{ opacity: 0, x: reduce ? 0 : dir * 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : dir * -32 }}
                    transition={{ duration: 0.38, ease: EASE_PLACE }}
                    className="min-h-[24rem] sm:min-h-[28rem]"
                  >
                    <div className="label text-paper/50">
                      {e.step} {String(step + 1).padStart(2, "0")} {e.of} 07 · {e.steps[key].short}
                    </div>
                    <h3
                      ref={headingRef}
                      tabIndex={-1}
                      className="font-semi-expanded mb-8 mt-2 text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.03em] focus:outline-none sm:mb-10 sm:text-4xl xl:text-5xl"
                    >
                      {question}
                    </h3>
                    {View ? (
                      <View input={input} est={est} update={update} onAutoAdvance={key === "type" ? autoAdvance : undefined} />
                    ) : (
                      <QuoteStep onSubmit={submit} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop nav */}
              <div className="hidden items-center justify-between border-t border-paper/15 p-4 lg:flex lg:px-8">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className="label flex min-h-12 items-center gap-2 px-2 text-paper/70 hover:text-paper disabled:opacity-0"
                >
                  <Arrow dir="left" className="size-4" /> {e.back}
                </button>
                {nextButton(
                  "font-semi-expanded flex min-h-14 items-center gap-6 bg-signal px-6 text-lg font-extrabold tracking-tight text-asphalt transition-colors hover:bg-paper",
                )}
              </div>
            </div>

            {/* Live label (desktop) */}
            <aside className="hidden lg:sticky lg:top-24 lg:col-span-5 lg:block xl:col-span-4" aria-label={e.label.title}>
              <LiveLabel input={input} est={est} className="-rotate-[0.6deg]" />
            </aside>
          </div>
        )}
      </div>

      {/* Mobile: sticky price + thumb-reach controls */}
      <AnimatePresence>
        {inView && !done && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-asphalt bg-paper pb-[env(safe-area-inset-bottom)] text-asphalt shadow-[0_-12px_30px_-10px_rgba(0,0,0,.5)] lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE_PLACE }}
          >
            <button
              type="button"
              onClick={() => setSheet(true)}
              aria-haspopup="dialog"
              className="flex w-full items-center justify-between gap-3 px-4 pb-2 pt-3 text-left"
            >
              <span className="min-w-0">
                <span className="label block truncate text-asphalt/55">
                  {e.label.price} <span className="tnum text-asphalt">± {x.spread}%</span>
                </span>
                <span className="mt-1 block text-[1.65rem] leading-none">
                  <PriceRange est={est} />
                </span>
              </span>
              <span className="label flex shrink-0 flex-col items-end gap-1 text-right">
                <span>{x.truck && x.crew ? `${x.truck} · ${x.crew}` : e.label.pending}</span>
                <span className="flex items-center gap-1 underline underline-offset-4">
                  {e.label.details} <Arrow dir="up" className="size-3" />
                </span>
              </span>
            </button>
            <div className="grid grid-cols-[auto_1fr] gap-2 px-4 pb-3">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                aria-label={e.back}
                className="flex size-14 items-center justify-center border-2 border-asphalt disabled:opacity-25"
              >
                <Arrow dir="left" className="size-5" />
              </button>
              {nextButton(
                "font-semi-expanded flex h-14 w-full items-center justify-between gap-3 bg-asphalt px-5 text-base font-extrabold tracking-tight text-signal",
                true,
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheet && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col justify-end bg-asphalt/70 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheet(false)}
            role="dialog"
            aria-modal="true"
            aria-label={e.label.title}
          >
            <motion.div
              className="max-h-[88vh] overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),12px)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: EASE_PLACE }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSheet(false)}
                autoFocus
                className="label mb-2 ml-auto flex min-h-11 items-center gap-2 bg-asphalt px-3 text-paper"
              >
                {e.label.hide} ×
              </button>
              <LiveLabel input={input} est={est} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
