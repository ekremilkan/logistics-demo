import { RULES, type Rules } from "./rules";
import { NON_EU, haversineKm, resolvePlace } from "./places";
import type { DateFlag, Estimate, EstimateInput, LineItem, Truck } from "./types";

const round = (n: number, to = 1) => Math.round(n / to) * to;
const roundDown = (n: number, to: number) => Math.floor(n / to) * to;
const roundUp = (n: number, to: number) => Math.ceil(n / to) * to;

export function emptyInput(): EstimateInput {
  return {
    moveType: null,
    from: { country: "DE", postcode: null, floor: null, elevator: null },
    to: { country: "DE", postcode: null, floor: null, elevator: null },
    sizeMode: "rooms",
    rooms: null,
    sqm: null,
    extras: { packing: false, assembly: false, storageWeeks: 0, heavyItems: 0 },
    date: null,
    flexibleDate: false,
  };
}

/** Share of the questionnaire that has real answers, 0..1. */
export function confidenceOf(input: EstimateInput): number {
  const size = input.sizeMode === "rooms" ? input.rooms : input.sqm;
  const parts: [boolean, number][] = [
    [input.moveType !== null, 0.1],
    [resolvePlace(input.from.country, input.from.postcode) !== null, 0.15],
    [resolvePlace(input.to.country, input.to.postcode) !== null, 0.15],
    [size !== null, 0.3],
    [input.from.floor !== null && input.to.floor !== null, 0.15],
    [input.date !== null || input.flexibleDate, 0.15],
  ];
  return parts.reduce((sum, [ok, w]) => sum + (ok ? w : 0), 0);
}

export function volumeOf(input: EstimateInput, rules: Rules = RULES): number {
  const type = input.moveType ?? "private";
  const v = rules.volume[type];
  if (input.sizeMode === "sqm") {
    const sqm = input.sqm ?? (type === "office" ? rules.defaults.officeSqm : rules.defaults.sqm);
    return round(v.base + sqm * v.perSqm);
  }
  const rooms = input.rooms ?? (type === "office" ? rules.defaults.officeRooms : rules.defaults.rooms);
  return round(v.base + rooms * v.perRoom);
}

export function pickTruck(volume: number, rules: Rules = RULES): { truck: Truck; count: number } {
  const fit = rules.trucks.find((t) => t.capacityM3 >= volume);
  if (fit) return { truck: fit, count: 1 };
  const biggest = rules.trucks[rules.trucks.length - 1];
  return { truck: biggest, count: Math.ceil(volume / biggest.capacityM3) };
}

export function crewFor(volume: number, heavyItems: number, rules: Rules = RULES): number {
  let crew: number = rules.crewByVolume.find((c) => volume < c.upTo)!.crew;
  if (heavyItems > 0) crew = Math.max(crew, rules.heavyMinCrew);
  return Math.min(crew, rules.crewMax);
}

/** Date multiplier and the reasons behind it. `today` is injectable for tests. */
export function dateFactorOf(
  date: string | null,
  flexible: boolean,
  today: Date = new Date(),
  rules: Rules = RULES,
): { factor: number; flags: DateFlag[] } {
  const flags: DateFlag[] = [];
  let factor = 1;
  if (date) {
    const d = new Date(`${date}T12:00:00`);
    const day = d.getDate();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const month = d.getMonth() + 1;
    if (!flexible && (d.getDay() === 6 || d.getDay() === 0)) flags.push("weekend");
    if (!flexible && (day <= 2 || day > lastDay - 3)) flags.push("monthTurn");
    if (month >= 6 && month <= 9) flags.push("summer");
    const daysAhead = (d.getTime() - today.getTime()) / 86_400_000;
    if (daysAhead < rules.date.shortNoticeDays) flags.push("shortNotice");
  }
  if (flexible) flags.push("flexible");
  for (const f of flags) factor *= rules.date[f];
  return { factor, flags };
}

export function estimate(input: EstimateInput, opts: { today?: Date; rules?: Rules } = {}): Estimate {
  const rules = opts.rules ?? RULES;
  const L = rules.labour;
  const T = rules.travel;
  const F = rules.fixed;

  // — Where —
  const from = resolvePlace(input.from.country, input.from.postcode);
  const to = resolvePlace(input.to.country, input.to.postcode);
  let distanceKm: number = T.localKm;
  if (from && to) {
    const sameRegion = from.country === "DE" && to.country === "DE" && from.key.slice(0, 2) === to.key.slice(0, 2);
    distanceKm = sameRegion ? T.localKm : Math.max(T.localKm, round(haversineKm(from, to) * T.roadFactor));
  }
  const international = (from?.country ?? "DE") !== "DE" || (to?.country ?? "DE") !== "DE";

  // — What —
  const volumeM3 = volumeOf(input, rules);
  const { truck, count: truckCount } = pickTruck(volumeM3, rules);
  const heavy = input.extras.heavyItems;
  const crew = crewFor(volumeM3, heavy, rules) + (truckCount > 1 ? 2 * (truckCount - 1) : 0);

  // — How long —
  let handling = volumeM3 / (crew * L.throughputPerMover);
  let stairFactor = 0;
  for (const a of [input.from, input.to]) {
    const floor = a.floor ?? rules.defaults.floor;
    const elevator = a.elevator ?? rules.defaults.elevator;
    if (floor > 0) stairFactor += elevator ? L.elevatorPenalty : floor * L.stairsPerFloor;
  }
  handling *= 1 + stairFactor;
  const packingHours = input.extras.packing ? (volumeM3 * L.packingHoursPerM3) / crew : 0;
  const assemblyHours = input.extras.assembly ? (volumeM3 * L.assemblyHoursPerM3) / crew : 0;
  const workHours = handling + packingHours + assemblyHours;
  const driving = distanceKm / T.avgSpeedKmh + T.overheadHours;
  const totalHours = workHours + driving;
  const days = Math.max(1, Math.ceil(totalHours / T.maxHoursPerDay));

  // — What it costs —
  const items: LineItem[] = [
    { key: "base", amount: F.base },
    { key: "parking", amount: F.parkingPerAddress * 2 },
    { key: "labour", amount: crew * L.hourlyPerMover * handling },
    { key: "travelCrew", amount: crew * T.crewDriveHourly * driving },
    { key: "truckDays", amount: truck.dayRate * days * truckCount },
    { key: "truckKm", amount: truck.perKm * distanceKm * truckCount },
  ];
  if (days > 1) items.push({ key: "overnight", amount: (days - 1) * crew * T.overnightPerMover });
  if (input.extras.packing)
    items.push({
      key: "packing",
      amount: packingHours * crew * L.hourlyPerMover + volumeM3 * L.packingMaterialPerM3,
    });
  if (input.extras.assembly) items.push({ key: "assembly", amount: assemblyHours * crew * L.hourlyPerMover });
  if (heavy > 0) items.push({ key: "heavy", amount: heavy * F.heavyItem });
  if (input.extras.storageWeeks > 0)
    items.push({ key: "storage", amount: input.extras.storageWeeks * volumeM3 * F.storagePerM3Week });
  if (international) {
    const nonEu = [from?.country, to?.country].some((c) => c && NON_EU.includes(c));
    items.push({ key: "international", amount: F.international + (nonEu ? F.customs : 0) });
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const { factor: dateFactor, flags: dateFlags } = dateFactorOf(input.date, input.flexibleDate, opts.today, rules);
  if (dateFactor !== 1) items.push({ key: "dateFactor", amount: subtotal * (dateFactor - 1) });
  const total = subtotal * dateFactor;

  // — The range narrows as the user answers more —
  const confidence = confidenceOf(input);
  const loose = rules.range.looseExtra * (1 - confidence);
  const priceLow = roundDown(total * (rules.range.tightLow - loose), rules.range.roundTo);
  const priceHigh = roundUp(total * (rules.range.tightHigh + loose), rules.range.roundTo);

  return {
    from,
    to,
    distanceKm,
    volumeM3,
    truck,
    truckCount,
    crew,
    hours: { handling: workHours, driving, total: totalHours },
    days,
    dateFactor,
    dateFlags,
    breakdown: items.map((i) => ({ ...i, amount: round(i.amount) })),
    total: round(total),
    priceLow,
    priceHigh,
    confidence,
    international,
  };
}

/** Waybill-style reference, e.g. `HK-26-4K7Q2M`. */
export function referenceNumber(seed: string, now: Date = new Date()): string {
  let h = 2166136261;
  for (const ch of seed + now.getTime()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  let n = h >>> 0;
  for (let i = 0; i < 6; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) ^ (i * 7919);
  }
  return `HK-${String(now.getFullYear()).slice(2)}-${out}`;
}
