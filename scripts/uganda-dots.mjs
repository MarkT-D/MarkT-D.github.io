#!/usr/bin/env node
/**
 * Uganda as a field of dots, for the TRAC FM case study. Adapted from Pesto's
 * italy-dots.mjs. Reads Natural Earth 1:50m from the world-atlas package and
 * writes src/lib/uganda-dots.json once; the site never fetches a map.
 *
 *   node scripts/uganda-dots.mjs <path-to-countries-50m.json>
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SRC = process.argv[2];
const UGANDA = "800";
const OUT = fileURLToPath(new URL("../src/lib/uganda-dots.json", import.meta.url));
const WANT = 520;
const K = 80;
const COS = Math.cos((1.5 * Math.PI) / 180);
// Radio stations in the picture: illustrative towns, not TRAC FM's real list.
const TOWNS = { kampala: [32.58, 0.35], gulu: [32.3, 2.78], mbarara: [30.66, -0.61], mbale: [34.18, 1.08], arua: [30.91, 3.02], fortportal: [30.27, 0.67] };

const topology = JSON.parse(await readFile(SRC, "utf8"));
const { scale, translate } = topology.transform;
const arcs = topology.arcs.map((arc) => { let x = 0, y = 0; return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; }); });
const arcAt = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
const ring = (idx) => idx.flatMap((i, n) => (n ? arcAt(i).slice(1) : arcAt(i)));
const g = topology.objects.countries.geometries.find((x) => x.id === UGANDA);
const polygons = g.type === "Polygon" ? [g.arcs] : g.arcs;
const rings = polygons.flatMap((p) => p.map(ring));
const lons = rings.flat().map(([a]) => a), lats = rings.flat().map(([, b]) => b);
const west = Math.min(...lons), east = Math.max(...lons), north = Math.max(...lats), south = Math.min(...lats);
const project = ([lon, lat]) => [(lon - west) * COS * K, (north - lat) * K];
const shapes = rings.map((pts) => pts.map(project));
const w = (east - west) * COS * K, h = (north - south) * K;
function inside(x, y) { let hit = false; for (const s of shapes) for (let i = 0, j = s.length - 1; i < s.length; j = i++) { const [xi, yi] = s[i], [xj, yj] = s[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit; } return hit; }
function grid(step) { const d = []; const rs = (step * Math.sqrt(3)) / 2; for (let r = 0, y = rs / 2; y < h; r++, y += rs) for (let x = r % 2 ? step : step / 2; x < w; x += step) if (inside(x, y)) d.push([x, y]); return d; }
let lo = 2, hi = 40, best = grid(hi);
for (let n = 0; n < 40; n++) { const s = (lo + hi) / 2, d = grid(s); if (Math.abs(d.length - WANT) < Math.abs(best.length - WANT)) best = d; if (d.length > WANT) lo = s; else hi = s; }
const r1 = (v) => Math.round(v * 10) / 10;
const dots = best.map(([x, y]) => [r1(x), r1(y)]);
const towns = Object.fromEntries(Object.entries(TOWNS).map(([k, v]) => [k, project(v).map(r1)]));
await writeFile(OUT, JSON.stringify({ w: r1(w), h: r1(h), dots, towns }) + "\n");
console.log(`${dots.length} dots, ${r1(w)} x ${r1(h)}`);
