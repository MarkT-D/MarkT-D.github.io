"use client";

import { memo, type ReactNode } from "react";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { Check, CreditCard, Landmark, QrCode, Smartphone } from "lucide-react";
import { COS, facingX, facingY, iso, Prism, pts, type Box, type Point } from "./iso";
import {
  bagAt, bubblesAt, codeLitAt, cookingAt, dishAt, figureAt, LOOP, officeRingAt, ORDER_KINDS, phoneAt, receiptsAt, ROLES,
  SPOTS, STILL_T, tabletLitAt, ticketAt, type Figure, type Role,
} from "./ask-loop";

/**
 * The offer, drawn as what the money pays for: one restaurant running on
 * Pesto, in isometric, with its evening playing in a loop (23 Oct). Guests
 * come in by the door and order the three ways — from the code on a table, at
 * the register, on the phone to take away — and the kitchen's screen takes
 * each ticket, the cook plates it, the waiter carries it and every receipt
 * flies off to the tax office. `ask-loop.ts` is the choreography; this file
 * only draws the moment it is asked for.
 *
 * It had the round's uses and milestones pinned to the room as cards until
 * 23 Oct, which hid the room behind its own labels; they are beside it now.
 *
 * Drawn, not rendered: plain SVG in an isometric projection, so it is as sharp
 * printed as on the screen. The few words on it are HTML over the drawing,
 * since text set inside an SVG goes soft at the deck's scale.
 */

// ───────────────────────────── the room ─────────────────────────────

const ROOM = { w: 440, d: 340, wall: 132 };
/** The top of a seat: where a seated guest's figure stands. */
const SEAT_Z = 28;
/** People are drawn this much larger than the furniture's own scale: a seated guest's legs then reach the floor. */
const FIGURE = 1.35;
const FLOOR: Box = { x: 0, y: 0, w: ROOM.w, d: ROOM.d, z0: -12, z1: 0 };
const WALL_BACK: Box = { x: 0, y: -12, w: ROOM.w, d: 12, z0: 0, z1: ROOM.wall };
const WALL_SIDE: Box = { x: -12, y: -12, w: 12, d: ROOM.d + 12, z0: 0, z1: ROOM.wall };
const STOVE: Box = { x: 4, y: 6, w: 44, d: 38, z0: 0, z1: 48 };
const PASS: Box = { x: 58, y: 30, w: 32, d: 140, z0: 0, z1: 58 };
const SHELF: Box = { x: 58, y: 180, w: 32, d: 36, z0: 0, z1: 58 };
const COUNTER: Box = { x: 196, y: 40, w: 110, d: 36, z0: 0, z1: 60 };
const POT: Box = { x: 404, y: 10, w: 24, d: 24, z0: 0, z1: 26 };
/** The two tables, by their back-left corner: the first is the code's, the second the register guest's. */
const TABLES = [[170, 220], [310, 200]] as const;
const TABLE_TOP = ([x, y]: readonly [number, number]): Box => ({ x, y, w: 62, d: 56, z0: 38, z1: 44 });
const TABLE_FOOT = ([x, y]: readonly [number, number]): Box => ({ x: x + 24, y: y + 21, w: 14, d: 14, z0: 0, z1: 38 });
/** Chairs at the tables, each with its back away from the table: the guests sit behind them, the empty ones beside. */
const CHAIRS: { at: readonly [number, number]; back: "-x" | "+x" | "-y" }[] = [
  { at: SPOTS.seatA, back: "-y" }, { at: [264, 248], back: "+x" },
  { at: SPOTS.seatB, back: "-y" }, { at: [404, 228], back: "+x" },
];
/** Where a dish stands: on the pass, and on each table in front of its guest. */
const ON_PASS = iso(74, 96, PASS.z1);
const ON_TABLE = [iso(201, 234, 44), iso(341, 214, 44)];
const ON_SHELF = iso(74, 198, SHELF.z1);
/** The pan on the stove, where the steam rises. */
const PAN = iso(26, 25, STOVE.z1);
/** The tablet on the register, which a receipt leaves from. */
const TILL = iso(251, 66, 86);
/** Over the back wall, in the room's empty sky: the tax office, where every receipt goes. */
const OFFICE = iso(330, -40, 214);

const BOUNDS = (() => {
  const corners = [FLOOR, WALL_BACK, WALL_SIDE].flatMap((b) => [
    iso(b.x, b.y, b.z0), iso(b.x + b.w, b.y, b.z0), iso(b.x, b.y + b.d, b.z0), iso(b.x + b.w, b.y + b.d, b.z0),
    iso(b.x, b.y, b.z1), iso(b.x + b.w, b.y, b.z1), iso(b.x, b.y + b.d, b.z1), iso(b.x + b.w, b.y + b.d, b.z1),
  ]);
  const xs = corners.map((p) => p.x), ys = [...corners.map((p) => p.y), OFFICE.y - 26];
  const pad = { left: 10, right: 10, top: 12, bottom: 8 };
  return { x: Math.min(...xs) - pad.left, y: Math.min(...ys) - pad.top, w: Math.max(...xs) - Math.min(...xs) + pad.left + pad.right, h: Math.max(...ys) - Math.min(...ys) + pad.top + pad.bottom };
})();

/** A point of the drawing as a share of it, for the HTML laid over it. */
const at = (p: Point) => ({ left: `${((p.x - BOUNDS.x) / BOUNDS.w) * 100}%`, top: `${((p.y - BOUNDS.y) / BOUNDS.h) * 100}%` });

/** Words painted on a wall — the back one or the side one — centred on a point (or starting from it) and reading along it. */
function Painted({ at: p, on, anchor = "middle", children }: { at: Point; on: "back" | "side"; anchor?: "middle" | "start"; children: string }) {
  const m = on === "back" ? `${COS} 0.5 0 1` : `${COS} -0.5 0 1`;
  return <text className={`iso-paint ${on}`} textAnchor={anchor} transform={`matrix(${m} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>{children}</text>;
}

/**
 * The floor, the walls and what is fixed to them, with each part's name
 * painted where it is: under everything, and drawn once — it only changes
 * with the language.
 */
const Shell = memo(function Shell({ labels }: { labels: SceneLabels }) {
  const upper = (text: string) => text.toLocaleUpperCase();
  return <g>
    <Prism b={FLOOR} className="iso-floor" />
    {[80, 160, 240, 320, 400].map((x) => <line key={`x${x}`} className="iso-tile" x1={iso(x, 0, 0).x} y1={iso(x, 0, 0).y} x2={iso(x, ROOM.d, 0).x} y2={iso(x, ROOM.d, 0).y} />)}
    {[80, 160, 240, 320].map((y) => <line key={`y${y}`} className="iso-tile" x1={iso(0, y, 0).x} y1={iso(0, y, 0).y} x2={iso(ROOM.w, y, 0).x} y2={iso(ROOM.w, y, 0).y} />)}
    {/* The kitchen's own floor, behind the pass, and the mat inside the door. */}
    <polygon className="iso-kitchen-floor" points={pts([iso(0, 0, 0), iso(PASS.x, 0, 0), iso(PASS.x, SHELF.y + SHELF.d, 0), iso(0, SHELF.y + SHELF.d, 0)])} />
    <polygon className="iso-mat" points={pts([iso(2, 266, 0), iso(30, 266, 0), iso(30, 314, 0), iso(2, 314, 0)])} />
    <Prism b={WALL_SIDE} className="iso-wall" />
    <Prism b={WALL_BACK} className="iso-wall" />
    <polygon className="iso-sign" points={pts(facingY(96, 176, 0, 78, 112))} />
    <text className="iso-sign-text" transform={`matrix(${COS} 0.5 0 1 ${iso(109, 0, 87).x} ${iso(109, 0, 87).y})`}>Pesto</text>
    <polygon className="iso-window" points={pts(facingY(330, 400, 0, 40, 104))} />
    <line className="iso-window-bar" x1={iso(365, 0, 40).x} y1={iso(365, 0, 40).y} x2={iso(365, 0, 104).x} y2={iso(365, 0, 104).y} />
    <polygon className="iso-door" points={pts(facingX(0, 260, 320, 0, 118))} />
    <polygon className="iso-door-glass" points={pts(facingX(0, 268, 312, 52, 108))} />
    <polygon className="iso-screen" points={pts(facingX(0, 70, 172, 78, 118))} />
    <polygon className="iso-screen-glass" points={pts(facingX(0, 74, 168, 82, 114))} />
    <Painted at={iso(0, 121, 121)} on="side">{upper(labels.kitchen)}</Painted>
    {/* From the door's edge back over the shelf, so a long word ("Zum Mitnehmen") grows away from the kitchen. */}
    <Painted at={iso(0, 252, 64)} on="side" anchor="start">{upper(labels.takeaway)}</Painted>
    <Painted at={iso(COUNTER.x + COUNTER.w / 2, 0, 112)} on="back">{upper(labels.register)}</Painted>
    {/* The tables' way, upright on the floor in front of them: words lying flat on a floor in isometric cannot be read. */}
    <text className="iso-paint floor" textAnchor="middle" x={iso(278, 326, 0).x} y={iso(278, 326, 0).y}>{upper(labels.phone)}</text>
  </g>;
});

const chairParts =({ at: [cx, cy], back }: (typeof CHAIRS)[number]) => {
  const rest: Box = back === "-y" ? { x: cx - 14, y: cy - 14, w: 28, d: 5, z0: SEAT_Z, z1: 58 }
    : { x: back === "-x" ? cx - 14 : cx + 9, y: cy - 14, w: 5, d: 28, z0: SEAT_Z, z1: 58 };
  const seat = <Prism key="seat" b={{ x: cx - 14, y: cy - 14, w: 28, d: 28, z0: SEAT_Z - 6, z1: SEAT_Z }} className="iso-seat" />;
  const leg = <Prism key="leg" b={{ x: cx - 4, y: cy - 4, w: 8, d: 8, z0: 0, z1: SEAT_Z - 6 }} className="iso-foot" />;
  const backrest = <Prism key="back" b={rest} className="iso-chair-back" />;
  // A back on the far side is behind the seat; on the near side, in front of it.
  return back === "+x" ? [leg, seat, backrest] : [leg, backrest, seat];
};

/** A white plate with a dome of pesto on it, `left` being how much is still there. */
function Dish({ p, left = 1, opacity = 1 }: { p: Point; left?: number; opacity?: number }) {
  return <g className="ask-dish" opacity={opacity}>
    <ellipse className="plate" cx={p.x} cy={p.y - 1} rx={11} ry={5.5} />
    {left > 0.02 && <ellipse className="food" cx={p.x} cy={p.y - 2.5} rx={7 * Math.sqrt(left)} ry={3.6 * Math.sqrt(left)} />}
    {left > 0.4 && <circle className="leaf" cx={p.x + 2} cy={p.y - 4} r={1.6} />}
  </g>;
}

/** The takeaway bag, in Pesto's green. */
function Bag({ x, y }: { x: number; y: number }) {
  return <g className="ask-bag">
    <path className="handle" d={`M ${x - 3.5} ${y - 13} Q ${x} ${y - 20} ${x + 3.5} ${y - 13}`} />
    <rect className="body" x={x - 7} y={y - 14} width={14} height={14} rx={2} />
    <rect className="fold" x={x - 7} y={y - 14} width={14} height={3} rx={1.5} />
  </g>;
}

/**
 * The room's furniture, each with what stands on it at the moment, in the
 * order it is painted. A figure is slotted in after every piece it stands in
 * front of (`slotOf`).
 */
type Solid = { key: string; box: Box; draw: (t: number) => ReactNode };

const SOLIDS: Solid[] = ([
  { key: "stove", box: STOVE, draw: (t) => <g>
    <Prism b={STOVE} className="iso-stove" />
    <ellipse className="iso-pan" cx={PAN.x} cy={PAN.y} rx={11} ry={5.5} />
    <line className="iso-pan-handle" x1={PAN.x + 9} y1={PAN.y + 1} x2={PAN.x + 22} y2={PAN.y + 6} />
    {cookingAt(t) && <Steam t={t} />}
  </g> },
  { key: "pass", box: PASS, draw: (t) => <g>
    <Prism b={PASS} className="iso-counter" />
    {ORDER_KINDS.slice(0, 2).map((kind) => dishAt(kind as "table" | "register", t)?.where === "pass" && <Dish key={kind} p={ON_PASS} />)}
  </g> },
  { key: "shelf", box: SHELF, draw: (t) => <g>
    <Prism b={SHELF} className="iso-shelf" />
    {bagAt(t) === "shelf" && <Bag x={ON_SHELF.x} y={ON_SHELF.y} />}
  </g> },
  { key: "counter", box: COUNTER, draw: (t) => <g>
    <Prism b={COUNTER} className="iso-counter" />
    <polygon className="iso-tablet" points={pts(facingY(236, 268, 66, 60, 86))} />
    <polygon className={`iso-tablet-screen${tabletLitAt(t) ? " lit" : ""}`} points={pts(facingY(239, 265, 66.5, 63, 83))} />
  </g> },
  { key: "pot", box: POT, draw: () => <Plant /> },
  ...CHAIRS.map((chair, i) => ({ key: `chair${i}`, box: { x: chair.at[0] - 14, y: chair.at[1] - 14, w: 28, d: 28, z0: 0, z1: SEAT_Z }, draw: () => <g>{chairParts(chair)}</g> })),
  ...TABLES.map((corner, i) => ({ key: `table${i}`, box: TABLE_TOP(corner), draw: (t: number) => {
    const dish = dishAt(i === 0 ? "table" : "register", t);
    const [x, y] = corner;
    return <g>
      <Prism b={TABLE_FOOT(corner)} className="iso-foot" />
      <Prism b={TABLE_TOP(corner)} className="iso-table" />
      {/* The table's code, on a little stand by the near edge. */}
      <polygon className={`iso-code${i === 0 && codeLitAt(t) ? " lit" : ""}`} points={pts(facingY(x + 44, x + 56, y + 44, 44, 58))} />
      <QrMarks x={x + 44} y={y + 44} />
      {dish?.where === "table" && <Dish p={ON_TABLE[i]} left={dish.left} opacity={dish.opacity} />}
    </g>;
  } })),
] as Solid[]).sort((a, b) => depthOf(a.box) - depthOf(b.box));

function depthOf(b: Box) {
  return b.x + b.w / 2 + b.y + b.d / 2;
}

/** A sketch of a code's three corner squares on the table's stand. */
function QrMarks({ x, y }: { x: number; y: number }) {
  const square = (x0: number, z0: number) => pts(facingY(x0, x0 + 3.2, y + 0.4, z0, z0 + 3.2));
  return <g className="iso-code-marks">
    <polygon points={square(x + 1.8, 53)} />
    <polygon points={square(x + 7, 53)} />
    <polygon points={square(x + 1.8, 46)} />
  </g>;
}

function Plant() {
  const top = iso(POT.x + POT.w / 2, POT.y + POT.d / 2, POT.z1);
  return <g>
    <Prism b={POT} className="iso-pot" />
    <circle className="iso-leaves dark" cx={top.x - 10} cy={top.y - 16} r={13} />
    <circle className="iso-leaves dark" cx={top.x + 11} cy={top.y - 14} r={12} />
    <circle className="iso-leaves" cx={top.x} cy={top.y - 28} r={15} />
    <circle className="iso-leaves light" cx={top.x + 5} cy={top.y - 33} r={7} />
  </g>;
}

/** Three puffs off the pan, rising and thinning, while anything is cooking. */
function Steam({ t }: { t: number }) {
  return <g className="ask-steam">
    {[0, 1, 2].map((i) => {
      const k = ((t / 1.5) + i / 3) % 1;
      return <circle key={i} cx={PAN.x - 3 + Math.sin((t + i) * 3) * 3} cy={PAN.y - 6 - k * 30} r={3 + k * 4} opacity={(1 - k) * 0.55} />;
    })}
  </g>;
}

/** Which slot a figure standing at x, y is painted in: after every piece it is in front of, among those it could overlap. */
function slotOf(x: number, y: number) {
  const sx = (x - y) * COS;
  let slot = 0;
  SOLIDS.forEach(({ box: b }, i) => {
    const left = (b.x - b.y - b.d) * COS, right = (b.x + b.w - b.y) * COS;
    if (sx + 20 < left || sx - 20 > right) return;
    const inside = x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.d;
    if (inside || x >= b.x + b.w || y >= b.y + b.d) slot = i + 1;
  });
  return slot;
}

// ───────────────────────────── the people ─────────────────────────────

type Hair = "short" | "long" | "bun" | "bob" | "toque";
const LOOKS: Record<Role, { tone: string; hair: Hair; apron?: boolean }> = {
  tableGuest: { tone: "guest-a", hair: "long" },
  registerGuest: { tone: "guest-b", hair: "short" },
  takeawayGuest: { tone: "guest-c", hair: "bun" },
  cook: { tone: "cook", hair: "toque" },
  waiter: { tone: "waiter", hair: "short", apron: true },
  cashier: { tone: "cashier", hair: "bob" },
};

/** Hair over a head at (0, hy), the face to the right: it covers the crown and the back. */
function HairShape({ kind, hy }: { kind: Hair; hy: number }) {
  if (kind === "toque") return <g className="toque">
    <rect x={-7.5} y={hy - 13} width={15} height={7} rx={2} />
    <circle cx={-4.5} cy={hy - 16} r={5.5} />
    <circle cx={3.5} cy={hy - 17} r={6} />
    <circle cx={0} cy={hy - 21} r={5} />
  </g>;
  const cap = `M -9.4 ${hy + 2} A 9.4 9.4 0 0 1 8.8 ${hy - 3.4} C 4 ${hy - 6.8} -1.5 ${hy - 5.6} -4 ${hy - 1.5} C -5.2 ${hy + 0.8} -6.8 ${hy + 3} -9.4 ${hy + 2} Z`;
  return <g className="hair">
    {kind === "long" && <rect x={-9.6} y={hy - 2} width={7.5} height={17} rx={3.5} />}
    {kind === "bob" && <rect x={-9.8} y={hy - 2} width={8} height={11} rx={3.5} />}
    {kind === "bun" && <circle cx={-6} cy={hy - 8.5} r={4.6} />}
    <path d={cap} />
  </g>;
}

function Phone({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return <g className="ask-phone" transform={`rotate(-14 ${x} ${y})`}>
    <rect x={x - 4} y={y - 7} width={8} height={13} rx={2} />
    <rect className={`screen${lit ? " lit" : ""}`} x={x - 2.6} y={y - 5.4} width={5.2} height={9.6} rx={0.8} />
  </g>;
}

/**
 * A person: a shadow, two legs, a rounded body, two arms, a head with its
 * hair. Walking swings the legs and the arms and bobs the body; seated, the
 * legs go forward under the table. What they hold — a plate, a phone, the bag
 * — is drawn in the hand in front.
 */
function Person({ role, f, t }: { role: Role; f: Figure; t: number }) {
  const look = LOOKS[role];
  const foot = iso(f.x, f.y, f.seated ? SEAT_Z : 0);
  const stride = f.t * Math.PI * 2 * 1.9;
  const swing = f.moving ? Math.sin(stride) : 0;
  const bob = f.moving ? -Math.abs(Math.sin(stride)) * 1.8 : Math.sin(f.t * 1.7 + ROLES.indexOf(role)) * 0.6;
  const busyCook = role === "cook" && cookingAt(t) && !f.moving;
  const carriesDish = role === "waiter" && ORDER_KINDS.slice(0, 2).some((kind) => dishAt(kind as "table" | "register", t)?.where === "carried");
  const carriesBag = role === "takeawayGuest" && bagAt(t) === "carried";
  const phone = phoneAt(role, t);
  const lit = phone && bubblesAt(t).some((b) => b.role === role && b.done);
  const eating = f.seated && (role === "tableGuest" || role === "registerGuest")
    && dishAt(role === "tableGuest" ? "table" : "register", t)?.where === "table" && !phone;

  if (f.seated) {
    const body = -35 + bob;
    const hy = -45 + bob;
    // Fork to the mouth and back, while there is food in front of them.
    const lift = eating ? (1 - Math.cos((f.t * Math.PI * 2) / 1.4)) / 2 : 0;
    const hand = phone ? { x: 12, y: -36 } : { x: 15 - lift * 6, y: -19 - lift * 19 };
    return <g className={`fig ${look.tone}`} transform={`translate(${foot.x.toFixed(1)} ${foot.y.toFixed(1)}) scale(${f.face * FIGURE} ${FIGURE})`} opacity={f.opacity}>
      <path className="leg" d="M -2 -4 L 11 -2 L 12 22" />
      <path className="arm back" d={`M -6 ${body + 7} L -3 ${body + 20}`} />
      <rect className="torso" x={-10.5} y={body} width={21} height={33} rx={9.5} />
      {look.apron && <rect className="apron" x={-7} y={body + 14} width={14} height={18} rx={3} />}
      <path className="arm" d={`M 6 ${body + 7} L ${hand.x} ${hand.y}`} />
      <circle className="head" cx={0} cy={hy} r={9} />
      <HairShape kind={look.hair} hy={hy} />
      {phone && <Phone x={14} y={-44} lit={lit} />}
    </g>;
  }

  const body = -55 + bob;
  const hy = -65 + bob;
  const lift = (s: number) => (s > 0 ? s * 2.6 : 0);
  const stir = busyCook ? Math.sin(t * 7) : 0;
  const front = carriesDish ? `M 6 ${body + 8} L 15 ${body + 14}`
    : phone ? `M 6 ${body + 8} L 11 ${body + 2}`
    : busyCook ? `M 6 ${body + 8} L ${13 + stir * 2} ${body + 16 + stir}`
    : `M 6 ${body + 8} L ${8 + swing * 4} ${body + 24}`;
  return <g className={`fig ${look.tone}`} transform={`translate(${foot.x.toFixed(1)} ${foot.y.toFixed(1)}) scale(${f.face * FIGURE} ${FIGURE})`} opacity={f.opacity}>
    <ellipse className="shadow" cx={0} cy={0} rx={12} ry={5} />
    <path className="leg back" d={`M -3 -24 L ${-3 - swing * 5} ${-2 - lift(-swing)}`} />
    <path className="leg" d={`M 3 -24 L ${3 + swing * 5} ${-2 - lift(swing)}`} />
    <path className="arm back" d={`M -6 ${body + 8} L ${-8 - swing * 4} ${body + 24}`} />
    <rect className="torso" x={-10.5} y={body} width={21} height={33} rx={9.5} />
    {look.apron && <rect className="apron" x={-7} y={body + 15} width={14} height={19} rx={3} />}
    <path className="arm" d={front} />
    <circle className="head" cx={0} cy={hy} r={9} />
    <HairShape kind={look.hair} hy={hy} />
    {carriesDish && <Dish p={{ x: 19, y: body + 13 }} />}
    {phone && <Phone x={13} y={body - 2} lit={lit} />}
    {carriesBag && <Bag x={12} y={body + 40} />}
  </g>;
}

/** Where a figure's head is on the page, for its bubble and a receipt leaving it. */
function headOf(f: Figure): Point {
  const foot = iso(f.x, f.y, f.seated ? SEAT_Z : 0);
  return { x: foot.x, y: foot.y - (f.seated ? 45 : 65) * FIGURE };
}

const BUBBLE_ICONS = { qr: QrCode, card: CreditCard, phone: Smartphone };

// ───────────────────────────── the loop ─────────────────────────────

/** What the room's parts are called on the slide: painted on it, and over the tax office. */
type SceneLabels = Record<"register" | "phone" | "kitchen" | "takeaway" | "receipt", string>;

const LABELS: SceneLabels = { register: "Register", phone: "Order and pay by QR", kitchen: "Kitchen", takeaway: "Takeaway", receipt: "Receipt to the tax office" };

/** Ported from Pesto's investor deck (slide 11): plays while on screen, from where it left off. */
export function AskScene({ labels = LABELS }: { labels?: SceneLabels }) {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, STILL_T);

  const figures = ROLES.flatMap((role) => {
    const f = figureAt(role, t);
    return f && f.opacity > 0 ? [{ role, f, slot: slotOf(f.x, f.y), depth: f.x + f.y }] : [];
  }).sort((a, b) => a.slot - b.slot || a.depth - b.depth);
  const figureOf = (role: Role) => figures.find((entry) => entry.role === role)?.f ?? null;

  const layers: ReactNode[] = [];
  SOLIDS.forEach((solid, i) => {
    figures.filter((entry) => entry.slot === i).forEach(({ role, f }) => layers.push(<Person key={role} role={role} f={f} t={t} />));
    layers.push(<g key={solid.key}>{solid.draw(t)}</g>);
  });
  figures.filter((entry) => entry.slot === SOLIDS.length).forEach(({ role, f }) => layers.push(<Person key={role} role={role} f={f} t={t} />));

  const ring = officeRingAt(t);

  if (!mounted) return <div ref={ref} className="ask3d" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }} />;
  return <div ref={ref} className="ask3d" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }}>
    <svg viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`} aria-hidden="true">
      <g className="ask3d-room">
        <Shell labels={labels} />
        {/* The kitchen's screen: a ticket for each order, from the moment it is placed until it is plated. */}
        {ORDER_KINDS.map((kind, i) => {
          const p = ticketAt(kind, t);
          if (p === null) return null;
          const y0 = 78 + i * 30;
          return <g key={kind} className="iso-ticket">
            <polygon points={pts(facingX(0, y0, y0 + 26, 91, 116))} />
            <polygon className="head" points={pts(facingX(0, y0, y0 + 26, 111, 116))} />
            <polygon className="line" points={pts(facingX(0, y0 + 4, y0 + 21, 103, 105.5))} />
            <polygon className="line" points={pts(facingX(0, y0 + 4, y0 + 16, 97, 99.5))} />
          </g>;
        })}
        {layers}
        {/* Each receipt's way up to the tax office, drawn behind it as it flies. */}
        {receiptsAt(t).map(({ from, p }) => {
          const f = from === "register" ? null : figureOf(from);
          const start = from === "register" ? TILL : f ? headOf(f) : TILL;
          const end = { x: OFFICE.x - 6, y: OFFICE.y + 10 };
          const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 90 };
          const q = 1 - (1 - p) ** 2;
          const point = (s: number) => ({
            x: (1 - s) ** 2 * start.x + 2 * (1 - s) * s * control.x + s ** 2 * end.x,
            y: (1 - s) ** 2 * start.y + 2 * (1 - s) * s * control.y + s ** 2 * end.y,
          });
          const now = point(q);
          const fade = Math.min(1, (1 - p) / 0.15, p / 0.08);
          return <g key={from} className="ask-receipt" opacity={fade}>
            <path className="trail" d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`} pathLength={1} strokeDasharray={`${q} 1`} />
            <g transform={`translate(${now.x.toFixed(1)} ${now.y.toFixed(1)}) rotate(${(-12 + q * 24).toFixed(1)})`}>
              <path className="paper" d="M -6 -8 H 6 V 7 L 4 8.5 L 2 7 L 0 8.5 L -2 7 L -4 8.5 L -6 7 Z" />
              <line x1={-3.5} y1={-4} x2={3.5} y2={-4} />
              <line x1={-3.5} y1={-0.5} x2={3.5} y2={-0.5} />
              <line x1={-3.5} y1={3} x2={1} y2={3} />
            </g>
          </g>;
        })}
        {/* The tax office, ringing as each one lands. */}
        <g className="ask-office">
          {ring !== null && <circle className="ring" cx={OFFICE.x} cy={OFFICE.y} r={22 + ring * 16} opacity={1 - ring} />}
          <circle cx={OFFICE.x} cy={OFFICE.y} r={22} />
          <Landmark x={OFFICE.x - 11} y={OFFICE.y - 11} width={22} height={22} />
        </g>
        {/* What each guest is doing, over their head. */}
        {bubblesAt(t).map(({ role, icon, done, pop }) => {
          const f = figureOf(role);
          if (!f) return null;
          const head = headOf(f);
          const Icon = done ? Check : BUBBLE_ICONS[icon];
          return <g key={`${role}-${icon}`} className={`ask-bubble${done ? " done" : ""}`}
            transform={`translate(${head.x.toFixed(1)} ${(head.y - 34).toFixed(1)}) scale(${pop.toFixed(3)})`} opacity={f.opacity}>
            <path className="tail" d="M -5 10 L 0 17 L 5 10 Z" />
            <circle r={14} />
            <Icon x={-8} y={-8} width={16} height={16} strokeWidth={2.4} />
          </g>;
        })}
      </g>
    </svg>
    <span className="ask3d-label under" style={at({ x: OFFICE.x, y: OFFICE.y + 30 })}>{labels.receipt}</span>
  </div>;
}
