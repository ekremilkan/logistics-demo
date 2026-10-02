import type { Truck } from "./types";

/**
 * All pricing knobs in one place. These are mock rules, calibrated to land in
 * a believable range for the German market (2026, net of VAT ignored). Swap
 * this object for values from a backend/CMS without touching the logic.
 */
export const RULES = {
  /** Cubic metres of goods per unit of size. */
  volume: {
    private: { base: 6, perRoom: 10, perSqm: 0.36 },
    office: { base: 10, perRoom: 3.2, perSqm: 0.24 },
    packingExtraM3: 0, // packing doesn't change volume, only labour
  },

  trucks: [
    { id: "t35", weight: "3,5 t", capacityM3: 18, dayRate: 89, perKm: 0.85 },
    { id: "t75", weight: "7,5 t", capacityM3: 38, dayRate: 149, perKm: 1.1 },
    { id: "t12", weight: "12 t", capacityM3: 55, dayRate: 219, perKm: 1.45 },
    { id: "t18", weight: "18 t", capacityM3: 75, dayRate: 289, perKm: 1.8 },
  ] satisfies Truck[],

  /** Crew size by volume (upper bound exclusive). */
  crewByVolume: [
    { upTo: 18, crew: 2 },
    { upTo: 35, crew: 3 },
    { upTo: 60, crew: 4 },
    { upTo: 90, crew: 5 },
    { upTo: Infinity, crew: 6 },
  ],
  crewMax: 8,
  /** Heavy items need at least this many hands. */
  heavyMinCrew: 4,

  labour: {
    hourlyPerMover: 42,
    /** m³ one mover loads + unloads per hour. */
    throughputPerMover: 1.6,
    /** Per floor climbed without an elevator, per address. */
    stairsPerFloor: 0.06,
    /** Flat penalty when an elevator is used above ground floor. */
    elevatorPenalty: 0.02,
    /** Hours of crew time per m³ for the packing service. */
    packingHoursPerM3: 0.14,
    packingMaterialPerM3: 4.5,
    /** Hours of crew time per m³ for disassembly + reassembly. */
    assemblyHoursPerM3: 0.09,
  },

  travel: {
    /** Road distance ≈ great-circle × factor. */
    roadFactor: 1.25,
    /** Same 2-digit postcode region. */
    localKm: 9,
    avgSpeedKmh: 68,
    /** Fixed driving overhead per job (yard → pickup, traffic). */
    overheadHours: 0.5,
    /** Reduced rate for crew while driving. */
    crewDriveHourly: 22,
    /** A working day on the road before an overnight is needed. */
    maxHoursPerDay: 10,
    overnightPerMover: 85,
  },

  fixed: {
    /** Survey, admin, transport insurance up to €5M. */
    base: 95,
    /** No-parking zone (Halteverbotszone) per address — always included. */
    parkingPerAddress: 95,
    heavyItem: 180,
    storagePerM3Week: 3.2,
    international: 250,
    /** Customs handling for non-EU destinations. */
    customs: 350,
  },

  date: {
    weekend: 1.12,
    /** Last 3 and first 2 days of a month. */
    monthTurn: 1.1,
    /** June–September. */
    summer: 1.06,
    /** Booked less than 14 days ahead. */
    shortNotice: 1.08,
    shortNoticeDays: 14,
    /** Flexible ±3 days: we avoid peaks and give a small discount. */
    flexible: 0.94,
  },

  range: {
    /** Spread when every question is answered. */
    tightLow: 0.93,
    tightHigh: 1.1,
    /** Extra spread added at zero confidence. */
    looseExtra: 0.18,
    roundTo: 10,
  },

  defaults: {
    rooms: 3,
    officeRooms: 12,
    sqm: 75,
    officeSqm: 220,
    floor: 1,
    elevator: false,
  },
} as const;

export type Rules = typeof RULES;
