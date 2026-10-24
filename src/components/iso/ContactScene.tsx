"use client";

import type { ReactNode } from "react";
import { Briefcase, Check, Cog } from "lucide-react";
import { COS, iso, Prism, pts, facingX, facingY, type Box, type Point } from "./iso";
import { Figure, headAt } from "./figure";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The contact section's room, after Pesto's restaurant loop: me at a desk in
 * Barcelona, messages arriving from the channels on the wall, and somebody
 * walking in with a role to talk about. Around it, what the room says about
 * me: spice jars, a homelab with a cat asleep on it, plants, and a few games
 * hidden in plain sight. Each has a name on hover.
 */

const LOOP = 13;
const STILL = 6.4;

const FLOOR: Box = { x: 0, y: 0, w: 320, d: 240, z0: -10, z1: 0 };
const WALL_BACK: Box = { x: 0, y: -10, w: 320, d: 10, z0: 0, z1: 124 };
const WALL_SIDE: Box = { x: -10, y: -10, w: 10, d: 250, z0: 0, z1: 124 };
const DESK: Box = { x: 6, y: 70, w: 58, d: 100, z0: 40, z1: 46 };
const LEGS: Box[] = [[10, 74], [10, 160], [54, 74], [54, 160]].map(([x, y]) => ({ x, y, w: 6, d: 6, z0: 0, z1: 40 }));
const LAPTOP: Box = { x: 16, y: 100, w: 28, d: 36, z0: 46, z1: 48 };
const STOOL: Box = { x: 80, y: 112, w: 24, d: 24, z0: 0, z1: 26 };
const SERVER: Box = { x: 280, y: 4, w: 34, d: 34, z0: 0, z1: 92 };
const SHELVES: Box[] = [{ x: 6, y: 0, w: 60, d: 12, z0: 50, z1: 53 }, { x: 6, y: 0, w: 60, d: 12, z0: 80, z1: 83 }];
const JARS = [[10, 0, "r"], [22, 0, "y"], [34, 0, "g"], [46, 0, "w"], [12, 1, "b"], [26, 1, "o"], [42, 1, "pot"]] as const;
const PLANT_POT: Box = { x: 14, y: 210, w: 18, d: 18, z0: 0, z1: 18 };
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
const DOOR = { x: 240, y: 10 }, STAND = { x: 200, y: 156 };
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
  return { x: Math.min(...xs) - 10, y: Math.min(...ys) - 30, w: Math.max(...xs) - Math.min(...xs) + 20, h: Math.max(...ys) - Math.min(...ys) + 40 };
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

/** Something in the room with a name on hover. */
function Egg({ name, children }: { name: string; children: ReactNode }) {
  return <g className="cs-egg"><title>{name}</title>{children}</g>;
}

export function ContactScene() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, STILL);
  const v = visitorAt(t);
  const typing = !(t > ANSWER - 0.3 && t < OUT.start);

  if (!mounted) return <div ref={ref} className="cs" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }} />;
  return <div ref={ref} className="cs" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }}>
    <svg viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`} role="img" aria-label="An isometric room: me at a desk in Barcelona, messages arriving, a visitor with a job offer. Shelves of spice jars, a home server with a cat on it, plants, and posters of games.">
      <Prism b={FLOOR} className="cs-floor" />
      <polygon className="cs-rug" points={pts([iso(112, 92, 0), iso(236, 92, 0), iso(236, 206, 0), iso(112, 206, 0)])} />
      <Prism b={WALL_SIDE} className="cs-wall" />
      <Prism b={WALL_BACK} className="cs-wall" />

      {/* the back wall: shelves, a window onto the city, two posters, the door */}
      <Egg name="Cooking: exploring new cuisines">
        {SHELVES.map((b, i) => <Prism key={i} b={b} className="cs-wood" />)}
        {JARS.map(([x, row, kind]) => {
          const z = row ? 83 : 53;
          return kind === "pot"
            ? <Prism key={`${x}${row}`} b={{ x, y: 2, w: 16, d: 9, z0: z, z1: z + 9 }} className="cs-potjar" />
            : <g key={`${x}${row}`}>
              <Prism b={{ x, y: 3, w: 7, d: 7, z0: z, z1: z + 10 }} className={`cs-jar ${kind}`} />
              <Prism b={{ x, y: 3, w: 7, d: 7, z0: z + 10, z1: z + 12 }} className="cs-lid" />
            </g>;
        })}
      </Egg>
      <polygon className="cs-window" points={pts(facingY(76, 168, 0, 50, 104))} />
      <polygon className="cs-sea" points={pts(facingY(80, 164, 0, 54, 70))} />
      <polygon className="cs-frame" points={pts(facingY(120, 124, 0, 54, 100))} />
      <Painted at={iso(122, 0, 36)} on="back" className="cs-wall-text">BARCELONA</Painted>
      <Egg name="Factorio: the factory must grow">
        <polygon className="cs-poster factorio" points={pts(facingY(178, 214, 0, 66, 104))} />
        {(() => { const c = iso(196, 0, 92); return <g transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${((t * 40) % 360).toFixed(1)})`}><Cog x={-7} y={-7} width={14} height={14} className="cs-gear" /></g>; })()}
        <Painted at={iso(196, 0, 72)} on="back" className="cs-poster-text">MUST GROW</Painted>
      </Egg>
      <Egg name="Space Station 14">
        <polygon className="cs-poster ss14" points={pts(facingY(178, 214, 0, 22, 58))} />
        {(() => { const c = iso(196, 0, 46); return <g transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${((t * 12) % 360).toFixed(1)})`}>
          <rect x={-11} y={-1.6} width={22} height={3.2} rx={1} className="cs-station" />
          <circle r={5} className="cs-station" />
          <circle r={2} className="cs-station core" />
        </g>; })()}
        <Painted at={iso(196, 0, 28)} on="back" className="cs-poster-text light">SS14</Painted>
      </Egg>
      <polygon className="cs-door" points={pts(facingY(224, 260, 0, 0, 84))} />
      <Egg name="Homelab: where my own cloud will live">
        <Prism b={SERVER} className="cs-server" />
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const a = iso(SERVER.x + 3, SERVER.y + SERVER.d, 84 - k * 13), b = iso(SERVER.x + SERVER.w - 3, SERVER.y + SERVER.d, 84 - k * 13);
          const led = iso(SERVER.x + SERVER.w - 6, SERVER.y + SERVER.d, 79 - k * 13);
          return <g key={k}>
            <line className="cs-slot" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <circle className={cn("cs-led", (Math.floor(t * 4) + k * 3) % 5 === 0 && "on")} cx={led.x} cy={led.y} r={1.5} />
          </g>;
        })}
      </Egg>
      <Cat t={t} />

      {/* the side wall: the channels, and a game's poster with a katana under it */}
      {SIGNS.map((s, i) => <polygon key={s.key} className={cn("cs-sign", MESSAGES.some((m) => m.from === i && t >= m.at && t < m.at + 0.4) && "ping")} points={pts(facingX(0, 18 + i * 58, 50 + i * 58, 90, 110))} />)}
      {SIGNS.map((s) => <Painted key={`${s.key}-label`} at={{ x: s.at.x, y: s.at.y + 3.5 }} on="side" className="cs-sign-text">{s.label}</Painted>)}
      <Egg name="Deadlock">
        <polygon className="cs-poster deadlock" points={pts(facingX(0, 186, 226, 82, 116))} />
        <Painted at={iso(0, 206, 96)} on="side" className="cs-poster-text copper">DEADLOCK</Painted>
      </Egg>
      <Egg name="Katana Zero">
        {(() => { const a = iso(0, 186, 66), b = iso(0, 216, 70), c = iso(0, 230, 72); return <>
          <line className="cs-blade" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          <line className="cs-hilt" x1={b.x} y1={b.y} x2={c.x} y2={c.y} />
        </>; })()}
      </Egg>

      {/* the desk */}
      {LEGS.map((b, i) => <Prism key={i} b={b} className="cs-wood" />)}
      <Prism b={DESK} className="cs-desk" />
      <Egg name="Minecraft">
        <Prism b={{ x: 46, y: 76, w: 10, d: 10, z0: 46, z1: 56 }} className="cs-mc" />
      </Egg>
      <Prism b={LAPTOP} className="cs-laptop" />
      <polygon className={cn("cs-screen", typing && "on")} points={pts(facingX(17, 101, 135, 48, 72))} />
      <Egg name="The cactus from the terminal">
        <Prism b={{ x: 46, y: 152, w: 8, d: 8, z0: 46, z1: 52 }} className="cs-terracotta" />
        <Prism b={{ x: 48.5, y: 154.5, w: 3, d: 3, z0: 52, z1: 67 }} className="cs-cactus" />
        <Prism b={{ x: 48.5, y: 151, w: 3, d: 2.5, z0: 58, z1: 63 }} className="cs-cactus" />
      </Egg>
      {t >= COFFEE && t < OUT.end + 0.3 && <g opacity={clamp((t - COFFEE) / 0.3)}>
        <Prism b={{ x: 46, y: 132, w: 7, d: 7, z0: 46, z1: 55 }} className="cs-cup" />
        <Prism b={{ x: 46, y: 118, w: 7, d: 7, z0: 46, z1: 55 }} className="cs-cup" />
      </g>}
      <Prism b={STOOL} className="cs-wood" />
      <Figure x={ME.x} y={ME.y} z={26} seated tone="waiter" hair="short" face={-1} scale={1.15} pose={typing ? "type" : "idle"} t={t} />

      <Egg name="Plants, watered most weeks">
        <Prism b={PLANT_POT} className="cs-terracotta" />
        {[[-8, 30, 9], [7, 34, 10], [0, 46, 11], [-11, 46, 7], [10, 50, 7], [-2, 58, 8]].map(([dx, z, r], k) => {
          const c = iso(PLANT_POT.x + 9, PLANT_POT.y + 9, z);
          const sway = Math.sin(t * 1.3 + k) * 0.8;
          return <circle key={k} className={cn("cs-leaf", k % 2 === 1 && "b")} cx={(c.x + dx + sway).toFixed(1)} cy={c.y.toFixed(1)} r={r} />;
        })}
      </Egg>
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

/** A ginger cat asleep on the server, its tail going. */
function Cat({ t }: { t: number }) {
  const c = iso(SERVER.x + 17, SERVER.y + 17, SERVER.z1);
  const tail = Math.sin(t * 2.2) * 5;
  const breathe = 1 + Math.sin(t * 2) * 0.03;
  const z = (t % 3) / 3;
  return <g className="cs-egg cs-cat" transform={`translate(${c.x.toFixed(1)} ${(c.y - 1).toFixed(1)})`}>
    <title>The cat, asleep on the warm server</title>
    <path className="tail" d={`M -10 -3 Q -21 ${(-3 + tail).toFixed(1)} -17 ${(-12 + tail).toFixed(1)}`} />
    <ellipse className="body" cx={0} cy={-5} rx={12 * breathe} ry={6.5 * breathe} />
    <circle className="body" cx={10} cy={-8} r={5} />
    <path className="body" d="M 6.5 -11 L 7.5 -16 L 10 -12.5 Z M 11 -12.5 L 13.5 -16 L 14 -11 Z" />
    <path className="stripe" d="M -4 -10.5 q 1.5 4 0 8 M 0.5 -11 q 1.5 4 0 8 M -8 -9 q 1.2 3 0 6" />
    <path className="eye" d="M 8.6 -8 q 1 1 2 0 M 12 -8.2 q 0.8 0.8 1.6 0" />
    <text className="zzz" x={(16 + z * 6).toFixed(1)} y={(-16 - z * 12).toFixed(1)} opacity={(1 - z).toFixed(2)}>z</text>
  </g>;
}
