/**
 * Public types for the Hafenkraft moving-cost estimator.
 *
 * Inputs are nullable on purpose: the UI calls `estimate()` live while the
 * user is still answering, and unanswered fields fall back to defaults while
 * the price range widens (see `confidence`).
 */

export type MoveType = "private" | "office";

/** `rooms` means living rooms for private moves and workstations for offices. */
export type SizeMode = "rooms" | "sqm";

export type CountryCode = "DE" | "NL" | "BE" | "LU" | "DK" | "AT" | "CH" | "PL" | "FR";

export interface Address {
  country: CountryCode;
  /** German 5-digit postcode, or a city key for EU destinations. */
  postcode: string | null;
  /** 0 = ground floor. */
  floor: number | null;
  elevator: boolean | null;
}

export interface Extras {
  packing: boolean;
  assembly: boolean;
  /** 0 = no storage. */
  storageWeeks: number;
  /** Pianos, safes, aquariums — anything over ~150 kg. */
  heavyItems: number;
}

export interface EstimateInput {
  moveType: MoveType | null;
  from: Address;
  to: Address;
  sizeMode: SizeMode;
  rooms: number | null;
  sqm: number | null;
  extras: Extras;
  /** ISO date `YYYY-MM-DD`. */
  date: string | null;
  /** Customer can shift ±3 days — we pick the cheapest slot. */
  flexibleDate: boolean;
}

export type TruckId = "t35" | "t75" | "t12" | "t18";

export interface Truck {
  id: TruckId;
  /** Gross vehicle weight label, e.g. "7,5 t". */
  weight: string;
  capacityM3: number;
  dayRate: number;
  perKm: number;
}

export type LineItemKey =
  | "base"
  | "parking"
  | "labour"
  | "travelCrew"
  | "truckDays"
  | "truckKm"
  | "overnight"
  | "packing"
  | "assembly"
  | "heavy"
  | "storage"
  | "international"
  | "dateFactor";

export interface LineItem {
  key: LineItemKey;
  amount: number;
}

export interface Place {
  key: string;
  name: string;
  lat: number;
  lon: number;
  country: CountryCode;
}

export interface Estimate {
  from: Place | null;
  to: Place | null;
  distanceKm: number;
  volumeM3: number;
  truck: Truck;
  truckCount: number;
  crew: number;
  hours: { handling: number; driving: number; total: number };
  /** Working days on the road (1 = same-day move). */
  days: number;
  /** Combined date multiplier, e.g. 1.12 for a Saturday at month end. */
  dateFactor: number;
  dateFlags: DateFlag[];
  breakdown: LineItem[];
  total: number;
  priceLow: number;
  priceHigh: number;
  /** 0..1 — how much of the input was actually answered. */
  confidence: number;
  international: boolean;
}

export type DateFlag = "weekend" | "monthTurn" | "summer" | "shortNotice" | "flexible";
