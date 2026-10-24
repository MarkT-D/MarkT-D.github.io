"use client";

import type { ReactNode } from "react";
import { iso, Prism, pts, facingY, type Box, type Point } from "./iso";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * A GPU node in a cluster, opened up, its neighbours in a row behind it: the
 * host CPU sends the data over PCIe, the GTX Titan X's thread blocks light up
 * for the kernel, the result comes back. Each phase takes its share of the
 * time it took in a measured run on DAS-5.
 */

const RUNS = [
  { bytes: 2048, seq: 0.000007, kernel: 0.000095, mem: 0.000087 },
  { bytes: 10240, seq: 0.000045, kernel: 0.000085, mem: 0.000044 },
  { bytes: 51200, seq: 0.000198, kernel: 0.000088, mem: 0.000073 },
  { bytes: 204800, seq: 0.000724, kernel: 0.000098, mem: 0.000197 },
  { bytes: 1048576, seq: 0.003415, kernel: 0.000127, mem: 0.000808 },
  { bytes: 5242880, seq: 0.01446, kernel: 0.000239, mem: 0.001007 },
  { bytes: 52428800, seq: 0.133828, kernel: 0.00173, mem: 0.011382 },
  { bytes: 524857600, seq: 1.328992, kernel: 0.015969, mem: 0.075343 },
];
const MS = (sec: number) => { const ms = sec * 1000; return ms >= 100 ? `${Math.round(ms).toLocaleString("en-GB")} ms` : ms >= 1 ? `${ms.toFixed(1)} ms` : `${Math.round(ms * 1000)} µs`; };

const LOOP = 9.6;
const STILL = 5.2;

/** How long each phase plays for this run: its share of the real time, never too quick to see. */
function timing(i: number) {
  const r = RUNS[i];
  const parts = [r.mem / 2, r.kernel, r.mem / 2];
  const total = parts.reduce((a, b) => a + b, 0);
  const [cin, ker, cout] = parts.map((v) => 0.6 + 6.0 * (v / total));
  const hold = (LOOP - cin - ker - cout) / 4;
  return { cin, ker, cout, hold };
}

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
function phaseAt(t: number, { cin, ker, cout, hold }: ReturnType<typeof timing>): { phase: Phase; p: number } {
  let a = hold;
  if (t < a) return { phase: "hold", p: 0 };
  if (t < a + cin) return { phase: "in", p: (t - a) / cin };
  a += cin + hold;
  if (t < a) return { phase: "hold", p: 0 };
  if (t < a + ker) return { phase: "kernel", p: (t - a) / ker };
  a += ker + hold;
  if (t < a) return { phase: "hold", p: 1 };
  if (t < a + cout) return { phase: "out", p: (t - a) / cout };
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
  const size = RUNS.length - 1;
  const run = RUNS[size];
  const { phase, p } = phaseAt(t, timing(size));

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
  const first = phase === "hold" && p === 0 && t < timing(size).hold + 0.01;
  // An MPI message hopping along the racks, all the time.
  const hop = (t * 0.9) % 1;
  const from = Math.floor((t * 0.9) % (RACKS.length - 1));
  const r0 = RACKS[from], r1 = RACKS[from + 1];
  const mpi = iso(r0.x + 20 + (r1.x - r0.x) * hop, r0.y + 20, r0.z1 + 8 + Math.sin(hop * Math.PI) * 14);

  const phaseText = phase === "in" ? "PCIe: host → GPU" : phase === "kernel" ? `Kernel: ${MS(run.kernel)}` : phase === "out" ? "PCIe: GPU → host" : done ? "Done" : first ? "Waiting for data" : "Data on the GPU";

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
  </div>;
}
