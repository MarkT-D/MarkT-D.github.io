"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * QuotaClimat's article view in miniature: the words the classifier attended
 * to, per frame. The sentence and the weights are made up for the demo.
 */
const WORDS = "Fuel bills will rise again this winter, and families in small towns say the government left them to pay for the transition alone.".split(" ");
const FRAMES = {
  Economic: { 0: 0.9, 1: 0.8, 3: 0.7, 18: 0.6, 21: 0.5 },
  "Human interest": { 8: 0.9, 10: 0.5, 11: 0.6, 12: 0.4 },
  Responsibility: { 14: 0.9, 15: 0.8, 16: 0.5, 22: 0.6 },
} as Record<string, Record<number, number>>;
const PROBS: Record<string, number> = { Economic: 0.81, "Human interest": 0.57, Responsibility: 0.64 };

export function AttentionDemo() {
  const [frame, setFrame] = useState<keyof typeof FRAMES>("Economic");
  const w = FRAMES[frame];
  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {Object.keys(FRAMES).map((f) => (
          <button key={f} onClick={() => setFrame(f)} className={cn("h-8 rounded-lg px-3 text-[12.5px] font-semibold transition-colors", f === frame ? "bg-acc-6 text-white" : "bg-gr-2 text-gr-8 hover:bg-gr-3")}>
            {f} <span className="ml-1 font-normal opacity-80 tabular-nums">{Math.round(PROBS[f] * 100)}%</span>
          </button>
        ))}
      </div>
      <p className="font-display text-[19px] leading-[1.7]">
        {WORDS.map((word, i) => (
          <span key={i}>
            <span className="rounded px-0.5 transition-colors duration-300" style={{ background: w[i] ? `color-mix(in oklab, var(--red-6) ${Math.round(w[i] * 38)}%, transparent)` : "transparent" }}>{word}</span>{" "}
          </span>
        ))}
      </p>
      <p className="mt-3 text-[12px] text-muted-foreground">Highlighted: final-layer attention above mean + 1 sd, as the dashboard shows it. Example sentence.</p>
    </div>
  );
}
