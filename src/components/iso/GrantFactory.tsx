"use client";

import type { ReactNode } from "react";
import { Check, Flag } from "lucide-react";
import { iso, Prism, pts, facingY, type Box, type Point } from "./iso";
import { Figure } from "./figure";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The grant pipeline as a production line, in Pesto's isometric kit. One
 * application goes through per loop: the grant call is parsed, split into
 * sections, each section is drafted by the LLM with the grant's rules on one
 * side and the client's own documents on the other, then the judge scores
 * every section and flags where company guidelines pull against a grant
 * requirement. Then a person decides: the expert resolves the flag, approves
 * and the application goes out. Every name and number is invented.
 */

const LOOP = 17;
const STILL = 13.1;

// ── the line ──
const BELT_Y = 125, BELT_D = 30, BELT_TOP = 14;
const CY = BELT_Y + BELT_D / 2;
const FLOOR: Box = { x: -24, y: -20, w: 540, d: 300, z0: -10, z1: 0 };
const BELT: Box = { x: -10, y: BELT_Y, w: 400, d: BELT_D, z0: 0, z1: BELT_TOP };
const LLM: Box = { x: 218, y: BELT_Y - 12, w: 50, d: BELT_D + 24, z0: 0, z1: 50 };
const RULES: Box = { x: 150, y: -12, w: 46, d: 40, z0: 0, z1: 40 };
const DOCS: Box = { x: 216, y: 214, w: 54, d: 46, z0: 0, z1: 40 };
const PARTNER: Box = { x: 300, y: 218, w: 34, d: 32, z0: 0, z1: 24 };
const TRAY: Box = { x: 396, y: BELT_Y - 4, w: 62, d: BELT_D + 8, z0: 0, z1: 22 };
const STACK: Box = { x: -50, y: BELT_Y - 2, w: 34, d: BELT_D + 4, z0: 0, z1: 26 };

/** A gate over the belt: two posts and a beam. */
const gate = (x: number) => ({
  back: { x, y: BELT_Y - 10, w: 10, d: 8, z0: 0, z1: 44 } as Box,
  front: { x, y: BELT_Y + BELT_D + 2, w: 10, d: 8, z0: 0, z1: 44 } as Box,
  beam: { x, y: BELT_Y - 10, w: 10, d: BELT_D + 20, z0: 44, z1: 54 } as Box,
});
const PARSE_X = 70, SPLIT_X = 150, JUDGE_X = 336;

// ── the timeline ──
const ease = (p: number) => { const q = Math.min(1, Math.max(0, p)); return q * q * (3 - 2 * q); };
const lerp = (a: number, b: number, p: number) => a + (b - a) * ease(p);
const span = (t: number, a: number, b: number) => (t - a) / (b - a);

/** The whole call, before it is split. */
function docX(t: number) {
  if (t < 1.2) return lerp(-4, PARSE_X, span(t, 0, 1.2));
  if (t < 1.8) return PARSE_X;
  return lerp(PARSE_X, SPLIT_X, span(t, 1.8, 2.6));
}

const SECTIONS = [
  { name: "Summary", score: 9, note: "Clear aim and scope" },
  { name: "Impact", score: 8, note: "Add one number per outcome" },
  { name: "Work plan", score: 6, note: "Company guidelines vs grant rule", flag: true },
  { name: "Budget", score: 8, note: "Cost per participant missing" },
];
const GAP = 19;

/** The lead section card's x, after the split. The rest follow it. */
function leadX(t: number) {
  if (t < 3.1) return SPLIT_X;
  if (t < 4.4) return lerp(SPLIT_X, 248, span(t, 3.1, 4.4));
  if (t < 6.0) return 248;
  if (t < 7.1) return lerp(248, JUDGE_X + 6, span(t, 6.0, 7.1));
  if (t < 9.6) return lerp(JUDGE_X + 6, JUDGE_X + 6 + GAP * 3 + 4, span(t, 7.1, 9.6));
  return lerp(JUDGE_X + 6 + GAP * 3 + 4, 452, span(t, 9.6, 10.5));
}

/** Where card i is: on the belt in a train, then stacked on the tray. */
function cardAt(i: number, t: number) {
  const lead = leadX(t);
  if (t < 9.6) return { x: lead - i * GAP, z: BELT_TOP };
  const p = ease(span(t, 9.6, 10.5));
  const fromX = lead - i * GAP * (1 - p);
  const out = ease(span(t, SUBMIT, SUBMIT + 1.1));
  return { x: Math.min(fromX, 420) + out * 46, z: lerp(BELT_TOP, TRAY.z1 + i * 3.2, p) + out * 70 };
}

/** The expert's part: read the stack, settle the flag, approve, send. */
const REVIEW = 10.8, RESOLVE = 12.6, APPROVE = 13.6, SUBMIT = 14.4;
const REVIEWER = { x: 482, y: BELT_Y + 22 };

/** Has card i been judged yet. */
const judged = (i: number, t: number) => cardAt(i, t).x >= JUDGE_X + 5 || t >= 9.6;

/** A sheet lying on the belt. */
function Sheet({ x, z, w, d, className }: { x: number; z: number; w: number; d: number; className: string }) {
  return <Prism b={{ x: x - w / 2, y: CY - d / 2, w, d, z0: z, z1: z + 3 }} className={className} />;
}

/** A dotted flow along a straight 3D line, moving from a to b. */
function Pipe({ a, b, t, on, faint }: { a: [number, number, number]; b: [number, number, number]; t: number; on: boolean; faint?: boolean }) {
  const p0 = iso(...a), p1 = iso(...b);
  return <g className={cn("gp-pipe", faint && "faint")}>
    <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} />
    {on && [0, 1, 2, 3].map((k) => {
      const s = ((t * 1.1) + k / 4) % 1;
      return <circle key={k} cx={p0.x + (p1.x - p0.x) * s} cy={p0.y + (p1.y - p0.y) * s} r={2.6} />;
    })}
  </g>;
}

/** Lines of text on the top of a block, as on a printed page. */
function PageLines({ b, n = 3 }: { b: Box; n?: number }) {
  return <g className="gp-page-lines">
    {Array.from({ length: n }, (_, k) => {
      const y = b.y + 7 + k * ((b.d - 12) / Math.max(1, n - 1));
      const a = iso(b.x + 6, y, b.z1), c = iso(b.x + b.w - 8 - (k === n - 1 ? 10 : 0), y, b.z1);
      return <line key={k} x1={a.x} y1={a.y} x2={c.x} y2={c.y} />;
    })}
  </g>;
}

const BOUNDS = (() => {
  const c = [iso(FLOOR.x, FLOOR.y, 0), iso(FLOOR.x + FLOOR.w, FLOOR.y, 0), iso(FLOOR.x, FLOOR.y + FLOOR.d, FLOOR.z0), iso(FLOOR.x + FLOOR.w, FLOOR.y + FLOOR.d, FLOOR.z0), iso(RULES.x, RULES.y, 110)];
  const xs = c.map((p) => p.x), ys = c.map((p) => p.y);
  return { x: Math.min(...xs) - 6, y: Math.min(...ys) - 6, w: Math.max(...xs) - Math.min(...xs) + 12, h: Math.max(...ys) - Math.min(...ys) + 12 };
})();
const at = (p: Point) => ({ left: `${((p.x - BOUNDS.x) / BOUNDS.w) * 100}%`, top: `${((p.y - BOUNDS.y) / BOUNDS.h) * 100}%` });

function Label({ p, children, strong, right, left, paint }: { p: Point; children: ReactNode; strong?: boolean; right?: boolean; left?: boolean; paint?: boolean }) {
  return <span className={cn("gp-label", strong && "strong", right && "right", left && "left", paint && "paint")} style={at(p)}>{children}</span>;
}

export function GrantFactory() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, STILL);

  const writing = t >= 4.3 && t < 6.1;
  const scanning = t >= 1.2 && t < 1.9;
  const fade = t > 16.2 ? 1 - span(t, 16.2, LOOP) : t < 0.3 ? span(t, 0, 0.3) : 1;
  const resolved = t >= RESOLVE;
  const sent = Math.min(1, Math.max(0, span(t, SUBMIT, SUBMIT + 1.1)));
  const split = t >= 2.6;
  const g1 = gate(PARSE_X), g2 = gate(SPLIT_X), g3 = gate(JUDGE_X);
  const belt = (t * 22) % 20;

  // Which card the judge is reading now.
  const reading = SECTIONS.findIndex((_, i) => !judged(i, t));
  const lastJudged = reading === -1 ? SECTIONS.length - 1 : reading - 1;
  const showScore = t >= 7.1 && t < 10.6 && lastJudged >= 0;
  const current = SECTIONS[Math.max(0, lastJudged)];

  const cards = SECTIONS.map((s, i) => ({ s, i, ...cardAt(i, t) }));
  const behindLlm = split ? cards.filter((c) => c.x < LLM.x + LLM.w / 2) : [];
  const afterLlm = split ? cards.filter((c) => c.x >= LLM.x + LLM.w / 2) : [];
  const onTray = (c: { x: number }) => c.x > TRAY.x - 6;

  const card = (c: (typeof cards)[number]) => {
    const hidden = c.x > LLM.x + 4 && c.x < LLM.x + LLM.w - 4;
    if (hidden) return null;
    const done = judged(c.i, t);
    const flagged = done && c.s.flag && !resolved;
    return <g key={c.i} opacity={onTray(c) ? 1 - sent : 1}>
      <Sheet x={c.x} z={c.z} w={15} d={20} className={cn("gp-card", `s${c.i}`, flagged && "flagged")} />
      {done && (() => {
        const head = iso(c.x, CY, c.z + 3);
        return <g className={cn("gp-badge", flagged && "bad")} transform={`translate(${head.x.toFixed(1)} ${(head.y - 13).toFixed(1)})`}>
          <circle r={6.5} />
          {flagged ? <Flag x={-3.6} y={-3.6} width={7.2} height={7.2} strokeWidth={2.6} /> : <Check x={-4} y={-4} width={8} height={8} strokeWidth={3} />}
        </g>;
      })()}
    </g>;
  };

  if (!mounted) return <div ref={ref} className="gp" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }} />;

  return <div><div ref={ref} className="gp" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }}>
    <svg viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`} aria-hidden="true">
      <defs><filter id="gp-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5" /></filter></defs>
      <Prism b={FLOOR} className="gp-floor" />
      {/* Contact shadows, so nothing floats: each block's footprint, pushed away from the light and blurred. */}
      <g className="gp-shadows" filter="url(#gp-soft)">
        {[STACK, RULES, DOCS, PARTNER, LLM, TRAY, BELT, ...[g1, g2, g3].flatMap((g) => [g.back, g.front])].map((b, i) => {
          const k = Math.min(14, b.z1 * 0.22);
          return <polygon key={i} points={pts([iso(b.x + 2, b.y + 2, 0), iso(b.x + b.w + k, b.y + 2, 0), iso(b.x + b.w + k, b.y + b.d + k * 0.6, 0), iso(b.x + 2, b.y + b.d + k * 0.6, 0)])} />;
        })}
      </g>

      {/* Sources behind and in front of the writer, and their pipes into it. */}
      <Prism b={STACK} className="gp-stack" />
      <PageLines b={STACK} />
      <Prism b={RULES} className="gp-module rules" />
      <PageLines b={RULES} n={4} />
      <Pipe a={[RULES.x + RULES.w, RULES.y + RULES.d - 8, 24]} b={[LLM.x + 12, LLM.y, 24]} t={t} on={writing} />

      {/* The belt, its tread moving. */}
      <Prism b={BELT} className="gp-belt" />
      {Array.from({ length: 21 }, (_, k) => {
        const x = BELT.x + ((k * 20 + belt) % 400);
        const a = iso(x, BELT_Y + 2, BELT_TOP), b = iso(x, BELT_Y + BELT_D - 2, BELT_TOP);
        return <line key={k} className="gp-tread" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })}

      {/* The judge's screen stands behind the belt. */}
      <Prism b={{ x: JUDGE_X + 3, y: BELT_Y - 22, w: 5, d: 5, z0: 0, z1: 62 }} className="gp-gate" />
      <polygon className="gp-screen" points={pts(facingY(JUDGE_X - 22, JUDGE_X + 34, BELT_Y - 12, 58, 92))} />
      <polygon className={cn("gp-screen-glass", showScore && (current.flag ? "bad" : "ok"))} points={pts(facingY(JUDGE_X - 19, JUDGE_X + 31, BELT_Y - 11.5, 61, 89))} />

      {[g1, g2, g3].map((g, i) => <Prism key={i} b={g.back} className="gp-gate" />)}

      <g opacity={fade}>
        {/* The grant call, then the sections it is split into. */}
        {!split && <Sheet x={docX(t)} z={BELT_TOP} w={24} d={22} className="gp-doc" />}
        {behindLlm.map(card)}
      </g>

      <Prism b={LLM} className={cn("gp-llm", writing && "on")} />
      <Prism b={TRAY} className="gp-module" />
      {/* The expert stands beside the tray: the one manual step. */}
      <Figure x={REVIEWER.x} y={REVIEWER.y} tone="waiter" hair="short" face={-1} scale={1.1} t={t}
        pose={t >= RESOLVE && t < APPROVE + 0.6 ? "point" : t >= REVIEW && t < SUBMIT ? "hold" : "idle"} />


      <g opacity={fade}>
        {afterLlm.filter((c) => !onTray(c)).map(card)}
        {afterLlm.filter(onTray).map(card)}
      </g>

      {[g1, g2, g3].map((g, i) => <g key={i}><Prism b={g.front} className="gp-gate" /><Prism b={g.beam} className={cn("gp-gate", i === 0 && scanning && "scan")} /></g>)}
      {scanning && (() => {
        const a = iso(PARSE_X + 5, BELT_Y, BELT_TOP + 4), b = iso(PARSE_X + 5, BELT_Y + BELT_D, BELT_TOP + 4);
        return <line className="gp-scan" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })()}

      {/* In front: the client's own documents, and partner sources when there are any. */}
      <Pipe a={[243, DOCS.y, 24]} b={[243, LLM.y + LLM.d, 24]} t={t + 0.3} on={writing} />
      <Pipe a={[PARTNER.x, PARTNER.y + 10, 14]} b={[LLM.x + LLM.w, LLM.y + LLM.d - 6, 14]} t={t + 0.6} on={writing} faint />
      <Prism b={DOCS} className="gp-module docs" />
      <PageLines b={DOCS} n={3} />
      <Prism b={PARTNER} className="gp-module partner" />
    </svg>

    <Label p={iso(STACK.x + 17, STACK.y + 10, 50)}>Grant call</Label>
    <Label p={iso(PARSE_X + 5, BELT_Y + BELT_D + 22, -6)}>Parse</Label>
    <Label p={iso(SPLIT_X + 5, BELT_Y - 10, 70)}>Sections</Label>
    <Label p={iso(LLM.x + LLM.w / 2, LLM.y + LLM.d / 2, 84)} strong>LLM drafts</Label>
    <Label p={iso(RULES.x + 23, RULES.y + 10, 60)}>Grant &amp; EU rules</Label>
    <Label p={iso(JUDGE_X + 6, BELT_Y - 12, 110)} strong>LLM-as-judge</Label>
    <Label p={iso(DOCS.x - 6, DOCS.y + DOCS.d, -4)} right>Client docs · RAG</Label>
    <Label p={iso(PARTNER.x + 17, PARTNER.y + PARTNER.d, -16)}>Partner sources, sometimes</Label>

    {t >= REVIEW - 0.2 && t < SUBMIT + 1.2 && (
      <div className="gp-review" style={{ opacity: Math.min(1, (SUBMIT + 1.2 - t) / 0.3) }}>
        <div className="gp-review-head">Expert review <span>{resolved ? "0 flags" : "1 flag"}</span></div>
        {SECTIONS.map((sec) => (
          <div key={sec.name} className={cn("gp-review-row", sec.flag && !resolved && "bad")}>
            <span>{sec.name}</span>
            <span className="score">{sec.score}/10</span>
            {sec.flag && !resolved ? <Flag className="size-3" strokeWidth={2.6} /> : <Check className="size-3" strokeWidth={3} />}
            {sec.flag && <div className="gp-review-choice">
              {resolved ? <em>Kept the grant rule, client told</em> : <>
                <span className={cn("opt", t >= RESOLVE - 0.45 && "press")}>Keep grant rule</span>
                <span className="opt">Fix source</span>
              </>}
            </div>}
          </div>
        ))}
        <div className={cn("gp-review-go", t >= APPROVE - 0.35 && "press", t >= APPROVE && "done")}>{t >= APPROVE ? "Approved" : "Approve & submit"}</div>
      </div>
    )}
    {t >= APPROVE && t < SUBMIT + 0.4 && <span className="gp-stamp" style={at(iso(TRAY.x + 30, TRAY.y + TRAY.d / 2, 48))}>Approved</span>}
    {t >= SUBMIT + 0.5 && t < 16.3 && <span className="gp-sent" style={at(iso(TRAY.x + 40, TRAY.y + TRAY.d, 64))}><Check className="size-3.5" strokeWidth={3} /> Submitted</span>}

    {showScore && (
      <span key={lastJudged} className={cn("gp-score", current.flag && "bad")} style={at(iso(JUDGE_X + 34, BELT_Y - 12, 70))}>
        <b>{current.name} {current.score}/10</b>
        <span>{current.note}</span>
      </span>
    )}
    </div>
    <ol className="gp-steps" aria-hidden>
      {STEPS.map(([name, from], i) => {
        const next = STEPS[i + 1]?.[1] ?? LOOP;
        return <li key={name} className={cn(t >= from && t < next && "on", t >= next && "done")}>{name}</li>;
      })}
    </ol>
  </div>;
}

const STEPS: [string, number][] = [["Parse", 0], ["Split", 1.8], ["Draft", 3.1], ["Judge", 6.6], ["Expert review", REVIEW], ["Submit", SUBMIT]];
