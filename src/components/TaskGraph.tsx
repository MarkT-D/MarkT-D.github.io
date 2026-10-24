"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import graph from "@/lib/task-graph.json";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";
import { Fit } from "./Fit";

/**
 * Pesto's problem slide, playing by itself: a restaurant, the three things it
 * has to run, and the 43 tasks under them grow out cluster by cluster. Then
 * the whole graph folds into one system. Geometry from Pesto's deck.
 */

const LABELS = [
  "Restaurant", "Menu", "Management\nsoftware", "Payments &\nfiscal",
  "Structure", "Plan the\nmenu structure", "Enter dishes,\nprices, portions", "Describe\ningredients",
  "Compliance", "Allergens\nEU 1169/2011", "Calculate\nnutrition",
  "Publishing", "Dish photos", "Translate for\nforeign guests", "Digital menu\nand updates",
  "Setup", "Choose the\nsoftware", "Load dishes\nand recipes", "Add-ons and\nmodifiers", "Staff\nroles",
  "Kitchen & floor", "Orders sent\nto the kitchen", "Tables and\nfloor plan", "Stop list",
  "Stock", "Stock\nlevels", "Recipe-based\nwrite-offs", "Goods\nreceiving", "Expiry\ndates", "Sales and\nstock analytics",
  "Payments", "Card acquiring", "Business\nverification", "Online payment\nwith the order",
  "Fiscal", "Terminal\nand till", "Fiscal\nsolution", "Access and\ndelegations", "Taxes and\npayment types",
  "Control", "Fiscal\ndocument", "Reporting to the\ntax authority", "Errors, receipts\nand refunds",
];

/** Tasks the AI does for the owner: they glow before the fold. */
const AI_TASKS = new Set([6, 7, 9, 10, 13, 17, 26]);

const PARTS = [
  { title: "Menu", body: "From a photo of the paper menu, in any language. Guests order and pay by QR.", ai: true,
    tags: [["Menu from a photo", true], ["Translations", true], ["Allergens, nutrition", true], ["QR ordering", false]] },
  { title: "Floor, kitchen, stock", body: "Till, floor plan, kitchen screens, stock and reports in one place.", ai: true,
    tags: [["Tech cards drafted", true], ["Delivery from a photo", true], ["Kitchen screens", false], ["Reports", false]] },
  { title: "Payments & receipts", body: "Card payments at the table, and the fiscal receipt filed by itself.",
    tags: [["Split bills by phone", false], ["Receipts filed", false]] },
] as { title: string; body: string; ai?: boolean; tags: [string, boolean][] }[];

type Node = (typeof graph.nodes)[number];
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const HUB_END = 1.1;
const hubs = graph.nodes.flatMap((n, i) => (n.depth === 1 ? [i] : []));
const childrenOf = (p: number) => graph.nodes.flatMap((n, i) => (i && n.parent === p ? [i] : []));
const REVEAL: Record<number, number> = {};
{
  hubs.forEach((h, i) => { REVEAL[h] = 0.05 + i * 0.12; });
  let at = HUB_END + 0.1;
  for (const hub of hubs) {
    const subs = childrenOf(hub);
    for (const s of subs) { REVEAL[s] = at; at += 0.1; }
    for (const s of subs) for (const leaf of childrenOf(s)) { REVEAL[leaf] = at; at += 0.05; }
    at += 0.15;
  }
}
const GROW: Record<number, number> = { 1: 0.8, 2: 0.6, 3: 0.55 };
const INTRO = Math.max(...Object.entries(REVEAL).map(([i, s]) => s + GROW[graph.nodes[Number(i)].depth])) + 0.05;
const HOLD = 2.6;
const FOLD = INTRO + HOLD;
const LOOP = FOLD + 7.5;
export const TG_LOOP = LOOP;
const STILL = INTRO + 0.5;

function position(n: Node, index: number, t: number) {
  let x = n.x, y = n.y, s = 1, a = 1;
  const parent = graph.nodes[n.parent];
  if (t < FOLD) {
    if (n.depth) {
      const p = ease((t - REVEAL[index]) / GROW[n.depth]);
      x = mix(parent.x, n.x, p); y = mix(parent.y, n.y, p); s = mix(0.12, 1, p); a = p;
    }
  } else {
    const local = t - FOLD;
    if (n.depth) {
      const start = ({ 3: 0.15, 2: 0.8, 1: 1.4 } as Record<number, number>)[n.depth];
      const p = ease((local - start) / 0.62);
      x = mix(x, parent.x, p); y = mix(y, parent.y, p); s = mix(1, 0.12, p); a = 1 - ease((p - 0.65) / 0.35);
    } else {
      a = 1 - ease((local - 2) / 0.28);
    }
  }
  return { x, y, s, a };
}

function boundary(from: { x: number; y: number; s: number }, n: Node, to: { x: number; y: number }): [number, number] {
  const dx = to.x - from.x, dy = to.y - from.y;
  const w = n.w * from.s, h = n.h * from.s;
  const k = Math.min(dx ? w / 2 / Math.abs(dx) : Infinity, dy ? h / 2 / Math.abs(dy) : Infinity, 1);
  return [from.x + dx * k, from.y + dy * k];
}

const KIND = ["root", "hub", "sub", "leaf"] as const;

export function TaskGraph({ time }: { time?: number } = {}) {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const own = useSceneClock(LOOP, inView && time === undefined, STILL);
  const t = time ?? own;
  const states = useMemo(() => graph.nodes.map((n, i) => position(n, i, t)), [t]);
  const shown = graph.nodes.filter((_, i) => states[i].a > 0.5).length;
  const local = t - FOLD;
  const brand = ease((local - 2) / 0.3);
  const fadeOut = 1 - ease((t - (LOOP - 0.5)) / 0.5);
  const folded = local > 1.6;
  const glow = t > INTRO - 0.4 && t < FOLD + 0.4;

  return (
    <div ref={ref} className="tg">
      <div className="tg-head">
        <p className={cn("tg-line", folded && "dim")}>Restaurants should be about <em>food</em> and <em>guests</em>.</p>
        <p className={cn("tg-line", folded && "dim")}>Instead, they&apos;re buried in <em>{shown || 43} tasks</em> of software, compliance and paperwork.</p>
        <p className={cn("tg-line accent", !folded && "hide")}>Pesto puts them in <em>one system</em>, and lets AI do the typing.</p>
      </div>
      <Fit width={1100} minScale={0.62} follow="instant" focus={t < FOLD ? 550 + 300 * Math.sin((2 * Math.PI * t) / FOLD) : 550}>
      <div className="tg-stage" style={{ opacity: fadeOut }}>
        {mounted && (
          <svg viewBox="20 140 1260 545" role="img" aria-label="A graph of 43 restaurant tasks under menu, management software and payments, folding into one Pesto system">
            <g className="tg-edges">
              {graph.edges.map(([a, b], i) => {
                const p = boundary(states[a], graph.nodes[a], states[b]);
                const q = boundary(states[b], graph.nodes[b], states[a]);
                const o = Math.min(states[a].a, states[b].a);
                return o > 0.001 && <line key={i} x1={p[0].toFixed(1)} y1={p[1].toFixed(1)} x2={q[0].toFixed(1)} y2={q[1].toFixed(1)} opacity={o} />;
              })}
            </g>
            {graph.nodes.map((n, i) => {
              const st = states[i];
              if (st.a <= 0.001) return null;
              const parts = LABELS[i].split("\n");
              const size = n.fs * (n.depth === 3 ? 0.9 : 0.96);
              return <g key={i} className={cn("tg-node", KIND[n.depth], glow && AI_TASKS.has(i) && "ai")} transform={`translate(${st.x.toFixed(1)} ${st.y.toFixed(1)}) scale(${st.s.toFixed(3)})`} opacity={st.a}>
                <rect x={-n.w / 2} y={-n.h / 2} width={n.w} height={n.h} rx={Math.min(12, n.h / 3)} />
                {parts.map((part, j) => <text key={j} x="0" y={(j - (parts.length - 1) / 2) * size * 1.1} textAnchor="middle" dominantBaseline="central" fontSize={size}>{part}</text>)}
              </g>;
            })}
            <text className="tg-brand" x={640} y={mix(430, 250, ease((local - 2.55) / 0.75))} textAnchor="middle" fontSize="64" opacity={brand}>Pesto</text>
          </svg>
        )}
        <div className="tg-parts">
          {PARTS.map((p, i) => {
            const k = ease((local - 3.2 - i * 0.4) / 0.6);
            return <div key={p.title} aria-hidden={k < 0.5} className={cn("tg-part", p.ai && "ai")} style={{ opacity: k, transform: `translateY(${(10 * (1 - k)).toFixed(1)}px)` }}>
              <h4>{p.title}{p.ai && <span><Sparkles /> AI</span>}</h4>
              <p>{p.body}</p>
              <div className="tg-tags">{p.tags.map(([tag, ai]) => <span key={tag} className={cn(ai && "ai")}>{ai && <Sparkles />}{tag}</span>)}</div>
            </div>;
          })}
        </div>
        {glow && <span className="tg-legend"><i /> Tasks AI does for the owner</span>}
      </div>
      </Fit>
    </div>
  );
}
