"use client";

import { useEffect, useRef, useState } from "react";
import { TaskGraph, TG_LOOP } from "./TaskGraph";
import { MenuOnboarding, MO_LOOP } from "./MenuOnboarding";
import { useInView, useReducedMotion } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Pesto in one place: the problem first (43 tasks folding into one system),
 * then the AI behind onboarding, slower so each step can be read. One clock
 * runs both; the tabs jump to either part.
 */

const SLOW = 1.4;
const A = TG_LOOP, B = MO_LOOP * SLOW, TOTAL = A + B;
const PARTS = [
  { name: "The problem", from: 0, to: A },
  { name: "The AI behind onboarding", from: A, to: TOTAL },
];

export function PestoStory() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const reduced = useReducedMotion();
  const [t, setT] = useState(A + 13.5 * SLOW);
  const offset = useRef(0);
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

  const seek = (to: number) => { seekTo.current = to; offset.current = to; setT(to); };
  const part = t < A ? 0 : 1;
  const fadeIn = (from: number) => Math.min(1, Math.max(0, (t - from) / 0.4));

  return (
    <div ref={ref}>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Pesto, in two parts">
        {PARTS.map((p, i) => {
          const progress = Math.min(1, Math.max(0, (t - p.from) / (p.to - p.from)));
          return (
            <button key={p.name} role="tab" aria-selected={part === i} onClick={() => seek(p.from)}
              className={cn("relative h-9 overflow-hidden rounded-lg px-3.5 text-[13px] font-semibold transition-colors", part === i ? "bg-acc-1 text-acc-8" : "bg-gr-2 text-gr-7 hover:text-foreground")}>
              <span className="relative z-[1]">{i + 1} · {p.name}</span>
              {part === i && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-acc-6" style={{ transform: `scaleX(${progress})` }} />}
            </button>
          );
        })}
      </div>
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:min-w-0">
        <div className={cn("transition-opacity duration-300", part === 0 ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={part !== 0} style={{ opacity: part === 0 ? fadeIn(0) : 0 }}>
          <TaskGraph time={part === 0 ? t : A - 0.6} />
        </div>
        <div className={cn("transition-opacity duration-300", part === 1 ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={part !== 1} style={{ opacity: part === 1 ? fadeIn(A) : 0 }}>
          <MenuOnboarding time={part === 1 ? (t - A) / SLOW : 0} />
        </div>
      </div>
    </div>
  );
}
