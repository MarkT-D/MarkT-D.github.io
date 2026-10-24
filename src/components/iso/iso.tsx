/**
 * The decks' isometric drawing, shared by the P&L's columns
 * (`investor-slides.tsx`) and the offer's restaurant (`ask-scene.tsx`): a
 * point of a scene on the page, and a block drawn as the three faces seen from
 * here. Plain SVG polygons, so a drawing is as sharp printed as on the screen.
 */

export const COS = Math.cos(Math.PI / 6);

/** A point of the scene (x to the front right, y to the front left, z up) on the page. */
export const iso = (x: number, y: number, z: number) => ({ x: (x - y) * COS, y: (x + y) / 2 - z });
export type Point = { x: number; y: number };
export const pts = (list: Point[]) => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

export type Box = { x: number; y: number; w: number; d: number; z0: number; z1: number };

/** A block: its top, its front (the face towards y) and its side (the face towards x) — the three seen from here. */
export function Prism({ b, className }: { b: Box; className: string }) {
  const { x, y, w, d, z0, z1 } = b;
  return <g className={className}>
    <polygon className="side" points={pts([iso(x + w, y, z0), iso(x + w, y + d, z0), iso(x + w, y + d, z1), iso(x + w, y, z1)])} />
    <polygon className="front" points={pts([iso(x, y + d, z0), iso(x + w, y + d, z0), iso(x + w, y + d, z1), iso(x, y + d, z1)])} />
    <polygon className="top" points={pts([iso(x, y, z1), iso(x + w, y, z1), iso(x + w, y + d, z1), iso(x, y + d, z1)])} />
  </g>;
}

/** A flat rectangle standing on the plane y = const (it faces the viewer's left). */
export const facingY = (x0: number, x1: number, y: number, z0: number, z1: number) => [iso(x0, y, z0), iso(x1, y, z0), iso(x1, y, z1), iso(x0, y, z1)];
/** The same on the plane x = const (it faces the viewer's right). */
export const facingX = (x: number, y0: number, y1: number, z0: number, z1: number) => [iso(x, y0, z0), iso(x, y1, z0), iso(x, y1, z1), iso(x, y0, z1)];
