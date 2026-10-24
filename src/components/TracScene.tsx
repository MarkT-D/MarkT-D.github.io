"use client";

import { useState } from "react";
import { AudioLines, Container, FlaskConical, Languages, LayoutDashboard, Network, PhoneIncoming, ScrollText } from "lucide-react";
import uganda from "@/lib/uganda-dots.json";
import { Fit } from "./Fit";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * TRAC FM in two pictures on one clock. In the field, listeners call in near
 * each radio station and their answers travel to its tower. Then the map
 * steps aside and the same calls run through the system I designed: one
 * container per stage, each stage's model swappable, a benchmark harness
 * scoring the candidates on the anthropologists' gold set, themes at the end.
 * Stations, calls and numbers are illustrative.
 */

const LOOP = 20;
const FIELD_END = 9, SYSTEM_AT = 10, BACK = 19;
const W = 1080, H = 470;

const TOWERS = [
  { key: "kampala", name: "Kampala", lang: "Luganda" },
  { key: "gulu", name: "Gulu", lang: "Acholi" },
  { key: "mbarara", name: "Mbarara", lang: "Runyankole" },
  { key: "mbale", name: "Mbale", lang: "Lugisu" },
  { key: "arua", name: "Arua", lang: "Lugbara" },
  { key: "fortportal", name: "Fort Portal", lang: "Rutooro" },
] as const;
const TOWN = uganda.towns as unknown as Record<string, [number, number]>;

/** A fixed, seeded list of calls for one loop: who called which tower, from where, when. */
const CALLS = (() => {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const out: { tower: number; x: number; y: number; at: number; secs: number; mixed: boolean }[] = [];
  for (let at = 0.1; at < LOOP - 0.8; at += 0.12 + rnd() * 0.2) {
    const tower = Math.floor(rnd() * TOWERS.length);
    const [tx, ty] = TOWN[TOWERS[tower].key];
    const a = rnd() * Math.PI * 2, r = 26 + rnd() * 44;
    out.push({ tower, x: tx + Math.cos(a) * r, y: ty + Math.sin(a) * r, at, secs: 18 + Math.floor(rnd() * 50), mixed: rnd() < 0.45 });
  }
  return out;
})();
const TRAVEL = 0.7;

const STAGES = [
  { icon: PhoneIncoming, name: "Ingest", models: ["partner API", "queue"] },
  { icon: AudioLines, name: "Clean", models: ["FFmpeg", "VAD", "denoise"] },
  { icon: ScrollText, name: "Transcribe", models: ["Whisper", "MMS", "…"], bench: true },
  { icon: Languages, name: "Translate", models: ["LLM", "MT"], bench: true },
  { icon: Network, name: "Group", models: ["embeddings", "HDBSCAN"] },
];
const THEMES = [["Price of inputs", 34], ["Access to clinics", 27], ["Roads after rain", 22], ["Other", 17]] as const;
const MODELS = [["Whisper large", "0.31"], ["MMS", "0.24"], ["fine-tuned", "0.19"]] as const;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };

export function TracScene() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, 6);
  const [held, setHeld] = useState<"field" | "system" | null>(null);

  // 0 = the map fills the left half; 1 = it has stepped aside for the system.
  const auto = t < FIELD_END ? 0 : t < SYSTEM_AT ? ease(t - FIELD_END) : t < BACK ? 1 : 1 - ease(t - BACK);
  const k = held === "field" ? 0 : held === "system" ? 1 : auto;
  const view = k > 0.5 ? "system" : "field";

  const live = CALLS.filter((c) => t >= c.at && t < c.at + TRAVEL + 0.6);
  const feed = CALLS.filter((c) => t >= c.at + TRAVEL).slice(-5).reverse();
  const today = 1240 + CALLS.filter((c) => t >= c.at + TRAVEL).length;
  const hot = new Set(CALLS.filter((c) => t >= c.at + TRAVEL && t < c.at + TRAVEL + 0.35).map((c) => c.tower));

  const mapX = 40 + (14 - 40) * k, mapY = 14 + (92 - 14) * k, mapS = 0.86 - 0.42 * k;

  return (
    <div ref={ref}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-gr-2 p-0.5" role="tablist" aria-label="View">
          {(["field", "system"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setHeld(held === v ? null : v)}
              className={cn("h-8 rounded-md px-3 text-[12.5px] font-semibold transition-colors", view === v ? "bg-card text-foreground shadow-sm" : "text-gr-7 hover:text-foreground")}>
              {v === "field" ? "In the field" : "The system"}
            </button>
          ))}
        </div>
        <span className="text-[12.5px] text-muted-foreground">{held ? "Paused on this view. Press it again to play both." : "Plays both, one after the other."}</span>
      </div>
      <Fit width={W} minScale={0.6}>
        <div className="tf" style={{ width: W, height: H }}>
          {mounted && <>
            {/* The map, which steps aside rather than disappearing: the calls keep coming. */}
            <div className="tf-map" style={{ transform: `translate(${mapX}px, ${mapY}px) scale(${mapS})` }}>
              <svg viewBox={`-30 -30 ${uganda.w + 60} ${uganda.h + 60}`} width={uganda.w + 60} height={uganda.h + 60} aria-label="Map of Uganda with six radio towers and calls arriving at them" role="img">
                {uganda.dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4.4} className="tf-land" />)}
                {live.map((c) => {
                  const [tx, ty] = TOWN[TOWERS[c.tower].key];
                  const p = clamp((t - c.at) / TRAVEL);
                  const done = t >= c.at + TRAVEL;
                  return <g key={`${c.at}`} opacity={done ? 1 - clamp((t - c.at - TRAVEL) / 0.6) : 1}>
                    <line x1={c.x} y1={c.y} x2={c.x + (tx - c.x) * p} y2={c.y + (ty - 8 - c.y) * p} className="tf-call-line" />
                    <circle cx={c.x} cy={c.y} r={5} className="tf-caller" />
                    <circle cx={c.x} cy={c.y} r={5 + p * 9} className="tf-caller-ring" opacity={1 - p} />
                    {!done && <circle cx={c.x + (tx - c.x) * p} cy={c.y + (ty - 8 - c.y) * p} r={3.4} className="tf-packet" />}
                  </g>;
                })}
                {TOWERS.map((tw, i) => {
                  const [x, y] = TOWN[tw.key];
                  return <g key={tw.key} className={cn("tf-tower", hot.has(i) && "hot")} transform={`translate(${x} ${y})`}>
                    <path className="wave" d="M -11 -26 A 14 14 0 0 1 -11 -6 M 11 -26 A 14 14 0 0 0 11 -6" />
                    <path className="wave far" d="M -17 -31 A 21 21 0 0 1 -17 -1 M 17 -31 A 21 21 0 0 0 17 -1" />
                    <path className="mast" d="M -7 6 L 0 -16 L 7 6 M -4.5 -1 L 4.5 -1 M -2.6 -7 L 2.6 -7" />
                    <circle className="tip" cx={0} cy={-17} r={3.4} />
                    <text x={13} y={14} className="tf-town" opacity={1 - k}>{tw.name}</text>
                  </g>;
                })}
              </svg>
            </div>

            {/* In the field: what is arriving */}
            <div className="tf-field" style={{ opacity: 1 - k, pointerEvents: k > 0.5 ? "none" : undefined, transform: `translateX(${k * 40}px)` }}>
              <div className="tf-kicker">Call-ins, as they arrive</div>
              <div className="tf-big">{today.toLocaleString("en-GB")}<span>answers to today&apos;s question</span></div>
              <p className="tf-q">&ldquo;What makes farming hard this season?&rdquo;</p>
              <ul className="tf-feed">
                {feed.map((c) => (
                  <li key={c.at}>
                    <span className="tf-feed-tower">{TOWERS[c.tower].name}</span>
                    <span>{TOWERS[c.tower].lang}{c.mixed && <em> + English</em>}</span>
                    <span className="tf-feed-secs">0:{String(c.secs).padStart(2, "0")}</span>
                  </li>
                ))}
              </ul>
              <p className="tf-note">Noisy phone lines, six main languages, and people switching language mid-sentence. That is what the system has to read.</p>
            </div>

            {/* The system */}
            <div className="tf-sys" style={{ opacity: k, pointerEvents: k < 0.5 ? "none" : undefined }}>
              <svg className="tf-flow" width={W} height={H} aria-hidden>
                <path d={`M 212 ${ROW_Y} L ${STAGE_X(5) + 8} ${ROW_Y}`} />
                <path d={`M ${STAGE_X(2) + SW / 2} ${ROW_Y + 64} L ${STAGE_X(2) + SW / 2} 306`} className="dash" />
                <path d={`M ${STAGE_X(3) + SW / 2} ${ROW_Y + 64} L ${STAGE_X(3) + SW / 2} 306`} className="dash" />
                {Array.from({ length: 9 }, (_, i) => {
                  const p = ((t * 0.16 + i / 9) % 1);
                  const x = 212 + (STAGE_X(5) + 8 - 212) * p;
                  return <circle key={i} cx={x} cy={ROW_Y} r={4} className="tf-packet" />;
                })}
              </svg>
              {STAGES.map((s, i) => {
                const lit = Math.floor((t * 0.16 * 9) % 9) % 5 === i;
                return <div key={s.name} className={cn("tf-stage", lit && "lit", s.bench && "bench")} style={{ left: STAGE_X(i), top: ROW_Y - 64, width: SW }}>
                  <div className="tf-stage-head"><s.icon className="size-4" /><b>{s.name}</b></div>
                  <div className="tf-models">{s.models.map((m, j) => <span key={m} className={cn(j === 0 && "on")}>{m}</span>)}</div>
                  <div className="tf-ctr"><Container className="size-3" /> container</div>
                </div>;
              })}
              <div className="tf-dash" style={{ left: STAGE_X(5) - 2, top: ROW_Y - 100, width: 196 }}>
                <div className="tf-stage-head"><LayoutDashboard className="size-4" /><b>Dashboard</b></div>
                <p>Themes per question, per region</p>
                {THEMES.map(([label, share], i) => (
                  <div key={label} className="tf-theme">
                    <span>{label}</span><b>{share}%</b>
                    <i style={{ width: `${share * 2.4 * ease((t - SYSTEM_AT - 0.6 - i * 0.2) / 0.8)}%` }} />
                  </div>
                ))}
              </div>

              <div className="tf-gold" style={{ left: 232, top: 322 }}>
                <b>Gold set</b>
                <span>from the anthropologists: audio, original-language transcripts, validated English</span>
              </div>
              <div className="tf-harness" style={{ left: STAGE_X(1) + 60, top: 306, width: STAGE_X(4) + SW - STAGE_X(1) - 60 }}>
                <div className="tf-stage-head"><FlaskConical className="size-4" /><b>Benchmark harness</b><span>add a provider and a model, get a column</span></div>
                <table>
                  <thead><tr><th>clip</th>{MODELS.map(([m], i) => <th key={m} style={{ opacity: t > SYSTEM_AT + 1 + i * 1.6 ? 1 : 0.15 }}>{m}</th>)}</tr></thead>
                  <tbody>
                    {["#0412", "#0413"].map((clip, r) => (
                      <tr key={clip}><td>{clip}</td>{MODELS.map(([m, wer], i) => <td key={m} style={{ opacity: t > SYSTEM_AT + 1.3 + i * 1.6 + r * 0.2 ? 1 : 0.1 }}>WER {(Number(wer) + r * 0.04).toFixed(2)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="tf-caption" style={{ left: 14, top: 330 }}>Calls from the field arrive here</div>
            </div>
          </>}
        </div>
      </Fit>
      <p className="mt-3 text-[12.5px] text-muted-foreground">Proof-of-concept design. Stations, calls, themes and scores are illustrative.</p>
    </div>
  );
}

const ROW_Y = 200;
const SW = 118;
const STAGE_X = (i: number) => 232 + i * (SW + 12);
