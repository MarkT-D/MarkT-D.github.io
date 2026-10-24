/**
 * The offer's restaurant, as a loop (23 Oct): three guests come in by the one
 * door and are served the three ways Pesto takes an order — at a table from
 * the code on it, at the register, and to take away from a phone — while the
 * kitchen's screen takes each ticket, the cook plates it, the waiter carries
 * it, and every bill's receipt flies off to the tax office. Twenty seconds,
 * and then it begins again; `ask-scene.tsx` draws whatever `sceneAt` says.
 *
 * Pure, so the choreography can be checked without a browser
 * (`tests/unit/ask-loop.test.ts`): nobody walks into furniture that is not
 * there, and nothing is carried before it was cooked.
 *
 * Positions are on the room's floor, as `iso.tsx` takes them: x to the front
 * right, y to the front left, the back corner at 0, 0.
 */

/** Seconds, and the loop starts again. */
export const LOOP = 20;
/** Floor units a second. */
const WALK = 95;
/** How long a guest takes over the food once it is in front of them: the register's is quicker, or the loop could not hold both. */
const EAT = { table: 3.4, register: 2.8 };
/** How long each kind of order is on the stove. */
const COOK = { table: 4, register: 2.6, takeaway: 2 };
/** A guest steps out of the doorway, or back into it, over this long. */
export const FADE = 0.35;

export type Spot = readonly [number, number];

/** Where people stand. Every route is a straight line from one to the next, round the furniture. */
export const SPOTS = {
  doorOut: [-10, 290], door: [18, 290],
  // The guest who orders from the table's code, sitting behind the first table.
  wayA: [130, 210], wayA2: [174, 192], seatA: [201, 190],
  // The guest who orders at the register, then sits behind the second table.
  wayR1: [100, 262], wayR2: [160, 150], register: [251, 104],
  wayB: [310, 175], seatB: [341, 170], outB: [300, 300],
  // The guest who orders on the way in and takes it away from the shelf at the end of the pass.
  wayT: [60, 262], pickup: [112, 196],
  // The kitchen, behind the pass.
  stove: [30, 60], plateDrop: [36, 84], bagDrop: [36, 198],
  // The floor: where the waiter waits, takes a plate off the pass, and serves each table from its side.
  home: [170, 96], pick: [112, 96], serveA: [150, 248], backA: [128, 160], viaB: [200, 140], serveB: [292, 228],
  cashier: [251, 20],
} satisfies Record<string, Spot>;

/** A person's place at a moment. `face` is which way they look on the page: 1 to the right, -1 to the left. */
type Key = { t: number; at: Spot; seated: boolean; face: 1 | -1 };

/** Someone's evening, built a step at a time, with the moments that matter to others named. */
class Walker {
  keys: Key[];
  marks: Record<string, number> = {};
  t: number;
  private at: Spot;
  private seated = false;
  private facing: 1 | -1 = 1;

  constructor(t: number, at: Spot) {
    this.t = t;
    this.at = at;
    this.keys = [{ t, at, seated: false, face: 1 }];
  }

  private push() {
    this.keys.push({ t: this.t, at: this.at, seated: this.seated, face: this.facing });
    return this;
  }

  /** Walk through each spot in turn. */
  go(...spots: Spot[]) {
    for (const to of spots) {
      const [dx, dy] = [to[0] - this.at[0], to[1] - this.at[1]];
      // A step to the front right is a step to the right of the page, and to the front left, the left.
      if (dx - dy !== 0) this.facing = dx - dy > 0 ? 1 : -1;
      this.t += Math.hypot(dx, dy) / WALK;
      this.at = to;
      this.push();
    }
    return this;
  }

  wait(seconds: number) {
    this.t += seconds;
    return this.push();
  }

  until(t: number) {
    return t > this.t ? this.wait(t - this.t) : this;
  }

  face(dir: 1 | -1) {
    this.facing = dir;
    return this.push();
  }

  sit() {
    this.seated = true;
    return this.push();
  }

  stand() {
    this.seated = false;
    return this.push();
  }

  mark(name: string) {
    this.marks[name] = this.t;
    return this;
  }
}

const S = SPOTS;

/** Who does what, and when — each step waits for whoever it depends on. */
function choreograph() {
  const tableGuest = new Walker(0, S.doorOut).go(S.door, S.wayA, S.wayA2, S.seatA).sit().face(-1)
    .wait(0.35).mark("scan").wait(0.9).mark("ordered");
  const registerGuest = new Walker(3.6, S.doorOut).go(S.door, S.wayR1, S.wayR2, S.register).face(1)
    .wait(0.2).mark("pay").wait(0.7).mark("ordered").wait(0.3).go(S.wayB, S.seatB).sit().face(-1);
  const takeawayGuest = new Walker(9, S.doorOut).go(S.door, S.wayT)
    .wait(0.1).mark("phone").wait(0.8).mark("ordered").wait(0.3).go(S.pickup).face(-1);

  const cook = new Walker(0, S.stove)
    .until(tableGuest.marks.ordered + COOK.table - 0.3).go(S.plateDrop).mark("table").wait(0.3).go(S.stove).face(1)
    .until(registerGuest.marks.ordered + COOK.register - 0.3).go(S.plateDrop).mark("register").wait(0.2)
    .go(S.bagDrop).face(1).until(takeawayGuest.marks.ordered + COOK.takeaway).mark("takeaway").wait(0.3)
    .go(S.stove).face(1).until(LOOP);

  const waiter = new Walker(0, S.home)
    .until(cook.marks.table + 0.2).go(S.pick).face(-1).wait(0.25).mark("pickTable").go(S.serveA).face(1).wait(0.2).mark("serveTable").go(S.backA, S.home)
    .until(cook.marks.register + 0.2).go(S.pick).face(-1).wait(0.25).mark("pickRegister").go(S.viaB, S.serveB).face(1).wait(0.2).mark("serveRegister")
    .go(S.home).until(LOOP);

  tableGuest.until(waiter.marks.serveTable).mark("served").wait(EAT.table).mark("pay").wait(1.1).stand().mark("leave")
    .go(S.wayA2, S.wayA, S.door, S.doorOut);
  registerGuest.until(waiter.marks.serveRegister).mark("served").wait(EAT.register).stand().mark("leave")
    .go(S.wayB, S.outB, S.door, S.doorOut);
  takeawayGuest.until(cook.marks.takeaway + 0.25).mark("grab").wait(0.2).go(S.wayT, S.door, S.doorOut);

  const cashier = new Walker(0, S.cashier).face(-1).until(LOOP);
  return { tableGuest, registerGuest, takeawayGuest, cook, waiter, cashier };
}

const CAST = choreograph();
export type Role = keyof typeof CAST;
export const ROLES = Object.keys(CAST) as Role[];
/** The three who come in from the street and leave again; the rest are on shift the whole loop. */
export const GUESTS: Role[] = ["tableGuest", "registerGuest", "takeawayGuest"];

/** The named moments of the loop, in seconds — some past `LOOP`: the register's guest is still eating when it starts again. */
export const MOMENTS = {
  table: { scan: CAST.tableGuest.marks.scan, ordered: CAST.tableGuest.marks.ordered, ready: CAST.cook.marks.table, picked: CAST.waiter.marks.pickTable, served: CAST.waiter.marks.serveTable, pay: CAST.tableGuest.marks.pay, leave: CAST.tableGuest.marks.leave },
  register: { pay: CAST.registerGuest.marks.pay, ordered: CAST.registerGuest.marks.ordered, ready: CAST.cook.marks.register, picked: CAST.waiter.marks.pickRegister, served: CAST.waiter.marks.serveRegister, leave: CAST.registerGuest.marks.leave },
  takeaway: { phone: CAST.takeawayGuest.marks.phone, ordered: CAST.takeawayGuest.marks.ordered, ready: CAST.cook.marks.takeaway, grabbed: CAST.takeawayGuest.marks.grab },
};

/** When each of someone's turns begins and ends. */
export function spanOf(role: Role): [number, number] {
  const keys = CAST[role].keys;
  return [keys[0].t, keys[keys.length - 1].t];
}

/** The spots someone walks through, in order. */
export function routeOf(role: Role): Spot[] {
  return CAST[role].keys.map((key) => key.at);
}

/** A time of the loop as a time on this span, if the span is showing then: a span may run past the loop's end. */
function onSpan(t: number, from: number, to: number): number | null {
  for (const c of [t, t + LOOP, t - LOOP]) if (c >= from && c <= to) return c;
  return null;
}

/** How far through `from`–`to` the loop is (0–1), or null outside it. */
export function within(t: number, from: number, to: number): number | null {
  const c = onSpan(t, from, to);
  return c === null ? null : to > from ? (c - from) / (to - from) : 1;
}

export type Figure = {
  x: number; y: number;
  seated: boolean;
  /** Walking, and how far through a stride. */
  moving: boolean;
  face: 1 | -1;
  /** Seconds since the span began, for a stride's phase and an idle sway. */
  t: number;
  opacity: number;
};

/** Where someone is, or null while they are not in the room. */
export function figureAt(role: Role, t: number): Figure | null {
  const keys = CAST[role].keys;
  const [from, to] = spanOf(role);
  const c = onSpan(t, from, to);
  if (c === null) return null;
  // The first key at or after `c`, and the one before it.
  let i = 1;
  while (i < keys.length - 1 && keys[i].t < c) i++;
  const next = keys[i];
  const prev = keys[i - 1];
  const span = next.t - prev.t;
  const p = span > 0 ? Math.max(0, Math.min(1, (c - prev.t) / span)) : 1;
  const moving = span > 0 && (prev.at[0] !== next.at[0] || prev.at[1] !== next.at[1]);
  const guest = GUESTS.includes(role);
  const opacity = guest ? Math.min(1, (c - from) / FADE, (to - c) / FADE) : 1;
  return {
    x: prev.at[0] + (next.at[0] - prev.at[0]) * p,
    y: prev.at[1] + (next.at[1] - prev.at[1]) * p,
    seated: moving ? false : next.seated,
    moving,
    face: moving ? next.face : (p >= 1 ? next.face : prev.face),
    t: c - from,
    opacity: Math.max(0, opacity),
  };
}

export type OrderKind = "table" | "register" | "takeaway";
export const ORDER_KINDS: OrderKind[] = ["table", "register", "takeaway"];

/** Each order's ticket on the kitchen's screen: from the moment it is placed to the moment it is plated. */
export function ticketAt(kind: OrderKind, t: number): number | null {
  const m = MOMENTS[kind];
  return within(t, m.ordered, m.ready);
}

/** Something is on the stove. */
export function cookingAt(t: number): boolean {
  return ORDER_KINDS.some((kind) => ticketAt(kind, t) !== null);
}

/** Where a dish is: on the pass, in the waiter's hand, on the table (with how much of it is left), or nowhere. */
export type DishAt = { where: "pass" } | { where: "carried" } | { where: "table"; left: number; opacity: number } | null;

export function dishAt(kind: "table" | "register", t: number): DishAt {
  const m = MOMENTS[kind];
  if (within(t, m.ready, m.picked) !== null) return { where: "pass" };
  if (within(t, m.picked, m.served) !== null) return { where: "carried" };
  // Eaten from a moment after it lands until the bill; cleared as the guest gets up.
  const end = m.leave + 0.4;
  const on = within(t, m.served, end);
  if (on === null) return null;
  const c = onSpan(t, m.served, end)!;
  const finished = kind === "table" ? MOMENTS.table.pay : m.leave;
  const left = 1 - Math.max(0, Math.min(1, (c - m.served - 0.3) / (finished - m.served - 0.5)));
  return { where: "table", left, opacity: Math.max(0, Math.min(1, (end - c) / 0.4)) };
}

/** The takeaway bag: waiting on the shelf, or in the guest's hand. */
export function bagAt(t: number): "shelf" | "carried" | null {
  const m = MOMENTS.takeaway;
  if (within(t, m.ready, m.grabbed) !== null) return "shelf";
  return within(t, m.grabbed, spanOf("takeawayGuest")[1]) !== null ? "carried" : null;
}

/** A guest's bubble: what they are doing — scanning, paying, ordering on the phone — and then the tick. */
export type Bubble = { role: Role; icon: "qr" | "card" | "phone"; done: boolean; pop: number };

const BUBBLES: { role: Role; icon: Bubble["icon"]; from: number; done: number; to: number }[] = [
  { role: "tableGuest", icon: "qr", from: MOMENTS.table.scan - 0.15, done: MOMENTS.table.ordered, to: MOMENTS.table.ordered + 0.7 },
  { role: "registerGuest", icon: "card", from: MOMENTS.register.pay, done: MOMENTS.register.ordered, to: MOMENTS.register.ordered + 0.7 },
  { role: "takeawayGuest", icon: "phone", from: MOMENTS.takeaway.phone, done: MOMENTS.takeaway.ordered, to: MOMENTS.takeaway.ordered + 0.7 },
  { role: "tableGuest", icon: "card", from: MOMENTS.table.pay, done: MOMENTS.table.pay + 0.55, to: MOMENTS.table.pay + 1.1 },
];

export function bubblesAt(t: number): Bubble[] {
  return BUBBLES.flatMap(({ role, icon, from, done, to }) => {
    const c = onSpan(t, from, to);
    if (c === null) return [];
    // In over a quarter of a second with a little overshoot, out over a fifth.
    const pop = Math.min(ease((c - from) / 0.25), Math.max(0, Math.min(1, (to - c) / 0.2)));
    return [{ role, icon, done: c >= done, pop }];
  });
}

/** Out past 1 and back, as a thing popping into place does. */
function ease(p: number) {
  if (p >= 1) return 1;
  if (p <= 0) return 0;
  const s = 1.7;
  const q = p - 1;
  return 1 + (s + 1) * q ** 3 + s * q ** 2;
}

/** A phone held up: while scanning or paying at the table, and while ordering the takeaway. */
export function phoneAt(role: Role, t: number): boolean {
  if (role === "tableGuest") {
    const m = MOMENTS.table;
    return within(t, m.scan - 0.25, m.ordered + 0.4) !== null || within(t, m.pay - 0.2, m.pay + 0.8) !== null;
  }
  if (role === "takeawayGuest") return within(t, MOMENTS.takeaway.phone - 0.3, MOMENTS.takeaway.ordered + 0.4) !== null;
  return false;
}

/** The register's tablet lit, while the bill on it is paid. */
export function tabletLitAt(t: number): boolean {
  return within(t, MOMENTS.register.pay, MOMENTS.register.ordered + 0.3) !== null;
}

/** The table's code lit, while it is scanned. */
export function codeLitAt(t: number): boolean {
  return within(t, MOMENTS.table.scan - 0.1, MOMENTS.table.ordered) !== null;
}

/** A receipt on its way to the tax office: from whom, and how far along. Every paid bill sends one. */
export type ReceiptAt = { from: Role | "register"; p: number };
export const RECEIPT_FLIGHT = 1.3;
const RECEIPTS: { from: ReceiptAt["from"]; at: number }[] = [
  { from: "register", at: MOMENTS.register.ordered + 0.1 },
  { from: "takeawayGuest", at: MOMENTS.takeaway.ordered + 0.1 },
  { from: "tableGuest", at: MOMENTS.table.pay + 0.55 },
];

export function receiptsAt(t: number): ReceiptAt[] {
  return RECEIPTS.flatMap(({ from, at }) => {
    const p = within(t, at, at + RECEIPT_FLIGHT);
    return p === null ? [] : [{ from, p }];
  });
}

/** The tax office's badge rings once for each receipt that lands: 0–1 through the ring, or null. */
export function officeRingAt(t: number): number | null {
  for (const { at } of RECEIPTS) {
    const p = within(t, at + RECEIPT_FLIGHT, at + RECEIPT_FLIGHT + 0.8);
    if (p !== null) return p;
  }
  return null;
}

/**
 * The moment printed, and shown when motion is reduced: the waiter carrying
 * the first plate, the register's guest on the way to a table, the receipt
 * of that bill in the air, the takeaway guest stepping in.
 */
export const STILL_T = 9.35;
