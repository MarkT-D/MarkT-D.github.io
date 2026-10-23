"use client";

import { Building2, Package, LineChart } from "lucide-react";
import { LaptopFrame } from "./LaptopFrame";
import { useInView, useLoop } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The presentation generator: partner data in, a pitch deck out. The partner,
 * products and figures are invented for the picture.
 */
const SOURCES = [
  { icon: Building2, label: "Partner profile", detail: "regions, channels, size" },
  { icon: Package, label: "Product catalogue", detail: "what fits that partner" },
  { icon: LineChart, label: "Market data", detail: "category growth" },
];

export function DeckBuilder() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const step = useLoop(13, 800, inView);
  const filled = (n: number) => step >= n;

  return (
    <div ref={ref} className="grid items-center gap-6 md:grid-cols-[0.8fr_1.2fr]">
      <ul className="space-y-2.5">
        {SOURCES.map(({ icon: Icon, label, detail }, i) => (
          <li key={label} className={cn("flex items-center gap-3 rounded-xl border p-3 transition-all duration-500", filled(i) ? "border-acc-3 bg-acc-1" : "border-border bg-card")}>
            <span className={cn("grid size-9 place-items-center rounded-lg", filled(i) ? "bg-acc-6 text-white" : "bg-gr-2 text-gr-7")}><Icon className="size-4" /></span>
            <div>
              <div className="text-[13.5px] font-semibold">{label}</div>
              <div className="text-[12px] text-muted-foreground">{detail}</div>
            </div>
          </li>
        ))}
        <li className="pl-1 text-[12.5px] text-muted-foreground">4 to 5 hours by hand → generated on demand</li>
      </ul>

      <LaptopFrame>
        <div className="aspect-[16/10] bg-gr-2 p-[4%]">
          <div className="flex h-full flex-col rounded-md bg-card p-[5%] shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-acc-7">Partnership proposal</div>
            <div className={cn("mt-1 font-display text-[clamp(14px,2vw,22px)] font-semibold transition-opacity duration-500", filled(3) ? "opacity-100" : "opacity-15")}>
              Growing plant-based snacks with Nordway Retail
            </div>
            <div className="mt-[4%] grid flex-1 grid-cols-3 gap-[3%]">
              {[["Fit", "Strong in 6 of your 8 regions"], ["Pitch", "Oat bars, lentil crisps"], ["Why now", "Category +11% a year"]].map(([h, b], i) => (
                <div key={h} className={cn("rounded-md border border-border p-[8%] transition-all duration-500", filled(4 + i) ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0")}>
                  <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</div>
                  <div className="mt-1 text-[clamp(10px,1.2vw,13px)] font-medium leading-snug">{b}</div>
                </div>
              ))}
            </div>
            <div className="mt-[4%] flex h-[14%] items-end gap-[2%]">
              {[30, 42, 38, 55, 61, 72, 80].map((v, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-acc-6 transition-[height] duration-700" style={{ height: filled(7) ? `${v}%` : "6%", transitionDelay: `${i * 60}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </LaptopFrame>
    </div>
  );
}
