"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** A run log that types itself: the kind of system the rest of the page shows. */
const LINES = [
  { t: "parse", m: "grant call → 9 sections, 4,800 words max" },
  { t: "context", m: "salesforce: 312 records · bynder: 41 assets" },
  { t: "draft", m: "9/9 sections in 1m 54s" },
  { t: "judge", m: "work plan 6/10: milestones have no dates" },
  { t: "ocr", m: "menu photo → 38 dishes, 6 sections" },
  { t: "check", m: "expected JSON: 38/38 dishes match" },
  { t: "classify", m: "~20k articles, 781 outlets · F1 macro 0.82 (FR)" },
  { t: "ship", m: "ready for expert review" },
];

export function HeroVisual() {
  const [n, setN] = useState(LINES.length);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(1);
    const id = setInterval(() => setN((v) => (v >= LINES.length + 3 ? 1 : v + 1)), 900);
    return () => clearInterval(id);
  }, []);
  const shown = Math.min(n, LINES.length);

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_60%_40%,var(--acc-1),transparent_70%)]" />
      <div className="card float-soft overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-gr-4" />
          <span className="size-2.5 rounded-full bg-gr-4" />
          <span className="size-2.5 rounded-full bg-gr-4" />
          <span className="ml-3 font-mono text-[12px] text-muted-foreground">runs.log</span>
        </div>
        <ol className="min-h-[296px] space-y-2 bg-gr-10 px-4 py-4 font-mono text-[12.5px] leading-relaxed text-gr-3" aria-label="Example pipeline log">
          {LINES.slice(0, shown).map((l, i) => (
            <li key={i} className={cn("motion-rise flex gap-3", i === shown - 1 && shown < LINES.length && "caret")}>
              <span className="w-16 shrink-0 text-acc-3">{l.t}</span>
              <span className={cn(l.t === "judge" && "text-[#f4a6a0]", l.t === "ship" && "text-acc-2")}>{l.m}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-center text-[12px] text-muted-foreground">Illustrative log. Real systems, invented numbers.</p>
    </div>
  );
}
