"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Caesar-cipher encryption on a GTX Titan X (DAS-5 cluster) against one CPU
 * core, from the course benchmark CSV (5 trials each). Times in seconds.
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
].map((r) => ({ ...r, kernelX: r.seq / r.kernel, e2eX: r.seq / (r.kernel + r.mem) }));

const X0 = Math.log10(1500), X1 = Math.log10(7e8);
const Y0 = Math.log10(0.02), Y1 = Math.log10(200);

const SIZE = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${Math.round(b / 1e6)} MB` : `${Math.round(b / 1e3)} KB`);
const FX = (v: number) => (v >= 10 ? `${Math.round(v)}×` : `${v.toFixed(v >= 1 ? 1 : 2)}×`);

const SERIES = [
  { key: "kernelX" as const, label: "Kernel only", color: "var(--series-1)" },
  { key: "e2eX" as const, label: "With memory copies", color: "var(--series-2)" },
];

export function GpuSpeedup() {
  const [ref, inView] = useInView<HTMLDivElement>(undefined, true);
  const [hover, setHover] = useState<number | null>(null);
  // Drawn at the container's real width, so axis text stays 11px on a phone.
  const boxRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  const narrow = W < 480;
  const H = narrow ? 260 : 300;
  const M = { l: 40, r: narrow ? 76 : 112, t: 16, b: 40 };
  const x = (bytes: number) => M.l + ((Math.log10(bytes) - X0) / (X1 - X0)) * (W - M.l - M.r);
  const y = (v: number) => H - M.b - ((Math.log10(v) - Y0) / (Y1 - Y0)) * (H - M.t - M.b);
  const ticks = narrow ? [1e4, 1e6, 1e8] : [1e4, 1e5, 1e6, 1e7, 1e8];
  const path = (k: "kernelX" | "e2eX") => RUNS.map((r, i) => `${i ? "L" : "M"}${x(r.bytes).toFixed(1)},${y(r[k]).toFixed(1)}`).join(" ");
  const h = hover === null ? null : RUNS[hover];
  const last = RUNS[RUNS.length - 1];

  return (
    <div ref={ref} className="card p-5 sm:p-6">
      <div className="mb-1 text-[15px] font-semibold">GPU speedup over one CPU core, by input size</div>
      <p className="mb-3 text-[12.5px] text-muted-foreground">Caesar encryption in CUDA on a GTX Titan X, DAS-5 cluster. Log scales.</p>
      <ul className="mb-2 flex flex-wrap gap-4 text-[12.5px] text-gr-8" aria-label="Legend">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2"><span className="h-0.5 w-5 rounded-full" style={{ background: s.color }} />{s.label}</li>
        ))}
      </ul>

      <div ref={boxRef} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full overflow-visible" role="img" aria-label="Kernel-only speedup reaches 83 times at 525 megabytes; including memory copies it reaches about 15 times. Below about 40 kilobytes the CPU wins.">
          {/* grid + axes */}
          {[0.1, 1, 10, 100].map((v) => (
            <g key={v}>
              <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} stroke="var(--gr-3)" strokeDasharray={v === 1 ? undefined : "2 4"} />
              <text x={M.l - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">{v}×</text>
            </g>
          ))}
          <text x={W - M.r + 6} y={y(1) + 4} fontSize={11} fill="var(--muted-foreground)">{narrow ? "1×" : "break-even"}</text>
          {ticks.map((b) => (
            <text key={b} x={x(b)} y={H - M.b + 18} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">{SIZE(b)}</text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">input size</text>

          {/* GPU loses here */}
          <rect x={M.l} y={y(1)} width={x(4e4) - M.l} height={H - M.b - y(1)} fill="var(--gr-2)" opacity={0.7} />
          {!narrow && <text x={x(4e4) - 6} y={H - M.b - 8} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">CPU wins</text>}

          {hover !== null && <line x1={x(RUNS[hover].bytes)} x2={x(RUNS[hover].bytes)} y1={M.t} y2={H - M.b} stroke="var(--gr-5)" />}

          {SERIES.map((s, si) => (
            <g key={s.key}>
              <path
                d={path(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                style={{ strokeDashoffset: inView ? 0 : 1, transition: `stroke-dashoffset 1200ms cubic-bezier(0.45,0,0.2,1) ${si * 200}ms` }}
              />
              {RUNS.map((r, i) => (
                <circle key={i} cx={x(r.bytes)} cy={y(r[s.key])} r={hover === i ? 5 : 4} fill={s.color} stroke="var(--card)" strokeWidth={2} style={{ opacity: inView ? 1 : 0, transition: `opacity 300ms ${600 + i * 60}ms` }} />
              ))}
              <text x={x(last.bytes) + 10} y={y(last[s.key]) + 4} fontSize={12} fontWeight={600} fill="var(--foreground)">{FX(last[s.key])}</text>
            </g>
          ))}

          {/* hit targets, one column per input size */}
          {RUNS.map((r, i) => {
            const prev = i ? x(RUNS[i - 1].bytes) : M.l;
            const next = i < RUNS.length - 1 ? x(RUNS[i + 1].bytes) : W - M.r;
            const cx = x(r.bytes);
            return (
              <rect
                key={i}
                x={(prev + cx) / 2}
                y={M.t}
                width={(cx + next) / 2 - (prev + cx) / 2}
                height={H - M.t - M.b}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onTouchStart={() => setHover(i)}
              />
            );
          })}
        </svg>

        {h && (
          <div
            className="pointer-events-none absolute z-10 w-44 rounded-lg border border-border bg-card p-2.5 text-[12px] shadow-[var(--shadow-lift)]"
            style={{ left: `clamp(0px, calc(${(x(h.bytes) / W) * 100}% - 88px), calc(100% - 176px))`, top: 0 }}
          >
            <div className="mb-1 font-semibold">{SIZE(h.bytes)}</div>
            <div className="flex justify-between text-gr-8"><span>CPU</span><span className="tabular-nums">{(h.seq * 1000).toFixed(2)} ms</span></div>
            <div className="flex justify-between text-gr-8"><span>GPU kernel</span><span className="tabular-nums">{(h.kernel * 1000).toFixed(2)} ms</span></div>
            <div className="flex justify-between text-gr-8"><span>+ copies</span><span className="tabular-nums">{(h.mem * 1000).toFixed(2)} ms</span></div>
            <div className="mt-1 flex justify-between border-t border-border pt-1"><span>Speedup</span><span className="tabular-nums">{FX(h.kernelX)} / {FX(h.e2eX)}</span></div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-gr-8">
        The kernel is <b className="font-semibold text-foreground">83× faster</b> on 525 MB, but copying the data to the GPU and back caps the real gain at <b className="font-semibold text-foreground">~15×</b>. Below ~40 KB the CPU wins outright.
      </p>

      <details className="mt-3 text-[12.5px]">
        <summary className="cursor-pointer font-semibold text-acc-7">Show the data</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left tabular-nums">
            <thead className="text-muted-foreground">
              <tr><th className="py-1 font-medium">Input</th><th className="font-medium">CPU ms</th><th className="font-medium">Kernel ms</th><th className="font-medium">Copies ms</th><th className="font-medium">Speedup</th></tr>
            </thead>
            <tbody>
              {RUNS.map((r) => (
                <tr key={r.bytes} className={cn("border-t border-border")}>
                  <td className="py-1">{SIZE(r.bytes)}</td>
                  <td>{(r.seq * 1000).toFixed(3)}</td>
                  <td>{(r.kernel * 1000).toFixed(3)}</td>
                  <td>{(r.mem * 1000).toFixed(3)}</td>
                  <td>{FX(r.kernelX)} / {FX(r.e2eX)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
