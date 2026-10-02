"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CheckBox } from "./controls";

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

type Field = "name" | "email" | "phone" | "consent";

export function QuoteStep({ onSubmit }: { onSubmit: (c: Contact) => void }) {
  const { t } = useI18n();
  const q = t.estimator.steps.quote;
  const [values, setValues] = useState<Contact>({ name: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const errors: Partial<Record<Field, string>> = {};
  if (values.name.trim().length < 2) errors.name = q.errors.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = q.errors.email;
  if (values.phone.trim() && values.phone.replace(/\D/g, "").length < 6) errors.phone = q.errors.phone;
  if (!consent) errors.consent = q.errors.consent;

  const show = (f: Field) => touched[f] && errors[f];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, consent: true });
    const first = (["name", "email", "phone", "consent"] as Field[]).find((f) => errors[f]);
    if (first) {
      document.getElementById(`q-${first}`)?.focus();
      return;
    }
    onSubmit({ name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() });
  };

  const input = (f: Exclude<Field, "consent">, type: string, autoComplete: string, label: string, extra?: string) => (
    <div>
      <label htmlFor={`q-${f}`} className="label flex justify-between text-paper/60">
        <span>{label}</span>
        {extra && <span className="text-paper/40">{extra}</span>}
      </label>
      <input
        id={`q-${f}`}
        type={type}
        autoComplete={autoComplete}
        inputMode={type === "tel" ? "tel" : type === "email" ? "email" : undefined}
        value={values[f]}
        onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
        onBlur={() => setTouched((tt) => ({ ...tt, [f]: true }))}
        aria-invalid={!!show(f)}
        aria-describedby={show(f) ? `q-${f}-err` : undefined}
        className={`mt-1 w-full border-b-2 bg-transparent py-2.5 text-xl text-paper placeholder:text-paper/20 focus:outline-none sm:text-2xl ${
          show(f) ? "border-signal" : "border-paper/30 focus:border-paper"
        }`}
      />
      {show(f) && (
        <p id={`q-${f}-err`} className="label mt-2 text-signal">
          ▲ {errors[f]}
        </p>
      )}
    </div>
  );

  return (
    <form id="quote-form" noValidate onSubmit={submit} className="grid gap-7">
      {input("name", "text", "name", q.name)}
      <div className="grid gap-7 sm:grid-cols-2 sm:gap-6">
        {input("email", "email", "email", q.email)}
        {input("phone", "tel", "tel", q.phone, q.phoneOptional)}
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-4">
          <input
            id="q-consent"
            type="checkbox"
            className="peer sr-only"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setTouched((tt) => ({ ...tt, consent: true }));
            }}
            aria-invalid={!!show("consent")}
            aria-describedby={show("consent") ? "q-consent-err" : undefined}
          />
          <CheckBox on={consent} className="mt-0.5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal" />
          <span className="text-sm leading-relaxed text-paper/70">{q.consent}</span>
        </label>
        {show("consent") && (
          <p id="q-consent-err" className="label mt-2 pl-11 text-signal">
            ▲ {errors.consent}
          </p>
        )}
      </div>
    </form>
  );
}
