"use client";

import type { ReactNode } from "react";
import { iso, Prism, pts, facingY, type Box, type Point } from "./iso";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * One DAS-5 node opened up, its seven neighbours in a row behind it: the host
 * CPU sends the data over PCIe, the GTX Titan X's thread blocks light up for
 * the kernel, the result comes back. Phase lengths follow the 525 MB Caesar
 * run (copies 75 ms together, kernel 16 ms), so the picture tells the same
 * story as the chart below it: the copy, not the maths, is the slow part.
 */

const COPY = 4.0, KERNEL = 1.7, HOLD = 0.9;
const LOOP = COPY * 2 + KERNEL + HOLD * 2;
const STILL = COPY + HOLD + KERNEL * 0.6;

const FLOOR: Box = { x: -20, y: -86, w: 470, d: 376, z0: -10, z1: 0 };
const RACKS = Array.from({ length: 7 }, (_, i): Box => ({ x: 30 + i * 54, y: -70, w: 40, d: 40, z0: 0, z1: 78 }));
const BOARD: Box = { x: 0, y: 120, w: 430, d: 150, z0: 0, z1: 6 };
const CPU: Box = { x: 24, y: 160, w: 64, d: 64, z0: 6, z1: 22 };
const RAM = [0, 1, 2, 3].map((k): Box => ({ x: 22 + k * 18, y: 236, w: 8, d: 26, z0: 6, z1: 26 }));
const GPU: Box = { x: 206, y: 146, w: 200, d: 110, z0: 6, z1: 24 };
const BUS_Z = 12;
const BUS = { a: [CPU.x + CPU.w, CPU.y + CPU.d / 2] as const, b: [GPU.x, CPU.y + CPU.d / 2] as const };
const COLS = 8, ROWS = 4;
const SM = (c: number, r: number): Box => ({ x: GPU.x + 14 + c * 23, y: GPU.y + 12 + r * 24, w: 16, d: 16, z0: GPU.z1, z1: GPU.z1 + 9 });

type Phase = "in" | "kernel" | "out" | "hold";
function phaseAt(t: number): { phase: Phase; p: number } {
  if (t < COPY) return { phase: "in", p: t / COPY };
  if (t < COPY + HOLD / 2) return { phase: "hold", p: 0 };
  if (t < COPY + HOLD / 2 + KERNEL) return { phase: "kernel", p: (t - COPY - HOLD / 2) / KERNEL };
  if (t < COPY + HOLD + KERNEL) return { phase: "hold", p: 1 };
  if (t < COPY * 2 + HOLD + KERNEL) return { phase: "out", p: (t - COPY - HOLD - KERNEL) / COPY };
  return { phase: "hold", p: 1 };
}

const BOUNDS = (() => {
  const c = [iso(FLOOR.x, FLOOR.y, 0), iso(FLOOR.x + FLOOR.w, FLOOR.y, 0), iso(FLOOR.x, FLOOR.y + FLOOR.d, FLOOR.z0), iso(FLOOR.x + FLOOR.w, FLOOR.y + FLOOR.d, FLOOR.z0), iso(RACKS[0].x, RACKS[0].y, 110)];
  const xs = c.map((p) => p.x), ys = c.map((p) => p.y);
  return { x: Math.min(...xs) - 6, y: Math.min(...ys) - 6, w: Math.max(...xs) - Math.min(...xs) + 12, h: Math.max(...ys) - Math.min(...ys) + 12 };
})();
const at = (p: Point) => ({ left: `${((p.x - BOUNDS.x) / BOUNDS.w) * 100}%`, top: `${((p.y - BOUNDS.y) / BOUNDS.h) * 100}%` });

function Label({ p, children, strong }: { p: Point; children: ReactNode; strong?: boolean }) {
  return <span className={cn("gp-label", strong && "strong")} style={at(p)}>{children}</span>;
}

/** A packet on the bus: a small cube at fraction s from the host to the GPU. */
function Packet({ s }: { s: number }) {
  const x = BUS.a[0] + (BUS.b[0] - BUS.a[0]) * s;
  return <Prism b={{ x: x - 5, y: BUS.a[1] - 5, w: 10, d: 10, z0: BUS_Z, z1: BUS_Z + 9 }} className="gn-packet" />;
}

export function GpuNode() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, STILL);
  const { phase, p } = phaseAt(t);

  // Packets in flight: eight per copy, evenly spaced, each taking 40% of the phase.
  const packets: number[] = [];
  if (phase === "in" || phase === "out") {
    for (let k = 0; k < 8; k++) {
      const s = (p - k * 0.075) / 0.4;
      if (s > 0 && s < 1) packets.push(phase === "in" ? s : 1 - s);
    }
  }
  // The kernel: a wave across the thread blocks, column by column.
  const lit = (c: number, r: number) => {
    if (phase !== "kernel") return 0;
    const wave = p * (COLS + 3) - c - r * 0.35;
    return wave > 0 && wave < 2.2 ? 1 : 0;
  };
  const done = (phase === "hold" && p === 1) || phase === "out";
  // An MPI message hopping along the racks, all the time.
  const hop = (t * 0.9) % 1;
  const from = Math.floor((t * 0.9) % (RACKS.length - 1));
  const r0 = RACKS[from], r1 = RACKS[from + 1];
  const mpi = iso(r0.x + 20 + (r1.x - r0.x) * hop, r0.y + 20, r0.z1 + 8 + Math.sin(hop * Math.PI) * 14);

  const phaseText = phase === "in" ? "PCIe: host → GPU" : phase === "kernel" ? "Kernel: 16 ms" : phase === "out" ? "PCIe: GPU → host" : done ? "Done" : "Data on the GPU";

  if (!mounted) return <div ref={ref} className="gp" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }} />;

  return <div ref={ref}>
    <div className="gp" style={{ aspectRatio: `${BOUNDS.w} / ${BOUNDS.h}` }}>
      <svg viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`} aria-hidden="true">
        <Prism b={FLOOR} className="gp-floor" />
        {RACKS.map((r, i) => <g key={i}>
          <Prism b={r} className="gn-rack" />
          {[0, 1, 2, 3, 4].map((k) => {
            const led = iso(r.x + 8 + (k % 2) * 8, r.y + r.d, 66 - k * 12);
            return <circle key={k} className={cn("gn-led", (Math.floor(t * 3) + i + k) % 4 === 0 && "on")} cx={led.x} cy={led.y} r={1.8} />;
          })}
        </g>)}
        <circle className="gn-mpi" cx={mpi.x} cy={mpi.y} r={4} />

        <Prism b={BOARD} className="gn-board" />
        {RAM.map((b, i) => <Prism key={i} b={b} className="gn-ram" />)}
        <Prism b={CPU} className={cn("gn-cpu", (phase === "in" || phase === "out") && "busy")} />
        {/* The bus: a rail on the board from the host to the card. */}
        <polygon className="gn-bus" points={pts([iso(BUS.a[0], BUS.a[1] - 7, 6.5), iso(BUS.b[0], BUS.b[1] - 7, 6.5), iso(BUS.b[0], BUS.b[1] + 7, 6.5), iso(BUS.a[0], BUS.a[1] + 7, 6.5)])} />
        {packets.filter((s) => s < 0.5).map((s, i) => <Packet key={`a${i}`} s={s} />)}
        <Prism b={GPU} className="gn-gpu" />
        <polygon className="gn-fan" points={pts(facingY(GPU.x + 8, GPU.x + 60, GPU.y + GPU.d, 9, 21))} />
        {Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => (
          <Prism key={`${r}-${c}`} b={SM(c, r)} className={cn("gn-sm", lit(c, r) > 0 && "lit", done && "done")} />
        )))}
        {packets.filter((s) => s >= 0.5).map((s, i) => <Packet key={`b${i}`} s={s} />)}
      </svg>
      <Label p={iso(RACKS[3].x + 20, RACKS[3].y, 118)}>8 nodes · MPI</Label>
      <Label p={iso(CPU.x + 32, CPU.y, 44)}>Host CPU</Label>
      <Label p={iso(GPU.x + 100, GPU.y, 62)} strong>GTX Titan X · {COLS * ROWS} blocks</Label>
      <span className={cn("gn-phase", phase === "kernel" && "kernel")} style={at(iso((BUS.a[0] + BUS.b[0]) / 2, BUS.a[1] + 70, 0))}>{phaseText}</span>
    </div>
    <div className="mt-3 px-1">
      <div className="flex h-2.5 gap-[3px] overflow-hidden rounded-full" aria-hidden>
        <span className={cn("gn-seg copy", phase === "in" && "now")} style={{ flex: 37.5 }} />
        <span className={cn("gn-seg kernel", phase === "kernel" && "now")} style={{ flex: 16 }} />
        <span className={cn("gn-seg copy", phase === "out" && "now")} style={{ flex: 37.5 }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[12px] text-muted-foreground">
        <span>Copies: 75 ms</span><span className="font-semibold text-acc-7">Kernel: 16 ms</span><span>CPU alone: 1,329 ms</span>
      </div>
    </div>
  </div>;
}
