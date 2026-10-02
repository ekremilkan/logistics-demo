/**
 * Stylised Germany for the coverage map: a deliberately angular outline,
 * like a road atlas index map. Coordinates are [lon, lat].
 */
export const GERMANY: [number, number][] = [
  [7.0, 53.35], [7.25, 53.68], [7.75, 53.72], [8.2, 53.55], [8.55, 53.62], [8.68, 53.88],
  [9.0, 53.9], [8.88, 54.12], [8.62, 54.33], [8.88, 54.47], [8.65, 54.62], [8.62, 54.92],
  [9.4, 54.83], [9.95, 54.72], [10.05, 54.45], [10.75, 54.32], [11.1, 54.42], [11.0, 54.02],
  [11.5, 54.02], [12.1, 54.18], [12.45, 54.42], [13.0, 54.42], [13.25, 54.62], [13.65, 54.55],
  [13.7, 54.18], [14.2, 53.95], [14.42, 53.3], [14.15, 52.85], [14.6, 52.6], [14.72, 52.1],
  [14.62, 51.6], [15.0, 51.15], [14.82, 50.87], [14.32, 51.02], [13.9, 50.78], [13.2, 50.52],
  [12.55, 50.4], [12.18, 50.32], [12.52, 49.92], [12.45, 49.68], [12.9, 49.35], [13.42, 48.98],
  [13.82, 48.75], [13.45, 48.56], [13.02, 48.28], [12.78, 47.72], [13.0, 47.48], [12.75, 47.68],
  [12.2, 47.62], [11.65, 47.6], [11.1, 47.4], [10.45, 47.55], [10.18, 47.3], [9.6, 47.55],
  [8.85, 47.7], [8.55, 47.8], [8.2, 47.62], [7.6, 47.58], [7.55, 48.08], [7.8, 48.6],
  [8.2, 48.97], [7.6, 49.05], [7.05, 49.12], [6.72, 49.18], [6.38, 49.45], [6.5, 49.75],
  [6.12, 50.12], [6.4, 50.33], [6.0, 50.75], [5.88, 51.05], [6.18, 51.18], [6.08, 51.55],
  [5.95, 51.82], [6.4, 51.85], [6.75, 52.1], [7.05, 52.25], [6.7, 52.48], [7.05, 52.65],
  [7.2, 53.0],
];

export const CITIES = {
  bremen: { name: "Bremen", lon: 8.8, lat: 53.08, code: "HB" },
  hamburg: { name: "Hamburg", lon: 9.99, lat: 53.55, code: "HH" },
  berlin: { name: "Berlin", lon: 13.4, lat: 52.52, code: "B" },
  hannover: { name: "Hannover", lon: 9.73, lat: 52.37, code: "H" },
  koeln: { name: "Köln", lon: 6.96, lat: 50.94, code: "K" },
  frankfurt: { name: "Frankfurt", lon: 8.68, lat: 50.11, code: "F" },
  leipzig: { name: "Leipzig", lon: 12.37, lat: 51.34, code: "L" },
  dresden: { name: "Dresden", lon: 13.74, lat: 51.05, code: "DD" },
  stuttgart: { name: "Stuttgart", lon: 9.18, lat: 48.78, code: "S" },
  nuernberg: { name: "Nürnberg", lon: 11.08, lat: 49.45, code: "N" },
  muenchen: { name: "München", lon: 11.58, lat: 48.14, code: "M" },
} as const;

export type CityKey = keyof typeof CITIES;

const K = 100;
const LON0 = 5.6;
const LAT0 = 55.2;
const COS = Math.cos((51 * Math.PI) / 180);

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * COS * K, (LAT0 - lat) * K];
}

export const OUTLINE_PATH =
  GERMANY.map(([lon, lat], i) => {
    const [x, y] = project(lon, lat);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

/** Quadratic arc between two cities, bowed to one side. */
export function arc(a: CityKey, b: CityKey, bow = 0.2) {
  const [x1, y1] = project(CITIES[a].lon, CITIES[a].lat);
  const [x2, y2] = project(CITIES[b].lon, CITIES[b].lat);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bow;
  const cy = my + dx * bow;
  const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const at = (t: number): [number, number] => [
    (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2,
    (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2,
  ];
  return { d, at };
}
