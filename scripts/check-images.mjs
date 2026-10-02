// Verifies every Unsplash photo in lib/images.ts resolves: `npm run images:check`
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../lib/images.ts", import.meta.url), "utf8");
const ids = [...src.matchAll(/id:\s*"(photo-[\w-]+)"/g)].map((m) => m[1]);
let bad = 0;
for (const id of ids) {
  const url = `https://images.unsplash.com/${id}?w=64&q=10`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    console.log(`${res.ok ? "✓" : "✗"} ${res.status}  ${id}`);
    if (!res.ok) bad++;
  } catch (e) {
    console.log(`✗ ERR  ${id}  (${e.message})`);
    bad++;
  }
}
console.log(bad ? `\n${bad} photo(s) need a new id in lib/images.ts` : "\nAll photos load.");
process.exit(bad ? 1 : 0);
