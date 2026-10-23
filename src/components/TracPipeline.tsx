"use client";

import { AudioLines, Filter, Languages, Mic, Network, LayoutDashboard } from "lucide-react";
import uganda from "@/lib/uganda-dots.json";
import { useInView, useLoop } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * TRAC FM: radio call-ins in Ugandan languages → English → themes → dashboard.
 * A system design and proof of concept. Every number below is illustrative.
 */
const STAGES = [
  { icon: Mic, name: "Ingest", note: "call-in audio from the partner's API" },
  { icon: AudioLines, name: "Clean", note: "FFmpeg loudness, VAD, denoise" },
  { icon: Filter, name: "Transcribe", note: "Whisper vs. low-resource ASR" },
  { icon: Languages, name: "Translate", note: "LLM vs. MT, to English" },
  { icon: Network, name: "Group", note: "embeddings + HDBSCAN, LLM summaries" },
  { icon: LayoutDashboard, name: "Dashboard", note: "themes per question, per region" },
];

const THEMES = [
  { label: "Price of inputs", share: 34 },
  { label: "Access to clinics", share: 27 },
  { label: "Roads after rain", share: 22 },
  { label: "Other", share: 17 },
];

const TOWN_NAMES: Record<string, string> = { kampala: "Kampala", gulu: "Gulu", mbarara: "Mbarara", mbale: "Mbale", arua: "Arua", fortportal: "Fort Portal" };

export function TracPipeline() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const step = useLoop(STAGES.length + 3, 1000, inView);
  const towns = Object.entries(uganda.towns) as [string, [number, number]][];

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] [&>*]:min-w-0">
      <div className="card relative overflow-hidden p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold">Call-ins by station</span>
          <span className="chip">illustrative</span>
        </div>
        <svg viewBox={`-20 -20 ${uganda.w + 40} ${uganda.h + 40}`} className="w-full" role="img" aria-label="Map of Uganda with radio stations">
          {uganda.dots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4.6} fill="var(--gr-3)" />
          ))}
          {towns.map(([key, [x, y]], i) => (
            <g key={key}>
              <circle cx={x} cy={y} r={9} fill="var(--acc-6)" opacity={0.35} style={{ transformOrigin: `${x}px ${y}px`, animation: `pulse-ring 2.4s ease-out ${i * 0.4}s infinite` }} className="motion-reduce:hidden" />
              <circle cx={x} cy={y} r={7} fill="var(--acc-6)" stroke="#fff" strokeWidth={2.5} />
              <text x={x + 12} y={y + 4} fontSize={15} fontWeight={600} fill="var(--gr-9)">{TOWN_NAMES[key]}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STAGES.map(({ icon: Icon, name, note }, i) => (
            <li key={name} className={cn("rounded-xl border p-3 transition-all duration-500", step >= i ? "border-acc-3 bg-acc-1" : "border-border bg-card")}>
              <div className="flex items-center gap-2">
                <Icon className={cn("size-4", step >= i ? "text-acc-7" : "text-gr-6")} />
                <span className="text-[13px] font-semibold">{name}</span>
              </div>
              <div className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{note}</div>
            </li>
          ))}
        </ol>

        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">“What makes farming hard this season?”</span>
            <span className="chip">themes</span>
          </div>
          <ul className="space-y-2.5">
            {THEMES.map((th) => (
              <li key={th.label}>
                <div className="mb-1 flex justify-between text-[12.5px]"><span>{th.label}</span><span className="tabular-nums text-muted-foreground">{th.share}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-gr-2">
                  <div className="h-full rounded-full bg-acc-6 transition-[width] duration-1000" style={{ width: step >= STAGES.length - 1 ? `${th.share * 2.4}%` : "0%" }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-x-auto p-4">
          <div className="mb-2 text-sm font-semibold">Benchmark harness: add a model, get a column</div>
          <table className="w-full min-w-[420px] text-left text-[12px]">
            <thead className="text-muted-foreground">
              <tr><th className="py-1.5 font-medium">clip</th><th className="font-medium">gold (anthropologist)</th><th className="font-medium">model A</th><th className="font-medium">model B</th></tr>
            </thead>
            <tbody>
              {[["#0412", "✓", "WER 0.31", "WER 0.24"], ["#0413", "✓", "WER 0.44", "WER 0.29"], ["#0414", "✓", "WER 0.27", "WER 0.30"]].map((r) => (
                <tr key={r[0]} className="border-t border-border">
                  {r.map((c, j) => <td key={j} className={cn("py-1.5 tabular-nums", j === 0 && "font-mono")}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
