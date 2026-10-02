"use client";

import { useI18n } from "@/lib/i18n";
import { Barcode, Fragile, ThisSideUp } from "@/components/ui/marks";

/** The hero's signature: a thermal-printed shipping label stuck on the photo. */
export function ShippingLabel({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const l = t.hero.label;
  return (
    <div
      className={`paper-fibre w-[19rem] border-[1.5px] border-asphalt text-asphalt shadow-[0_1px_0_rgba(0,0,0,.25),0_18px_40px_-18px_rgba(0,0,0,.55)] sm:w-[21rem] ${className}`}
    >
      <div className="kraft-paper flex items-center justify-between border-b-[1.5px] border-asphalt px-3 py-1.5">
        <span className="label font-medium">Hafenkraft · {t.estimator.label.title}</span>
        <span className="label">1/1</span>
      </div>

      <div className="flex items-stretch border-b-[1.5px] border-asphalt">
        <div className="flex-1 px-3 py-2">
          <div className="label text-asphalt/60">Route</div>
          <div className="font-expanded text-[2.1rem] font-black leading-none tracking-tight">
            HB<span className="mx-1 text-[0.7em] align-middle">→</span>NEU
          </div>
        </div>
        <div className="flex w-16 items-center justify-center border-l-[1.5px] border-asphalt bg-asphalt text-paper">
          <ThisSideUp className="size-9" />
        </div>
      </div>

      <dl>
        <div className="border-b border-asphalt/40 px-3 py-2">
          <dt className="label text-asphalt/60">{l.sender}</dt>
          <dd className="text-sm font-medium">{l.senderValue}</dd>
        </div>
        <div className="border-b-[1.5px] border-asphalt px-3 py-2">
          <dt className="label text-asphalt/60">{l.recipient}</dt>
          <dd className="font-semi-expanded text-xl font-extrabold leading-tight">{l.recipientValue}</dd>
        </div>
        <div className="grid grid-cols-[1fr_1.4fr] border-b-[1.5px] border-asphalt">
          <div className="border-r border-asphalt/40 px-3 py-2">
            <dt className="label text-asphalt/60">{l.eta}</dt>
            <dd className="mt-0.5 inline-block bg-signal px-1.5 font-mono text-sm font-semibold uppercase">
              {l.etaValue}
            </dd>
          </div>
          <div className="px-3 py-2">
            <dt className="label text-asphalt/60">{l.service}</dt>
            <dd className="text-sm font-medium leading-snug">{l.serviceValue}</dd>
          </div>
        </div>
      </dl>

      <div className="px-3 pb-2 pt-3">
        <Barcode seed="HK-26-000417" className="h-11 w-full" />
        <div className="label mt-1 flex justify-between">
          <span>HK-26-000417</span>
          <span>28217 · DE</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t-[1.5px] border-asphalt px-3 py-1.5">
        <span className="label font-semibold">{l.handle}</span>
        <span className="flex gap-1.5">
          <Fragile className="size-5" />
          <ThisSideUp className="size-5" />
        </span>
      </div>
    </div>
  );
}
