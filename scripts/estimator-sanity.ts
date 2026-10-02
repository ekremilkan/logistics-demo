/**
 * Sanity check for the mock pricing rules: `npm run estimator:check`.
 * Prints a few typical moves so the ranges can be eyeballed against the market.
 */
import { emptyInput, estimate, type EstimateInput } from "../lib/estimator";

const today = new Date("2026-10-02T12:00:00");

function move(patch: (i: EstimateInput) => void): EstimateInput {
  const i = emptyInput();
  patch(i);
  return i;
}

const cases: [string, EstimateInput][] = [
  [
    "1-room studio, within Bremen, 2nd floor no lift → ground floor",
    move((i) => {
      i.moveType = "private";
      i.from = { country: "DE", postcode: "28203", floor: 2, elevator: false };
      i.to = { country: "DE", postcode: "28211", floor: 0, elevator: false };
      i.rooms = 1;
      i.date = "2026-11-11";
    }),
  ],
  [
    "3-room flat, Bremen → München, 3rd floor no lift → 1st with lift, assembly",
    move((i) => {
      i.moveType = "private";
      i.from = { country: "DE", postcode: "28195", floor: 3, elevator: false };
      i.to = { country: "DE", postcode: "80331", floor: 1, elevator: true };
      i.rooms = 3;
      i.extras.assembly = true;
      i.date = "2026-11-18";
    }),
  ],
  [
    "140 m² house, Hamburg → Köln, piano, full packing, Saturday month-end",
    move((i) => {
      i.moveType = "private";
      i.from = { country: "DE", postcode: "22301", floor: 0, elevator: false };
      i.to = { country: "DE", postcode: "50667", floor: 0, elevator: false };
      i.sizeMode = "sqm";
      i.sqm = 140;
      i.extras = { packing: true, assembly: true, storageWeeks: 0, heavyItems: 1 };
      i.date = "2026-10-31";
    }),
  ],
  [
    "Office, 20 workstations, Bremen → Hannover, 4th floor lift both ends",
    move((i) => {
      i.moveType = "office";
      i.from = { country: "DE", postcode: "28217", floor: 4, elevator: true };
      i.to = { country: "DE", postcode: "30159", floor: 4, elevator: true };
      i.rooms = 20;
      i.extras.assembly = true;
      i.date = "2026-11-14";
    }),
  ],
  [
    "2-room flat, Bremen → Amsterdam, 4 weeks storage, flexible date",
    move((i) => {
      i.moveType = "private";
      i.from = { country: "DE", postcode: "28209", floor: 1, elevator: false };
      i.to = { country: "NL", postcode: "amsterdam", floor: 2, elevator: false };
      i.rooms = 2;
      i.extras.storageWeeks = 4;
      i.flexibleDate = true;
    }),
  ],
  ["Nothing answered yet (defaults)", emptyInput()],
];

const eur = (n: number) => `€${n.toLocaleString("de-DE")}`;
for (const [label, input] of cases) {
  const e = estimate(input, { today });
  console.log(`\n■ ${label}`);
  console.log(
    `  ${e.from?.name ?? "?"} → ${e.to?.name ?? "?"} · ${e.distanceKm} km · ${e.volumeM3} m³ · ` +
      `${e.truckCount}× ${e.truck.weight} · crew ${e.crew} · ${e.hours.total.toFixed(1)} h · ${e.days} day(s)`,
  );
  console.log(
    `  RANGE ${eur(e.priceLow)} – ${eur(e.priceHigh)}  (point ${eur(e.total)}, confidence ${Math.round(
      e.confidence * 100,
    )}%, date ×${e.dateFactor.toFixed(2)} ${e.dateFlags.join(",")})`,
  );
  console.log("  " + e.breakdown.map((b) => `${b.key}:${b.amount}`).join("  "));
}
