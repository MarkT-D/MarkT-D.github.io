"use client";

import type { ReactNode } from "react";
import { Briefcase, Check } from "lucide-react";
import { COS, iso, Prism, pts, facingX, facingY, type Box, type Point } from "./iso";
import { Figure, headAt } from "./figure";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The contact section's room, after Pesto's restaurant loop: me at a desk in
 * Barcelona, messages arriving from the channels on the wall, and somebody
 * walking in with a role to talk about. It ends the way the section asks.
 */

const LOOP = 13;
const STILL = 6.4;

const FLOOR: Box = { x: 0, y: 0, w: 300, d: 230, z0: -10, z1: 0 };
const WALL_BACK: Box = { x: 0, y: -10, w: 300, d: 10, z0: 0, z1: 124 };
const WALL_SIDE: Box = { x: -10, y: -10, w: 10, d: 240, z0: 0, z1: 124 };
const DESK: Box = { x: 6, y: 70, w: 58, d: 100, z0: 40, z1: 46 };
const LEGS: Box[] = [[10, 74], [10, 160], [54, 74], [54, 160]].map(([x, y]) => ({ x, y, w: 6, d: 6, z0: 0, z1: 40 }));
const LAPTOP: Box = { x: 16, y: 100, w: 28, d: 36, z0: 46, z1: 48 };
const STOOL: Box = { x: 80, y: 112, w: 24, d: 24, z0: 0, z1: 26 };
const ME = { x: 92, y: 124 };
const SCREEN = iso(18, 118, 62);

/** The channels on the wall, and where each one's messages leave from. */
const SIGNS = [
  { key: "mail", label: "Email", at: iso(0, 34, 100) },
  { key: "in", label: "LinkedIn", at: iso(0, 92, 100) },
  { key: "gh", label: "GitHub", at: iso(0, 150, 100) },
] as const;
const MESSAGES = [{ from: 0, at: 1.0 }, { from: 1, at: 2.6 }, { from: 2, at: 8.4 }, { from: 0, at: 10.2 }];
const FLY = 1.3;

// The visitor: in at the door, across to the desk, and out again.
const DOOR = { x: 244, y: 10 }, STAND = { x: 196, y: 150 };
const IN = { start: 0.6, end: 3.4 }, OUT = { start: 9.4, end: 12.2 };
const ASK = 3.7, ANSWER = 5.0, COFFEE = 6.2;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };

function visitorAt(t: number) {
  if (t < IN.start || t > OUT.end) return null;
  if (t < IN.end) {
    const p = ease((t - IN.start) / (IN.end - IN.start));
    return { x: DOOR.x + (STAND.x - DOOR.x) * p, y: DOOR.y + (STAND.y - DOOR.y) * p, walking: true, face: -1 as const, o: clamp((t - IN.start) / 0.3) };
  }
  if (t < OUT.start) return { ...STAND, walking: false, face: -1 as const, o: 1 };
  const p = ease((t - OUT.start) / (OUT.end - OUT.start));
  return { x: STAND.x + (DOOR.x - STAND.x) * p, y: STAND.y + (DOOR.y - STAND.y) * p, walking: true, face: 1 as const, o: 1 - clamp((t - OUT.end + 0.3) / 0.3) };
}

const BOUNDS = (() => {
  const c = [iso(FLOOR.x, FLOOR.y + FLOOR.d, FLOOR.z0), iso(FLOOR.x + FLOOR.w, FLOOR.y + FLOOR.d, FLOOR.z0), iso(FLOOR.x + FLOOR.w, -10, 124), iso(-10, FLOOR.y + FLOOR.d, 124), iso(-10, -10, 124)];
  const xs = c.map((p) => p.x), ys = c.map((p) => p.y);
  return { x: Math.min(...xs) - 10, y: Math.min(...ys) - 54, w: Math.max(...xs) - Math.min(...xs) + 20, h: Math.max(...ys) - Math.min(...ys) + 64 };
})();
const at = (p: Point) => ({ left: `${((p.x - BOUNDS.x) / BOUNDS.w) * 100}%`, top: `${((p.y - BOUNDS.y) / BOUNDS.h) * 100}%` });

/** Words painted on a wall, reading along it. */
function Painted({ at: p, on, className, children }: { at: Point; on: "back" | "side"; className: string; children: string }) {
  const m = on === "back" ? `${COS} 0.5 0 1` : `${COS} -0.5 0 1`;
  return <text className={className} textAnchor="middle" transform={`matrix(${m} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>{children}</text>;
}

function Bubble({ p, done, children, pop }: { p: Point; done?: boolean; children: ReactNode; pop: number }) {
  return <g className={cn("ask-bubble", done && "done")} transform={`translate(${p.x.toFixed(1)} ${(p.y - 26).toFixed(1)}) scale(${pop.toFixed(3)})`}>
    <path className="tail" d="M -5 10 L 0 17 L 5 10 Z" />
    <circle r={14} />
    {children}
  </g>;
}
const popAt = (t: number, from: number) => { const p = clamp((t - from) / 0.3); return p < 1 ? p * (1 + 0.25 * Math.sin(p * Math.PI)) : 1; };

export function ContactScene() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, STILL);
  const v = visitorAt(t);
  const typing = !(t > ANSWER - 0.3 && t < OUT.start);

  if (!mounted) return <div ref={ref} className="cs" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }} />;
  return <div ref={ref} className="cs" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }}>
    <svg viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`} aria-hidden="true">
      <Prism b={FLOOR} className="cs-floor" />
      <Prism b={WALL_SIDE} className="cs-wall" />
      <Prism b={WALL_BACK} className="cs-wall" />
      {/* a window onto the city, and the door on the back wall */}
      <polygon className="cs-window" points={pts(facingY(70, 176, 0, 50, 104))} />
      <polygon className="cs-sea" points={pts(facingY(74, 172, 0, 54, 70))} />
      <polygon className="cs-frame" points={pts(facingY(121, 125, 0, 54, 100))} />
      <polygon className="cs-door" points={pts(facingY(226, 264, 0, 0, 84))} />
      {/* the channels, as signs on the side wall */}
      {SIGNS.map((s, i) => <polygon key={s.key} className={cn("cs-sign", MESSAGES.some((m) => m.from === i && t >= m.at && t < m.at + 0.4) && "ping")} points={pts(facingX(0, 18 + i * 58, 50 + i * 58, 90, 110))} />)}
      {SIGNS.map((s) => <Painted key={`${s.key}-label`} at={{ x: s.at.x, y: s.at.y + 3.5 }} on="side" className="cs-sign-text">{s.label}</Painted>)}
      <Painted at={iso(123, 0, 36)} on="back" className="cs-wall-text">BARCELONA</Painted>

      {LEGS.map((b, i) => <Prism key={i} b={b} className="cs-wood" />)}
      <Prism b={DESK} className="cs-desk" />
      <Prism b={LAPTOP} className="cs-laptop" />
      <polygon className={cn("cs-screen", typing && "on")} points={pts(facingX(17, 101, 135, 48, 72))} />
      {t >= COFFEE && t < OUT.end + 0.3 && <g className="cs-cups" opacity={clamp((t - COFFEE) / 0.3)}>
        <Prism b={{ x: 46, y: 142, w: 7, d: 7, z0: 46, z1: 55 }} className="cs-cup" />
        <Prism b={{ x: 46, y: 156, w: 7, d: 7, z0: 46, z1: 55 }} className="cs-cup" />
      </g>}
      <Prism b={STOOL} className="cs-wood" />
      <Figure x={ME.x} y={ME.y} z={26} seated tone="waiter" hair="short" face={-1} scale={1.15} pose={typing ? "type" : "idle"} t={t} />
      {v && <g opacity={v.o}><Figure x={v.x} y={v.y} tone="guest-c" hair="bun" face={v.face} scale={1.15} pose={v.walking ? "walk" : t > ASK && t < ANSWER ? "point" : "idle"} t={t} /></g>}

      {/* messages from the wall to the laptop */}
      {MESSAGES.map((m, i) => {
        const p = (t - m.at) / FLY;
        if (p < 0 || p > 1) return null;
        const a = SIGNS[m.from].at, b = SCREEN;
        const c = { x: (a.x + b.x) / 2 + 30, y: Math.min(a.y, b.y) - 40 };
        const q = ease(p);
        const x = (1 - q) ** 2 * a.x + 2 * (1 - q) * q * c.x + q * q * b.x;
        const y = (1 - q) ** 2 * a.y + 2 * (1 - q) * q * c.y + q * q * b.y;
        return <g key={i} className="cs-env" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} opacity={Math.min(1, (1 - p) / 0.2)}>
          <rect x={-7} y={-5} width={14} height={10} rx={1.5} />
          <path d="M -7 -5 L 0 1 L 7 -5" />
        </g>;
      })}

      {v && t >= ASK && t < OUT.start && <Bubble p={headAt(STAND.x, STAND.y, 0, 1.15)} pop={popAt(t, ASK)}><Briefcase x={-7} y={-7} width={14} height={14} strokeWidth={2.4} /></Bubble>}
      {t >= ANSWER && t < OUT.start + 0.6 && <Bubble p={headAt(ME.x, ME.y, 26, 1.15, true)} done pop={popAt(t, ANSWER)}><Check x={-7} y={-7} width={14} height={14} strokeWidth={3} /></Bubble>}
    </svg>
    {t >= ANSWER && t < OUT.start + 0.6 && <span className="cs-say" style={at(headAt(ME.x, ME.y, 26, 1.15, true))}>Let&apos;s talk.</span>}
  </div>;
}
