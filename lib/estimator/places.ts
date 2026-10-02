import type { CountryCode, Place } from "./types";

/**
 * Mock geography: centroid of each German 2-digit postcode region (Leitregion).
 * Good enough for a distance estimate; a real backend would use a routing API.
 */
const DE_REGIONS: Record<string, [name: string, lat: number, lon: number]> = {
  "01": ["Dresden", 51.05, 13.74],
  "02": ["Görlitz", 51.15, 14.97],
  "03": ["Cottbus", 51.76, 14.33],
  "04": ["Leipzig", 51.34, 12.37],
  "06": ["Halle (Saale)", 51.48, 11.97],
  "07": ["Jena", 50.93, 11.59],
  "08": ["Zwickau", 50.72, 12.49],
  "09": ["Chemnitz", 50.83, 12.92],
  "10": ["Berlin", 52.52, 13.4],
  "12": ["Berlin", 52.46, 13.44],
  "13": ["Berlin", 52.57, 13.33],
  "14": ["Potsdam", 52.39, 13.06],
  "15": ["Frankfurt (Oder)", 52.34, 14.55],
  "16": ["Oranienburg", 52.75, 13.24],
  "17": ["Neubrandenburg", 53.56, 13.26],
  "18": ["Rostock", 54.09, 12.13],
  "19": ["Schwerin", 53.63, 11.41],
  "20": ["Hamburg", 53.55, 9.99],
  "21": ["Hamburg", 53.46, 9.98],
  "22": ["Hamburg", 53.6, 10.03],
  "23": ["Lübeck", 53.87, 10.69],
  "24": ["Kiel", 54.32, 10.13],
  "25": ["Husum", 54.48, 9.05],
  "26": ["Oldenburg", 53.14, 8.21],
  "27": ["Bremerhaven", 53.54, 8.58],
  "28": ["Bremen", 53.08, 8.8],
  "29": ["Celle", 52.62, 10.08],
  "30": ["Hannover", 52.37, 9.73],
  "31": ["Hildesheim", 52.15, 9.95],
  "32": ["Herford", 52.11, 8.67],
  "33": ["Bielefeld", 52.02, 8.53],
  "34": ["Kassel", 51.31, 9.48],
  "35": ["Gießen", 50.58, 8.67],
  "36": ["Fulda", 50.55, 9.68],
  "37": ["Göttingen", 51.54, 9.93],
  "38": ["Braunschweig", 52.27, 10.52],
  "39": ["Magdeburg", 52.12, 11.63],
  "40": ["Düsseldorf", 51.23, 6.77],
  "41": ["Mönchengladbach", 51.19, 6.44],
  "42": ["Wuppertal", 51.26, 7.15],
  "44": ["Dortmund", 51.51, 7.47],
  "45": ["Essen", 51.46, 7.01],
  "46": ["Oberhausen", 51.47, 6.85],
  "47": ["Duisburg", 51.43, 6.76],
  "48": ["Münster", 51.96, 7.63],
  "49": ["Osnabrück", 52.28, 8.05],
  "50": ["Köln", 50.94, 6.96],
  "51": ["Köln", 50.94, 7.05],
  "52": ["Aachen", 50.78, 6.08],
  "53": ["Bonn", 50.73, 7.1],
  "54": ["Trier", 49.75, 6.64],
  "55": ["Mainz", 50.0, 8.27],
  "56": ["Koblenz", 50.36, 7.59],
  "57": ["Siegen", 50.87, 8.02],
  "58": ["Hagen", 51.36, 7.47],
  "59": ["Hamm", 51.68, 7.82],
  "60": ["Frankfurt am Main", 50.11, 8.68],
  "61": ["Bad Homburg", 50.23, 8.62],
  "63": ["Offenbach", 50.1, 8.77],
  "64": ["Darmstadt", 49.87, 8.65],
  "65": ["Wiesbaden", 50.08, 8.24],
  "66": ["Saarbrücken", 49.24, 6.99],
  "67": ["Ludwigshafen", 49.48, 8.44],
  "68": ["Mannheim", 49.49, 8.47],
  "69": ["Heidelberg", 49.4, 8.67],
  "70": ["Stuttgart", 48.78, 9.18],
  "71": ["Böblingen", 48.68, 9.01],
  "72": ["Tübingen", 48.52, 9.06],
  "73": ["Göppingen", 48.7, 9.65],
  "74": ["Heilbronn", 49.14, 9.22],
  "75": ["Pforzheim", 48.89, 8.7],
  "76": ["Karlsruhe", 49.01, 8.4],
  "77": ["Offenburg", 48.47, 7.94],
  "78": ["Konstanz", 47.66, 9.18],
  "79": ["Freiburg", 47.99, 7.85],
  "80": ["München", 48.14, 11.58],
  "81": ["München", 48.12, 11.6],
  "82": ["Starnberg", 48.0, 11.34],
  "83": ["Rosenheim", 47.86, 12.12],
  "84": ["Landshut", 48.54, 12.15],
  "85": ["Ingolstadt", 48.77, 11.43],
  "86": ["Augsburg", 48.37, 10.9],
  "87": ["Kempten", 47.73, 10.31],
  "88": ["Ravensburg", 47.78, 9.61],
  "89": ["Ulm", 48.4, 9.99],
  "90": ["Nürnberg", 49.45, 11.08],
  "91": ["Erlangen", 49.6, 11.0],
  "92": ["Weiden", 49.68, 12.16],
  "93": ["Regensburg", 49.01, 12.1],
  "94": ["Passau", 48.57, 13.43],
  "95": ["Bayreuth", 49.95, 11.58],
  "96": ["Bamberg", 49.89, 10.89],
  "97": ["Würzburg", 49.79, 9.95],
  "98": ["Suhl", 50.61, 10.69],
  "99": ["Erfurt", 50.98, 11.03],
};

/** EU destinations, selectable as cities rather than postcodes. */
export const EU_CITIES: Place[] = [
  { key: "amsterdam", name: "Amsterdam", lat: 52.37, lon: 4.9, country: "NL" },
  { key: "rotterdam", name: "Rotterdam", lat: 51.92, lon: 4.48, country: "NL" },
  { key: "brussels", name: "Brüssel", lat: 50.85, lon: 4.35, country: "BE" },
  { key: "luxembourg", name: "Luxemburg", lat: 49.61, lon: 6.13, country: "LU" },
  { key: "copenhagen", name: "København", lat: 55.68, lon: 12.57, country: "DK" },
  { key: "vienna", name: "Wien", lat: 48.21, lon: 16.37, country: "AT" },
  { key: "salzburg", name: "Salzburg", lat: 47.81, lon: 13.04, country: "AT" },
  { key: "zurich", name: "Zürich", lat: 47.37, lon: 8.54, country: "CH" },
  { key: "basel", name: "Basel", lat: 47.56, lon: 7.59, country: "CH" },
  { key: "warsaw", name: "Warszawa", lat: 52.23, lon: 21.01, country: "PL" },
  { key: "szczecin", name: "Szczecin", lat: 53.43, lon: 14.55, country: "PL" },
  { key: "paris", name: "Paris", lat: 48.86, lon: 2.35, country: "FR" },
  { key: "strasbourg", name: "Strasbourg", lat: 48.57, lon: 7.75, country: "FR" },
];

/** Countries outside the EU customs union — triggers the customs fee. */
export const NON_EU: CountryCode[] = ["CH"];

export function isValidGermanPostcode(value: string | null | undefined): value is string {
  return !!value && /^\d{5}$/.test(value) && value.slice(0, 2) in DE_REGIONS;
}

export function resolvePlace(country: CountryCode, postcode: string | null): Place | null {
  if (!postcode) return null;
  if (country === "DE") {
    if (!isValidGermanPostcode(postcode)) return null;
    const [name, lat, lon] = DE_REGIONS[postcode.slice(0, 2)];
    return { key: postcode, name, lat, lon, country };
  }
  return EU_CITIES.find((c) => c.key === postcode) ?? null;
}

/** Great-circle distance in km. */
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
