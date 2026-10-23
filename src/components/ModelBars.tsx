"use client";

import { useInView } from "@/lib/use-in-view";

const MODELS = [
  { name: "BERT (fine-tuned)", f1: 0.89 },
  { name: "SVM · TF-IDF", f1: 0.86 },
  { name: "Random Forest", f1: 0.77 },
];

export function ModelBars() {
  const [ref, inView] = useInView<HTMLDivElement>(undefined, true);
  return (
    <div ref={ref} className="space-y-3">
      {MODELS.map((m, i) => (
        <div key={m.name}>
          <div className="mb-1 flex justify-between text-[13px]"><span className="font-medium">{m.name}</span><span className="tabular-nums text-muted-foreground">F1 {m.f1.toFixed(2)}</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gr-2">
            <div className="h-full rounded-full bg-acc-6 transition-[width] duration-1000 ease-out" style={{ width: inView ? `${m.f1 * 100}%` : "0%", transitionDelay: `${i * 120}ms` }} />
          </div>
        </div>
      ))}
      <p className="text-[12px] text-muted-foreground">Held-out test sets of 40 to 55 videos. Research-stage numbers.</p>
    </div>
  );
}
