import { iso } from "./iso";

/**
 * A person in the isometric kit, drawn the way Pesto's restaurant scene draws
 * its staff: a shadow, legs, a rounded body, arms and a head with hair. Kept
 * free of any one scene's timeline so every scene can stand somebody in it.
 */
export type Hair = "short" | "long" | "bun" | "bob";
export type Tone = "guest-a" | "guest-b" | "guest-c" | "waiter" | "cashier";
export type Pose = "idle" | "hold" | "point" | "wave" | "type" | "walk";

function HairShape({ kind, hy }: { kind: Hair; hy: number }) {
  const cap = `M -9.4 ${hy + 2} A 9.4 9.4 0 0 1 8.8 ${hy - 3.4} C 4 ${hy - 6.8} -1.5 ${hy - 5.6} -4 ${hy - 1.5} C -5.2 ${hy + 0.8} -6.8 ${hy + 3} -9.4 ${hy + 2} Z`;
  return <g className="hair">
    {kind === "long" && <rect x={-9.6} y={hy - 2} width={7.5} height={17} rx={3.5} />}
    {kind === "bob" && <rect x={-9.8} y={hy - 2} width={8} height={11} rx={3.5} />}
    {kind === "bun" && <circle cx={-6} cy={hy - 8.5} r={4.6} />}
    <path d={cap} />
  </g>;
}

export function Figure({
  x, y, z = 0, tone, hair, face = 1, scale = 1, pose = "idle", t = 0, seated = false, children,
}: {
  x: number; y: number; z?: number; tone: Tone; hair: Hair; face?: 1 | -1; scale?: number;
  pose?: Pose; t?: number; seated?: boolean; children?: React.ReactNode;
}) {
  const foot = iso(x, y, z);
  const tr = `translate(${foot.x.toFixed(1)} ${foot.y.toFixed(1)}) scale(${(face * scale).toFixed(3)} ${scale})`;
  const breathe = Math.sin(t * 1.7 + x * 0.01) * 0.6;

  if (seated) {
    const body = -35 + breathe, hy = -45 + breathe;
    const tap = pose === "type" ? Math.abs(Math.sin(t * 9)) * 2 : 0;
    const hand = pose === "type" ? { x: 16, y: -22 - tap } : { x: 14, y: -20 };
    return <g className={`fig ${tone}`} transform={tr}>
      <path className="leg" d="M -2 -4 L 11 -2 L 12 22" />
      <path className="arm back" d={`M -6 ${body + 7} L ${pose === "type" ? 10 : -3} ${body + (pose === "type" ? 15 : 20)}`} />
      <rect className="torso" x={-10.5} y={body} width={21} height={33} rx={9.5} />
      <path className="arm" d={`M 6 ${body + 7} L ${hand.x} ${hand.y}`} />
      <circle className="head" cx={0} cy={hy} r={9} />
      <HairShape kind={hair} hy={hy} />
      {children}
    </g>;
  }

  const stride = t * Math.PI * 2 * 1.9;
  const swing = pose === "walk" ? Math.sin(stride) : 0;
  const bob = pose === "walk" ? -Math.abs(Math.sin(stride)) * 1.8 : breathe;
  const body = -55 + bob, hy = -65 + bob;
  const lift = (s: number) => (s > 0 ? s * 2.6 : 0);
  const wave = Math.sin(t * 6);
  const front =
    pose === "hold" ? `M 6 ${body + 8} L 15 ${body + 14}`
    : pose === "point" ? `M 6 ${body + 8} L 19 ${body + 4}`
    : pose === "wave" ? `M 6 ${body + 8} L ${13 + wave * 3} ${body - 8}`
    : `M 6 ${body + 8} L ${8 + swing * 4} ${body + 24}`;
  return <g className={`fig ${tone}`} transform={tr}>
    <ellipse className="shadow" cx={0} cy={0} rx={12} ry={5} />
    <path className="leg back" d={`M -3 -24 L ${-3 - swing * 5} ${-2 - lift(-swing)}`} />
    <path className="leg" d={`M 3 -24 L ${3 + swing * 5} ${-2 - lift(swing)}`} />
    <path className="arm back" d={`M -6 ${body + 8} L ${-8 - swing * 4} ${body + 24}`} />
    <rect className="torso" x={-10.5} y={body} width={21} height={33} rx={9.5} />
    <path className="arm" d={front} />
    <circle className="head" cx={0} cy={hy} r={9} />
    <HairShape kind={hair} hy={hy} />
    {children}
  </g>;
}

/** Where a standing figure's head is on the page, for a bubble over it. */
export function headAt(x: number, y: number, z = 0, scale = 1, seated = false) {
  const foot = iso(x, y, z);
  return { x: foot.x, y: foot.y - (seated ? 45 : 65) * scale };
}
