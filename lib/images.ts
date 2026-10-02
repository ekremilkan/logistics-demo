/**
 * Every photo on the site, in one place. All from Unsplash (free licence).
 * Swap an `id` to change a picture; `npm run images:check` verifies they load.
 * Alt texts live in the dictionaries where they belong to a section, or here
 * as `alt` (DE / EN) for purely illustrative photos.
 */
export interface Photo {
  id: string;
  /** What the picture should show — shown on the fallback plate, too. */
  subject: { de: string; en: string };
  /** Focal point for object-position. */
  focus?: string;
}

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const photoUrl = u;

export const PHOTOS = {
  hero: {
    id: "photo-1600518464441-9154a4dea21b",
    subject: { de: "Möbelpacker mit Sessel im Treppenhaus", en: "Movers carrying an armchair" },
    focus: "50% 40%",
  },
  privateMove: {
    id: "photo-1603796846097-bee99e4a601f",
    subject: { de: "Gestapelte Umzugskartons", en: "Stacked moving boxes" },
  },
  office: {
    id: "photo-1497366216548-37526070297c",
    subject: { de: "Leeres, helles Büro", en: "Empty bright office" },
  },
  packing: {
    id: "photo-1586528116311-ad8dd3c8310d",
    subject: { de: "Ordentlich gepackte Kartons", en: "Neatly packed boxes" },
  },
  assembly: {
    id: "photo-1581578731548-c64695cc6952",
    subject: { de: "Möbelmontage mit Werkzeug", en: "Assembling furniture" },
  },
  storage: {
    id: "photo-1553413077-190dd305871c",
    subject: { de: "Lager mit Holzcontainern", en: "Warehouse with crates" },
  },
  international: {
    id: "photo-1494412574643-ff11b0a5c1c3",
    subject: { de: "Containerhafen am Morgen", en: "Container port at dawn" },
  },
  highway: {
    id: "photo-1519003722824-194d4455a60c",
    subject: { de: "Lkw auf der Autobahn im Morgengrauen", en: "Truck on the motorway at dawn" },
    focus: "50% 60%",
  },
  survey: {
    id: "photo-1556761175-b413da4baf72",
    subject: { de: "Besichtigung mit Notizblock", en: "Survey with a clipboard" },
  },
  newHome: {
    id: "photo-1502672260266-1c1ef2d93688",
    subject: { de: "Familie in der neuen, leeren Wohnung", en: "A family in their new, empty flat" },
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;
