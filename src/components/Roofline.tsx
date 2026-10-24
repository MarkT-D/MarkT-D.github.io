"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A roofline for the GTX Titan X the labs ran on (Maxwell, from the spec
 * sheet: ~6.1 TFLOP/s FP32, 1/32 of that in FP64, 336 GB/s). Pick a kernel and
 * it lands where its arithmetic intensity puts it: under the slope it waits on
 * memory, under the flat roof it waits on maths. Intensities are worked out by
 * hand from each kernel's loads, stores and operations, so they are estimates.
 */

const BW = 336; // GB/s
const FP32 = 6100; // GFLOP/s
const FP64 = FP32 / 32;

type Kernel = { key: string; name: string; ai: number; fp64?: boolean; why: string; fix: string; mine?: boolean };
const KERNELS: Kernel[] = [
  { key: "vadd", name: "Vector add", ai: 1 / 12, mine: true,
    why: "One add for every 12 bytes moved: two floats in, one out.",
    fix: "Nothing on the GPU makes this faster than memory. The win is fusing it into the kernel next to it." },
  { key: "caesar", name: "Caesar cipher", ai: 1.5, mine: true,
    why: "A few integer ops per byte read and written. Bandwidth-bound by a wide margin.",
    fix: "Coalesced, aligned loads matter more than block size. And on small inputs the PCIe copies dominate, so the CPU wins below ~40 KB." },
  { key: "wave", name: "Wave equation", ai: 0.2, fp64: true, mine: true,
    why: "A three-point stencil in double precision: ~5 FLOPs per 24 bytes. Maxwell's FP64 roof is 32× lower, but memory still binds first.",
    fix: "Below 10M points none of this mattered: 1,000 steps took ~2.3 s from 1k to 1M points. Launch and sync overhead set the time, so the fix is fewer launches, not faster maths." },
  { key: "mm", name: "Matmul, naive", ai: 0.25,
    why: "Each thread reads a row and a column from global memory: 2 FLOPs per 8 bytes, no reuse.",
    fix: "Tile it in shared memory, so every load is reused by the whole tile." },
  { key: "mmt", name: "Matmul, 32×32 tiles", ai: 8,
    why: "Shared-memory tiles reuse each loaded value 32 times: the same maths, 32× the arithmetic per byte.",
    fix: "Still left of the ridge at ~18 FLOP/byte. Register tiling and wider vector loads push it further right." },
];

// Chart space: log x 0.05 → 64 FLOP/byte, log y 10 → 10,000 GFLOP/s.
const VW = 560, VH = 230, L = 46, R = 14, T = 12, B = 30;
const X0 = Math.log10(0.05), X1 = Math.log10(64), Y0 = 1, Y1 = 4;
const sx = (ai: number) => L + ((Math.log10(ai) - X0) / (X1 - X0)) * (VW - L - R);
const sy = (g: number) => T + (1 - (Math.log10(g) - Y0) / (Y1 - Y0)) * (VH - T - B);
const roof = (ai: number, peak: number) => Math.min(peak, BW * ai);
const path = (peak: number) => {
  const ridge = peak / BW;
  const a = 0.05, b = 64;
  return `M ${sx(a).toFixed(1)} ${sy(Math.max(10, BW * a)).toFixed(1)} L ${sx(ridge).toFixed(1)} ${sy(peak).toFixed(1)} L ${sx(b).toFixed(1)} ${sy(peak).toFixed(1)}`;
};
const fmt = (g: number) => (g >= 1000 ? `${(g / 1000).toFixed(1)} TFLOP/s` : `${Math.round(g)} GFLOP/s`);

export function Roofline() {
  const [key, setKey] = useState("wave");
  const k = KERNELS.find((x) => x.key === key)!;
  const peak = k.fp64 ? FP64 : FP32;
  const got = roof(k.ai, peak);
  const memBound = k.ai < peak / BW;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Kernel">
        {KERNELS.map((x) => (
          <button key={x.key} role="radio" aria-checked={x.key === key} onClick={() => setKey(x.key)}
            className={cn("h-8 rounded-lg px-2.5 text-[12.5px] font-semibold transition-colors", x.key === key ? "bg-acc-6 text-primary-foreground" : "bg-gr-2 text-gr-8 hover:bg-gr-3")}>
            {x.name}{x.mine && <span className={cn("ml-1.5 text-[10.5px] font-medium", x.key === key ? "opacity-80" : "text-muted-foreground")}>lab</span>}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="rf block w-full" role="img" aria-label={`Roofline: ${k.name} at ${k.ai.toFixed(2)} FLOP per byte reaches about ${fmt(got)}, ${memBound ? "memory-bound" : "compute-bound"}.`}>
        {[10, 100, 1000, 10000].map((g) => <g key={g}>
          <line className="grid" x1={L} x2={VW - R} y1={sy(g)} y2={sy(g)} />
          <text className="tick" x={L - 6} y={sy(g) + 3.5} textAnchor="end">{g >= 1000 ? `${g / 1000}T` : g}</text>
        </g>)}
        {[0.1, 1, 10].map((a) => <g key={a}>
          <line className="grid" x1={sx(a)} x2={sx(a)} y1={T} y2={VH - B} />
          <text className="tick" x={sx(a)} y={VH - B + 14} textAnchor="middle">{a}</text>
        </g>)}
        <text className="axis" x={(L + VW - R) / 2} y={VH - 3} textAnchor="middle">FLOP per byte moved</text>
        <text className="axis" x={10} y={(T + VH - B) / 2} textAnchor="middle" transform={`rotate(-90 10 ${(T + VH - B) / 2})`}>GFLOP/s</text>

        <path className={cn("roof", !k.fp64 && "on")} d={path(FP32)} />
        <path className={cn("roof fp64", k.fp64 && "on")} d={path(FP64)} />
        <text className="roof-label" x={VW - R - 4} y={sy(FP32) - 6} textAnchor="end">FP32 peak</text>
        <text className="roof-label" x={VW - R - 4} y={sy(FP64) - 6} textAnchor="end">FP64 peak, 1/32</text>
        <text className="roof-label slope" x={sx(0.09)} y={sy(BW * 0.09) - 8} transform={`rotate(-38 ${sx(0.09)} ${sy(BW * 0.09) - 8})`}>336 GB/s</text>

        <line className="drop" x1={sx(k.ai)} x2={sx(k.ai)} y1={sy(got)} y2={VH - B} />
        <circle key={k.key} className="pt" cx={sx(k.ai)} cy={sy(got)} r={6.5} />
      </svg>
      <div className="mt-3 grid gap-1 text-[13px] leading-[1.5]">
        <p><b className={memBound ? "text-acc-7" : "text-red-8"}>{memBound ? "Memory-bound" : "Compute-bound"}</b> at ~{k.ai < 1 ? k.ai.toFixed(2) : k.ai} FLOP/byte, so at best ~{fmt(got)}. {k.why}</p>
        <p className="text-gr-8"><b>What moves it:</b> {k.fix}</p>
      </div>
    </div>
  );
}
