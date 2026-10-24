"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Briefcase, Check, Cog } from "lucide-react";
import { COS, iso, Prism, pts, facingX, facingY, type Box, type Point } from "./iso";
import { Figure, headAt } from "./figure";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { asset, cn } from "@/lib/utils";

/**
 * The contact section's room, after Pesto's restaurant loop: me at a desk in
 * Barcelona, messages arriving from the channels on the wall, and somebody
 * walking in with a role to talk about. Around it, what the room says about
 * me: spice jars, a homelab with a cat asleep on it, plants, a bed, and a few
 * games hidden in plain sight. Hover or tap one and it says what it is; the
 * channels on the wall are links, and the cat can be petted.
 */

const LOOP = 13;
const STILL = 6.4;

const FLOOR: Box = { x: 0, y: 0, w: 320, d: 240, z0: -10, z1: 0 };
const WALL_BACK: Box = { x: 0, y: -10, w: 320, d: 10, z0: 0, z1: 124 };
const WALL_SIDE: Box = { x: -10, y: -10, w: 10, d: 250, z0: 0, z1: 124 };
const DESK: Box = { x: 6, y: 70, w: 58, d: 100, z0: 40, z1: 46 };
const LEGS: Box[] = [[10, 74], [10, 160], [54, 74], [54, 160]].map(([x, y]) => ({ x, y, w: 6, d: 6, z0: 0, z1: 40 }));
const LAPTOP: Box = { x: 16, y: 100, w: 28, d: 36, z0: 46, z1: 48 };
const SERVER: Box = { x: 280, y: 4, w: 34, d: 34, z0: 0, z1: 92 };
const SHELVES: Box[] = [{ x: 6, y: 0, w: 60, d: 12, z0: 50, z1: 53 }, { x: 6, y: 0, w: 60, d: 12, z0: 80, z1: 83 }];
const JARS = [[10, 0, "r"], [22, 0, "y"], [34, 0, "g"], [46, 0, "w"], [12, 1, "b"], [26, 1, "o"], [42, 1, "pot"]] as const;
const PLANT_POT: Box = { x: 12, y: 212, w: 18, d: 18, z0: 0, z1: 18 };
const ME = { x: 92, y: 124 };
const SCREEN = iso(18, 118, 62);

// An office chair: five feet, a post, a seat, a back.
const CHAIR = { x: 92, y: 124 };
const CHAIR_SEAT: Box = { x: CHAIR.x - 13, y: CHAIR.y - 13, w: 26, d: 26, z0: 21, z1: 26 };
const CHAIR_BACK: Box = { x: CHAIR.x + 11, y: CHAIR.y - 11, w: 5, d: 22, z0: 26, z1: 52 };
const CHAIR_POST: Box = { x: CHAIR.x - 2, y: CHAIR.y - 2, w: 4, d: 4, z0: 4, z1: 21 };

// A bed by the server, made, with a few things on it.
const BED_FRAME: Box = { x: 238, y: 116, w: 78, d: 100, z0: 0, z1: 12 };
const BED_MATTRESS: Box = { x: 240, y: 118, w: 74, d: 96, z0: 12, z1: 22 };
const BED_HEAD: Box = { x: 238, y: 110, w: 78, d: 6, z0: 0, z1: 40 };
const PILLOW: Box = { x: 250, y: 122, w: 54, d: 20, z0: 22, z1: 28 };
const BLANKET: Box = { x: 240, y: 146, w: 74, d: 68, z0: 22, z1: 25 };

/** The channels on the wall, and where each one's messages leave from. */
const SIGNS = [
  { key: "mail", label: "Email", href: "mailto:mstemchenko.dev@gmail.com", y: 12, at: iso(0, 36, 100) },
  { key: "in", label: "LinkedIn", href: "https://www.linkedin.com/in/mark-the-artichoke/", y: 68, at: iso(0, 92, 100) },
  { key: "gh", label: "GitHub", href: "https://github.com/MarkT-D", y: 124, at: iso(0, 148, 100) },
] as const;
const SIGN_W = 48;
const MESSAGES = [{ from: 0, at: 1.0 }, { from: 1, at: 2.6 }, { from: 2, at: 8.4 }, { from: 0, at: 10.2 }];
const FLY = 1.3;

// The visitor: in at the door, across to the desk, and out again.
const DOOR = { x: 242, y: 10 }, STAND = { x: 196, y: 152 };
const IN = { start: 0.6, end: 3.4 }, OUT = { start: 9.4, end: 12.2 };
const ASK = 3.7, ANSWER = 5.0, COFFEE = 6.2;

/** What each thing in the room says when you hover or tap it. */
const TIPS: Record<string, { title: string; text: string; at: Point }> = {
  jars: { title: "Cooking", text: "I cook most days, usually from a cuisine I haven't tried yet. These are the spices.", at: iso(36, 6, 98) },
  server: { title: "My homelab, being built", text: "A home for my own cloud: storage with my Obsidian vault synced, files, music I host myself, and the agents I run.", at: iso(297, 21, 120) },
  cat: { title: "The cat", text: "Asleep on the warmest box in the room. Go on, pet it.", at: iso(297, 21, 118) },
  plants: { title: "Plants", text: "My mom was a florist, so there are always plants around me.", at: iso(21, 221, 74) },
  factorio: { title: "Factorio", text: "The factory must grow.", at: iso(179, 0, 108) },
  deadlock: { title: "Deadlock", text: "For when the build is green.", at: iso(179, 0, 60) },
  katana: { title: "Katana Zero", text: "Short, sharp, and the best soundtrack on this wall.", at: iso(246, 0, 104) },
  skis: { title: "Skiing", text: "The other main thing I do outside work.", at: iso(270, 2, 100) },
  minecraft: { title: "Minecraft", text: "Since forever.", at: iso(51, 81, 62) },
  cactus: { title: "The cactus", text: "Same one as in the terminal up top.", at: iso(50, 156, 72) },
  lizard: { title: "A lizard plushie", text: "From Space Station 14, where I play on the Goob fork and mod. Sprite: tgstation / SS14, CC BY-SA 3.0.", at: iso(290, 132, 52) },
  belt: { title: "Judo", text: "I trained for years and competed at regional level in Moscow.", at: iso(276, 196, 40) },
  mail: { title: "Email", text: "mstemchenko.dev@gmail.com. Click the sign.", at: iso(0, 36, 116) },
  in: { title: "LinkedIn", text: "in/mark-the-artichoke. Click the sign.", at: iso(0, 92, 116) },
  gh: { title: "GitHub", text: "github.com/MarkT-D. Click the sign.", at: iso(0, 148, 116) },
};

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

/** Which way a hint opens, so it stays inside the card. */
const side = (p: Point) => { const k = (p.x - BOUNDS.x) / BOUNDS.w; return k > 0.6 ? "r" : k < 0.32 ? "l" : ""; };

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

type TipKey = keyof typeof TIPS;

export function ContactScene() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, STILL);
  const v = visitorAt(t);
  const typing = !(t > ANSWER - 0.3 && t < OUT.start);
  const [tip, setTip] = useState<TipKey | null>(null);
  const [purr, setPurr] = useState<number | null>(null);
  // Re-render once the purr is over, even where nothing else is animating.
  useEffect(() => {
    if (purr === null) return;
    const id = setTimeout(() => setPurr(null), 2300);
    return () => clearTimeout(id);
  }, [purr]);
  const purring = purr !== null && performance.now() - purr < 2200 ? (performance.now() - purr) / 2200 : null;

  /** Something in the room you can hover, focus or tap for what it is. */
  const egg = (key: TipKey, children: ReactNode, onClick?: () => void) => (
    <g className={cn("cs-egg", tip === key && "on")} tabIndex={0} role="button" aria-label={`${TIPS[key].title}: ${TIPS[key].text}`}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setTip(key); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setTip(null); }}
      onFocus={() => setTip(key)} onBlur={() => setTip(null)}
      onClick={() => { setTip((k) => (k === key && !onClick ? null : key)); onClick?.(); }}>
      {children}
    </g>
  );

  if (!mounted) return <div ref={ref} className="cs" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }} />;
  return <div ref={ref} className="cs" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }} onPointerLeave={() => setTip(null)}>
    <svg viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`} role="group" aria-label="An isometric room: me at a desk in Barcelona, messages arriving, a visitor with a job offer. Things in the room say what they are when you hover or tap them.">
      <Prism b={FLOOR} className="cs-floor" />
      <polygon className="cs-rug" points={pts([iso(112, 92, 0), iso(226, 92, 0), iso(226, 200, 0), iso(112, 200, 0)])} />
      <Prism b={WALL_SIDE} className="cs-wall" />
      <Prism b={WALL_BACK} className="cs-wall" />

      {/* the back wall: shelves, the window, two posters, the door with a katana over it, skis */}
      {egg("jars", <>
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
      </>)}
      <polygon className="cs-window" points={pts(facingY(74, 150, 0, 50, 104))} />
      <polygon className="cs-sea" points={pts(facingY(78, 146, 0, 54, 70))} />
      <polygon className="cs-frame" points={pts(facingY(110, 114, 0, 54, 100))} />
      <Painted at={iso(112, 0, 36)} on="back" className="cs-wall-text">BARCELONA</Painted>
      {egg("factorio", <>
        <polygon className="cs-poster factorio" points={pts(facingY(158, 200, 0, 64, 104))} />
        {(() => { const c = iso(179, 0, 84); return <g transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${((t * 40) % 360).toFixed(1)})`}><Cog x={-9} y={-9} width={18} height={18} className="cs-gear" /></g>; })()}
      </>)}
      {egg("deadlock", <>
        <polygon className="cs-poster deadlock" points={pts(facingY(158, 200, 0, 16, 56))} />
        {(() => { const c = iso(179, 0, 36); return <g transform={`matrix(${COS} 0.5 0 1 ${c.x.toFixed(1)} ${c.y.toFixed(1)})`}>
          <image href={asset("/img/deadlock-emblem.png")} x={-16} y={-16} width={32} height={32} />
        </g>; })()}
      </>)}
      <polygon className="cs-door" points={pts(facingY(222, 258, 0, 0, 84))} />
      {egg("katana", (() => { const a = iso(222, 0, 94), b = iso(250, 0, 97), c = iso(260, 0, 98); return <>
        <line className="cs-blade" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        <line className="cs-hilt" x1={b.x} y1={b.y} x2={c.x} y2={c.y} />
      </>; })())}
      {egg("skis", <>
        <Prism b={{ x: 262, y: 2, w: 5, d: 3, z0: 0, z1: 96 }} className="cs-ski" />
        <Prism b={{ x: 269, y: 2, w: 5, d: 3, z0: 0, z1: 96 }} className="cs-ski b" />
      </>)}

      {/* the side wall: the channels as links, and a poster */}
      {SIGNS.map((s, i) => (
        <a key={s.key} href={s.href} target={s.key === "mail" ? undefined : "_blank"} rel="noreferrer" aria-label={`${s.label}: ${TIPS[s.key].text}`}
          className={cn("cs-link", tip === s.key && "on")}
          onPointerEnter={() => setTip(s.key)} onPointerLeave={() => setTip(null)} onFocus={() => setTip(s.key)} onBlur={() => setTip(null)}>
          <polygon className={cn("cs-sign", MESSAGES.some((m) => m.from === i && t >= m.at && t < m.at + 0.4) && "ping")} points={pts(facingX(0, s.y, s.y + SIGN_W, 90, 110))} />
          <Painted at={{ x: s.at.x, y: s.at.y + 3 }} on="side" className="cs-sign-text">{s.label}</Painted>
        </a>
      ))}

      {/* the visitor, behind the server and the bed */}
      {v && <g opacity={v.o}><Figure x={v.x} y={v.y} tone="guest-c" hair="bun" face={v.face} scale={1.15} pose={v.walking ? "walk" : t > ASK && t < ANSWER ? "point" : "idle"} t={t} /></g>}

      {egg("server", <>
        <Prism b={SERVER} className="cs-server" />
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const a = iso(SERVER.x + 3, SERVER.y + SERVER.d, 84 - k * 13), b = iso(SERVER.x + SERVER.w - 3, SERVER.y + SERVER.d, 84 - k * 13);
          const led = iso(SERVER.x + SERVER.w - 6, SERVER.y + SERVER.d, 79 - k * 13);
          return <g key={k}>
            <line className="cs-slot" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <circle className={cn("cs-led", (Math.floor(t * 4) + k * 3) % 5 === 0 && "on")} cx={led.x} cy={led.y} r={1.5} />
          </g>;
        })}
      </>)}
      {egg("cat", <Cat t={t} purr={purring} />, () => setPurr(performance.now()))}

      {/* the desk */}
      {LEGS.map((b, i) => <Prism key={i} b={b} className="cs-wood" />)}
      <Prism b={DESK} className="cs-desk" />
      {egg("minecraft", <Prism b={{ x: 46, y: 76, w: 10, d: 10, z0: 46, z1: 56 }} className="cs-mc" />)}
      <Prism b={LAPTOP} className="cs-laptop" />
      <polygon className={cn("cs-screen", typing && "on")} points={pts(facingX(17, 101, 135, 48, 72))} />
      {egg("cactus", <>
        <Prism b={{ x: 46, y: 152, w: 8, d: 8, z0: 46, z1: 52 }} className="cs-terracotta" />
        <Prism b={{ x: 48.5, y: 154.5, w: 3, d: 3, z0: 52, z1: 67 }} className="cs-cactus" />
        <Prism b={{ x: 48.5, y: 151, w: 3, d: 2.5, z0: 58, z1: 63 }} className="cs-cactus" />
      </>)}
      {t >= COFFEE && t < OUT.end + 0.3 && <g opacity={clamp((t - COFFEE) / 0.3)}>
        <Prism b={{ x: 46, y: 132, w: 7, d: 7, z0: 46, z1: 55 }} className="cs-cup" />
        <Prism b={{ x: 46, y: 118, w: 7, d: 7, z0: 46, z1: 55 }} className="cs-cup" />
      </g>}

      {/* my chair, then me in it */}
      {[[-12, 0], [12, 0], [0, -12], [0, 12]].map(([dx, dy], i) => <Prism key={i} b={{ x: CHAIR.x + Math.min(0, dx) - 1.5, y: CHAIR.y + Math.min(0, dy) - 1.5, w: Math.abs(dx) + 3, d: Math.abs(dy) + 3, z0: 1, z1: 4 }} className="cs-chair-foot" />)}
      <Prism b={CHAIR_POST} className="cs-chair-foot" />
      <Prism b={CHAIR_BACK} className="cs-chair" />
      <Prism b={CHAIR_SEAT} className="cs-chair" />
      <Figure x={ME.x} y={ME.y} z={26} seated tone="waiter" hair="short" face={-1} scale={1.15} pose={typing ? "type" : "idle"} t={t} />

      {/* the bed, and what is on it */}
      <Prism b={BED_HEAD} className="cs-wood" />
      <Prism b={BED_FRAME} className="cs-wood" />
      <Prism b={BED_MATTRESS} className="cs-mattress" />
      <Prism b={PILLOW} className="cs-pillow" />
      <Prism b={BLANKET} className="cs-blanket" />
      {egg("lizard", <Lizard />)}
      {egg("belt", (() => { const a = iso(250, 200, 25.5), b = iso(300, 186, 25.5), k = iso(276, 194, 25.5); return <>
        <line className="cs-belt" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        <path className="cs-belt" d={`M ${k.x} ${k.y} l -4 7 M ${k.x} ${k.y} l 5 6`} />
      </>; })())}

      {egg("plants", <>
        <Prism b={PLANT_POT} className="cs-terracotta" />
        {[[-8, 30, 9], [7, 34, 10], [0, 46, 11], [-11, 46, 7], [10, 50, 7], [-2, 58, 8]].map(([dx, z, r], k) => {
          const c = iso(PLANT_POT.x + 9, PLANT_POT.y + 9, z);
          const sway = Math.sin(t * 1.3 + k) * 0.8;
          return <circle key={k} className={cn("cs-leaf", k % 2 === 1 && "b")} cx={(c.x + dx + sway).toFixed(1)} cy={c.y.toFixed(1)} r={r} />;
        })}
      </>)}

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
    {tip && <div key={tip} className={cn("cs-hint", side(TIPS[tip].at))} style={at(TIPS[tip].at)} role="status"><b>{TIPS[tip].title}</b><span>{TIPS[tip].text}</span></div>}
    <p className="cs-help">Hover or tap things in the room.</p>
  </div>;
}

/**
 * The lizard plushie from Space Station 14, the game's own sprite
 * (tgstation / SS14, CC BY-SA 3.0), sitting on the pillow.
 */
function Lizard() {
  const c = iso(292, 132, 28);
  return <g className="cs-lizard">
    <image href={asset("/img/ss14-lizard.png")} x={(c.x - 12).toFixed(1)} y={(c.y - 23).toFixed(1)} width={24} height={24} style={{ imageRendering: "pixelated" }} />
  </g>;
}

/** A ginger cat asleep on the server, its tail going. Pet it and it purrs. */
function Cat({ t, purr }: { t: number; purr: number | null }) {
  const c = iso(SERVER.x + 17, SERVER.y + 17, SERVER.z1);
  const tail = Math.sin(t * (purr !== null ? 6 : 2.2)) * 5;
  const breathe = 1 + Math.sin(t * (purr !== null ? 9 : 2)) * (purr !== null ? 0.05 : 0.03);
  const z = (t % 3) / 3;
  return <g className="cs-cat" transform={`translate(${c.x.toFixed(1)} ${(c.y - 1).toFixed(1)})`}>
    <path className="tail" d={`M -10 -3 Q -21 ${(-3 + tail).toFixed(1)} -17 ${(-12 + tail).toFixed(1)}`} />
    <ellipse className="body" cx={0} cy={-5} rx={12 * breathe} ry={6.5 * breathe} />
    <circle className="body" cx={10} cy={-8} r={5} />
    <path className="body" d="M 6.5 -11 L 7.5 -16 L 10 -12.5 Z M 11 -12.5 L 13.5 -16 L 14 -11 Z" />
    <path className="stripe" d="M -4 -10.5 q 1.5 4 0 8 M 0.5 -11 q 1.5 4 0 8 M -8 -9 q 1.2 3 0 6" />
    <path className="eye" d={purr !== null ? "M 8.6 -8.4 q 1 -1 2 0 M 12 -8.6 q 0.8 -0.8 1.6 0" : "M 8.6 -8 q 1 1 2 0 M 12 -8.2 q 0.8 0.8 1.6 0"} />
    {purr === null
      ? <text className="zzz" x={(16 + z * 6).toFixed(1)} y={(-16 - z * 12).toFixed(1)} opacity={(1 - z).toFixed(2)}>z</text>
      : <>
        {[0, 1, 2].map((k) => {
          const p = Math.min(1, Math.max(0, purr * 1.4 - k * 0.18));
          return p > 0 && p < 1 && <path key={k} className="heart" transform={`translate(${(4 + (k - 1) * 9 + Math.sin(p * 6 + k) * 2).toFixed(1)} ${(-18 - p * 26).toFixed(1)}) scale(${(0.6 + p * 0.4).toFixed(2)})`} opacity={(1 - p).toFixed(2)}
            d="M 0 3 C -6 -2 -4 -7 0 -4 C 4 -7 6 -2 0 3 Z" />;
        })}
        <text className="purr" x={18} y={-14} opacity={(1 - purr).toFixed(2)}>prrr</text>
      </>}
  </g>;
}
