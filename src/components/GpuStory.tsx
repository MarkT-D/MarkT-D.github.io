"use client";

import { useEffect, useRef, useState } from "react";
import { GpuNode, GPU_NODE_ASPECT, GPU_NODE_LOOP } from "./iso/GpuNode";
import { Fit } from "./Fit";
import { useInView, useReducedMotion } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The GPU in three steps on one clock: the node and its cluster, then why
 * memory layout decides a kernel's speed (coalescing), then hiding the copies
 * behind the kernel (streams). The tabs jump; otherwise it plays through.
 */

const W = 600;
const H = Math.round(W / GPU_NODE_ASPECT);
const COAL = 10, STREAM = 9.5;
const PARTS = [
  { name: "The node", len: GPU_NODE_LOOP },
  { name: "Coalescing", len: COAL },
  { name: "Streams", len: STREAM },
];
const STARTS = PARTS.reduce<number[]>((a, p, i) => [...a, i ? a[i - 1] + PARTS[i - 1].len : 0], []);
const TOTAL = STARTS[2] + STREAM;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };

export function GpuStory() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const reduced = useReducedMotion();
  const [t, setT] = useState(4);
  const offset = useRef(4);
  const seekTo = useRef<number | null>(null);

  useEffect(() => {
    if (!inView || reduced) return;
    let start = performance.now() - offset.current * 1000;
    let frame = requestAnimationFrame(function tick(now) {
      if (seekTo.current !== null) { start = now - seekTo.current * 1000; seekTo.current = null; }
      const s = ((((now - start) / 1000) % TOTAL) + TOTAL) % TOTAL;
      offset.current = s;
      setT(s);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  const part = t < STARTS[1] ? 0 : t < STARTS[2] ? 1 : 2;
  const local = t - STARTS[part];
  const seek = (i: number) => { seekTo.current = STARTS[i]; offset.current = STARTS[i]; setT(STARTS[i]); };

  return (
    <div ref={ref}>
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="The GPU, in three steps">
        {PARTS.map((p, i) => (
          <button key={p.name} role="tab" aria-selected={part === i} onClick={() => seek(i)}
            className={cn("relative h-8 overflow-hidden rounded-lg px-3 text-[12.5px] font-semibold transition-colors", part === i ? "bg-acc-1 text-acc-8" : "bg-gr-2 text-gr-7 hover:text-foreground")}>
            <span className="relative z-[1]">{i + 1} · {p.name}</span>
            {part === i && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-acc-6" style={{ transform: `scaleX(${clamp(local / p.len)})` }} />}
          </button>
        ))}
      </div>
      <Fit width={W}>
        <div className="gs" style={{ width: W, height: H }}>
          <div key={part} className="gs-view">
            {part === 0 && <GpuNode time={local} />}
            {part === 1 && <Coalescing t={local} />}
            {part === 2 && <Streams t={local} />}
          </div>
        </div>
      </Fit>
    </div>
  );
}

// ───────────────────────────── coalescing ─────────────────────────────

const LANES = 32;
const TX = (i: number) => 44 + i * 16;          // a thread in the warp
const SEG = (i: number) => 44 + i * 16;         // a 128-byte segment of global memory
const WARP_Y = 86, MEM_Y = 236;

function Coalescing({ t }: { t: number }) {
  const strided = t >= COAL / 2;
  const k = t - (strided ? COAL / 2 : 0);
  const draw = ease((k - 0.4) / 1.4);
  const counted = ease((k - 1.8) / 0.8);
  const tx = strided ? 32 : 1;
  const useful = strided ? 3 : 100;
  return <div className="gs-coal">
    <div className="gs-mode">
      <span className={cn(!strided && "on")}>a[i]</span>
      <span className={cn(strided && "on")}>a[i × 32]</span>
    </div>
    <svg width={W} height={300} className="gs-svg" aria-hidden>
      <text x={44} y={WARP_Y - 18} className="gs-cap">One warp: 32 threads, one load each</text>
      {Array.from({ length: LANES }, (_, i) => <rect key={i} x={TX(i)} y={WARP_Y} width={13} height={13} rx={2} className={cn("gs-thread", draw > i / LANES && "on")} />)}
      <text x={44} y={MEM_Y + 40} className="gs-cap">Global memory, in 128-byte segments</text>
      {Array.from({ length: LANES }, (_, i) => {
        const hit = strided ? draw > i / LANES : i === 0 && draw > 0.02;
        return <rect key={i} x={SEG(i)} y={MEM_Y} width={13} height={18} rx={2} className={cn("gs-seg", hit && "hit")} />;
      })}
      {Array.from({ length: LANES }, (_, i) => {
        const p = clamp(draw * LANES - i);
        if (p <= 0) return null;
        const x1 = TX(i) + 6.5, y1 = WARP_Y + 13;
        const x2 = strided ? SEG(i) + 6.5 : SEG(0) + 1 + (i / 31) * 11, y2 = MEM_Y;
        return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} className="gs-load" />;
      })}
    </svg>
    <div className="gs-stats" style={{ opacity: counted }}>
      <div><b>{tx}</b><span>{tx === 1 ? "transaction" : "transactions"}</span></div>
      <div><b>{strided ? "4 KB" : "128 B"}</b><span>moved for 128 B used</span></div>
      <div className="wide"><span className="gs-eff"><i style={{ width: `${useful}%` }} /></span><span>{useful}% of the bandwidth does work</span></div>
    </div>
  </div>;
}

// ───────────────────────────── streams ─────────────────────────────

// The 525 MB run: copies and kernel as measured, then the same work in four chunks.
const H2D = 37.7, KER = 16.0, D2H = 37.7;
const ONE = [
  { row: 0, a: 0, b: H2D }, { row: 1, a: H2D, b: H2D + KER }, { row: 2, a: H2D + KER, b: H2D + KER + D2H },
];
const FOUR = (() => {
  const n = 4, h = H2D / n, k = KER / n, d = D2H / n;
  const out: { row: number; a: number; b: number; c: number }[] = [];
  let kEnd = 0, dEnd = 0;
  for (let i = 0; i < n; i++) {
    const hA = i * h;
    const kA = Math.max(hA + h, kEnd); kEnd = kA + k;
    const dA = Math.max(kEnd, dEnd); dEnd = dA + d;
    out.push({ row: 0, a: hA, b: hA + h, c: i }, { row: 1, a: kA, b: kEnd, c: i }, { row: 2, a: dA, b: dEnd, c: i });
  }
  return out;
})();
const END_ONE = H2D + KER + D2H;
const END_FOUR = Math.max(...FOUR.map((s) => s.b));
const PX = 470 / END_ONE;
const ROWS = ["Copy in", "Kernel", "Copy out"];

function Streams({ t }: { t: number }) {
  const ms = END_ONE * ease((t - 0.4) / 5);
  const done = t > 5.6;
  const timeline = (segs: { row: number; a: number; b: number; c?: number }[], y: number, end: number, label: string) => (
    <g transform={`translate(0 ${y})`}>
      <text x={0} y={-10} className="gs-cap strong">{label}</text>
      {ROWS.map((r, i) => <text key={r} x={0} y={i * 22 + 14} className="gs-cap">{r}</text>)}
      {ROWS.map((_, i) => <rect key={i} x={90} y={i * 22} width={470} height={18} rx={4} className="gs-lane" />)}
      {segs.map((s, i) => {
        const w = Math.max(0, Math.min(s.b, ms) - s.a) * PX;
        return w > 0 && <rect key={i} x={90 + s.a * PX} y={s.row * 22} width={w} height={18} rx={3} className={cn("gs-block", `r${s.row}`, s.c !== undefined && `c${s.c % 2}`)} />;
      })}
      {ms >= end - 0.01 && <text x={90 + end * PX + 6} y={58} className="gs-cap strong">{Math.round(end)} ms</text>}
    </g>
  );
  return <div className="gs-streams">
    <svg width={W} height={300} className="gs-svg" aria-hidden>
      {timeline(ONE, 34, END_ONE, "One stream: copy, then compute, then copy")}
      {timeline(FOUR, 170, END_FOUR, "Four streams: the copies overlap the kernel")}
      <line x1={90 + ms * PX} x2={90 + ms * PX} y1={14} y2={242} className="gs-playhead" />
    </svg>
    <div className="gs-result" style={{ opacity: done ? 1 : 0 }}>
      <b>{(END_ONE / END_FOUR).toFixed(1)}× faster</b> for the same work. Modelled from my 525 MB run&apos;s timings, one copy engine each way.
    </div>
  </div>;
}
