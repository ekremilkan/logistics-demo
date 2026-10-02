"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import de, { type Dict } from "./de";
import en from "./en";

export type Locale = "de" | "en";
export const dictionaries: Record<Locale, Dict> = { de, en };
export const DEFAULT_LOCALE: Locale = "de";
const STORAGE_KEY = "hk-locale";

interface I18n {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
  /** Locale-aware number formatting. */
  n: (value: number, opts?: Intl.NumberFormatOptions) => string;
  eur: (value: number) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "de") setLocaleState(stored);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = dictionaries[locale].meta.title;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18n>(() => {
    const t = dictionaries[locale];
    const n = (v: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(t.locale, opts).format(v);
    const eur = (v: number) =>
      new Intl.NumberFormat(t.locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
    return { locale, t, setLocale, n, eur };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Replace `{key}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}
