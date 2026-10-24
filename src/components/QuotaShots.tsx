"use client";

import { useEffect, useState } from "react";
import { LaptopFrame } from "./LaptopFrame";
import { useInView } from "@/lib/use-in-view";
import { asset, cn } from "@/lib/utils";

/** The QuotaClimat dashboard's four screens, the same set as on GitHub. Demo data. */
const SHOTS: { key: string; label: string; alt: string; contain?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", alt: "Dashboard: coverage over time, frame distribution, editorial angles and sectors" },
  { key: "article", label: "Article", alt: "One article with the words behind its frame highlighted, and its frame and angle probabilities" },
  { key: "reader", label: "Reader", alt: "The reader: articles filtered by frame, angle, sector and outlet" },
  { key: "discrepancy-desk", label: "Discrepancy desk", alt: "Frame coverage ranked by outlet and by country of origin", contain: true },
];

export function QuotaShots() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  // Turns its own pages until somebody picks one.
  useEffect(() => {
    if (!inView || held) return;
    const id = setInterval(() => setI((n) => (n + 1) % SHOTS.length), 4200);
    return () => clearInterval(id);
  }, [inView, held]);

  return (
    <div ref={ref}>
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Dashboard screens">
        {SHOTS.map((s, n) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={n === i}
            onClick={() => { setI(n); setHeld(true); }}
            className={cn("h-8 rounded-lg px-3 text-[12.5px] font-semibold transition-colors", n === i ? "bg-acc-6 text-primary-foreground" : "bg-gr-2 text-gr-8 hover:bg-gr-3")}
          >
            {s.label}
          </button>
        ))}
      </div>
      <LaptopFrame>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#e9e3d8]">
          {SHOTS.map((s, n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.key}
              src={asset(`/img/quota-${s.key}.webp`)}
              alt={s.alt}
              loading="lazy"
              className={cn("absolute inset-0 block h-full w-full transition-opacity duration-500", s.contain ? "object-contain object-center p-2" : "object-cover object-top", n === i ? "opacity-100" : "opacity-0")}
            />
          ))}
        </div>
      </LaptopFrame>
      <p className="mt-2 text-[12px] text-muted-foreground">Demo data. Outlet names are invented.</p>
    </div>
  );
}
