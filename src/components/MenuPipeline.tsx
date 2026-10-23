"use client";

import { useEffect, useState } from "react";
import { PAPER_MENU_SRC } from "@/lib/paper-menu";
import { PhoneFrame } from "./PhoneFrame";
import { useInView, useLoop } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/** Photo of a printed menu → OCR text → structured JSON → a translated menu. */
const JSON_LINES = [
  `{`,
  `  "section": "Antipasti",`,
  `  "name": "Fiori di zucca fritti",`,
  `  "description": "ripieni di ricotta e acciuga",`,
  `  "price_cents": 900,`,
  `  "allergens": ["gluten", "milk", "fish"]`,
  `}`,
];

const LANGS = {
  EN: { section: "Starters", name: "Fried courgette flowers", desc: "Filled with ricotta and anchovy", second: "Beef carpaccio", desc2: "Rocket, Grana shavings, lemon" },
  IT: { section: "Antipasti", name: "Fiori di zucca fritti", desc: "Ripieni di ricotta e acciuga", second: "Carpaccio di manzo", desc2: "Rucola, scaglie di grana, limone" },
  ES: { section: "Entrantes", name: "Flores de calabacín fritas", desc: "Rellenas de ricota y anchoa", second: "Carpaccio de ternera", desc2: "Rúcula, lascas de Grana, limón" },
  DE: { section: "Vorspeisen", name: "Frittierte Zucchiniblüten", desc: "Mit Ricotta und Sardelle gefüllt", second: "Rindercarpaccio", desc2: "Rucola, Grana-Späne, Zitrone" },
} as const;
type Lang = keyof typeof LANGS;
const ORDER: Lang[] = ["EN", "IT", "ES", "DE"];

export function MenuPipeline() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const tick = useLoop(16, 650, inView);
  const lines = Math.min(JSON_LINES.length, Math.max(0, tick - 2));
  const [picked, setPicked] = useState<Lang | null>(null);
  const autoLang = ORDER[Math.floor(tick / 4) % ORDER.length];
  const lang = picked ?? autoLang;
  const t = LANGS[lang];

  // Letting the reader choose stops the auto-rotation for a while.
  useEffect(() => {
    if (!picked) return;
    const id = setTimeout(() => setPicked(null), 9000);
    return () => clearTimeout(id);
  }, [picked]);

  return (
    <div ref={ref} className="grid items-center gap-5 md:grid-cols-[1fr_1.15fr_auto] [&>*]:min-w-0">
      {/* 1. the photo */}
      <figure className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-xl border border-border shadow-[0_20px_40px_-24px_rgba(0,0,0,0.4)] md:-rotate-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PAPER_MENU_SRC} alt="A printed Italian menu" className="block w-full" />
        <span aria-hidden className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-acc-4/25 to-acc-5/40 [animation:scan-line_2.6s_ease-in-out_infinite] motion-reduce:hidden" />
        <figcaption className="absolute bottom-2 left-2 chip">1 · Photo</figcaption>
      </figure>

      {/* 2. the structure */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[12px] font-semibold text-muted-foreground">
          <span>2 · Vision OCR → Claude, structured output</span>
          <span className="chip h-6">schema ✓</span>
        </div>
        <pre className="min-h-[178px] overflow-x-auto bg-gr-10 px-4 py-3 font-mono text-[12px] leading-[1.6] text-gr-2">
          {JSON_LINES.slice(0, lines).map((l, i) => (
            <div key={i} className={cn(i === lines - 1 && lines < JSON_LINES.length && "caret")}>
              {l.split(/("[^"]*")/).map((part, j, all) =>
                part.startsWith('"') ? (
                  <span key={j} className={all[j + 1]?.startsWith(":") ? "text-acc-3" : "text-[#e9c46a]"}>{part}</span>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )}
            </div>
          ))}
        </pre>
        <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2.5 text-[11.5px] text-muted-foreground">
          <span className="chip h-6">fixtures: expected JSON per photo</span>
          <span className="chip h-6">OCR and LLM stage tested apart</span>
        </div>
      </div>

      {/* 3. the menu */}
      <div className="mx-auto">
        <PhoneFrame width={230} screenClassName="bg-card">
          <div className="px-4 pb-6 pt-2">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-[17px] font-semibold">Osteria del Ponte</span>
            </div>
            <div className="mb-3 flex gap-1" role="tablist" aria-label="Menu language">
              {ORDER.map((l) => (
                <button
                  key={l}
                  role="tab"
                  aria-selected={l === lang}
                  onClick={() => setPicked(l)}
                  className={cn("h-7 flex-1 rounded-md text-[11px] font-semibold transition-colors", l === lang ? "bg-acc-6 text-white" : "bg-gr-2 text-gr-8 hover:bg-gr-3")}
                >
                  {l}
                </button>
              ))}
            </div>
            <div key={lang} className="motion-rise">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-acc-7">{t.section}</div>
              {[[t.name, t.desc, "9,00"], [t.second, t.desc2, "13,50"]].map(([n, d, p]) => (
                <div key={n} className="mb-2.5 rounded-lg border border-border p-2.5">
                  <div className="flex justify-between gap-2 text-[12.5px] font-semibold"><span>{n}</span><span className="tabular-nums">€{p}</span></div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </PhoneFrame>
        <p className="mt-2 text-center text-[12px] text-muted-foreground">3 · Any language, up to 10 at once</p>
      </div>
    </div>
  );
}
