"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Building2, Images, LineChart, Sparkles, Leaf, Wheat, Cookie } from "lucide-react";
import { LaptopFrame } from "./LaptopFrame";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The presentation generator: three sources outside the laptop wire into a
 * real slide inside it (laid out like Pesto's own deck), each filling the part
 * of the slide it feeds, then the model writes the pitch. The partner, the
 * products and every number are invented for the picture.
 */

const SOURCES = [
  { key: "crm", icon: Building2, name: "Salesforce", detail: "Partner account: regions, channels, volumes" },
  { key: "dam", icon: Images, name: "Bynder", detail: "Product shots and brand assets" },
  { key: "mkt", icon: LineChart, name: "Market data", detail: "Category growth by region" },
] as const;

const LOOP = 11;
const STILL = 9;
const WIRE = (i: number) => ({ start: 0.7 + i * 1.5, end: 0.7 + i * 1.5 + 1.1 });
const WRITE = { start: 5.4, end: 6.8 };

const W = 960, H = 600;
const TITLE = "Plant-based snacks for your eight regions";

/** Scales the fixed-size slide to the width it is given. */
function useFit(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / width));
    ro.observe(node);
    return () => ro.disconnect();
  }, [width]);
  return [ref, scale] as const;
}

type Wire = { d: string; len: number };

export function DeckGenerator() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, STILL);
  const [fitRef, scale] = useFit(W);
  const wrapRef = useRef<HTMLDivElement>(null);
  const srcRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dstRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Measure where each source and its slide card are, and draw a curve between them.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !mounted) return;
    const measure = () => {
      const o = wrap.getBoundingClientRect();
      setBox({ w: o.width, h: o.height });
      setWires(SOURCES.map((_, i) => {
        const s = srcRefs.current[i]?.getBoundingClientRect();
        const d = dstRefs.current[i]?.getBoundingClientRect();
        if (!s || !d) return { d: "", len: 0 };
        const x1 = s.left + s.width / 2 - o.left, y1 = s.top - o.top;
        const x2 = d.left + d.width / 2 - o.left, y2 = d.bottom - o.top - 6;
        const path = `M ${x1} ${y1} C ${x1} ${y1 - (y1 - y2) * 0.5}, ${x2} ${y2 + (y1 - y2) * 0.5}, ${x2} ${y2}`;
        return { d: path, len: Math.hypot(x2 - x1, y2 - y1) * 1.25 };
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [mounted, scale]);

  const fade = t > LOOP - 0.6 ? (LOOP - t) / 0.6 : 1;
  const arrived = (i: number) => t >= WIRE(i).end;
  const flowing = (i: number) => t >= WIRE(i).start && t < WIRE(i).end;
  const progress = (i: number) => Math.min(1, Math.max(0, (t - WIRE(i).start) / (WIRE(i).end - WIRE(i).start)));
  const writing = t >= WRITE.start;
  const typed = Math.round(TITLE.length * Math.min(1, Math.max(0, (t - WRITE.start) / (WRITE.end - WRITE.start))));

  return (
    <div ref={ref}>
      <div ref={wrapRef} className="dg relative">
        <div className="mx-auto max-w-[860px]">
          <LaptopFrame>
            <div ref={fitRef} className="relative aspect-[16/10] w-full overflow-hidden">
              <div className="dg-slide absolute left-0 top-0" style={{ width: W, height: H, transform: `scale(${scale})` } as CSSProperties}>
                {mounted && <SlideBody t={t} fade={fade} arrived={arrived} writing={writing} typed={typed} dstRefs={dstRefs} />}
              </div>
            </div>
          </LaptopFrame>
        </div>

        <ul className="relative z-[1] mx-auto mt-12 grid max-w-[860px] grid-cols-3 gap-2 sm:gap-4">
          {SOURCES.map(({ key, icon: Icon, name, detail }, i) => (
            <li
              key={key}
              ref={(el) => { srcRefs.current[i] = el; }}
              className={cn("flex flex-col items-center gap-1.5 rounded-xl border bg-card p-2.5 text-center transition-colors duration-300 sm:flex-row sm:gap-3 sm:p-3 sm:text-left", (flowing(i) || arrived(i)) ? "border-acc-3" : "border-border")}
            >
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg transition-colors duration-300 sm:size-10", (flowing(i) || arrived(i)) ? "bg-acc-6 text-primary-foreground" : "bg-gr-2 text-gr-7")}><Icon className="size-[18px]" /></span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold sm:text-[14px]">{name}</div>
                <div className="hidden text-[12px] leading-snug text-muted-foreground sm:block">{detail}</div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-[12.5px] text-muted-foreground">4 to 5 hours by hand, now generated on demand. Partner, products and figures invented for this picture.</p>

        {/* The wires, over everything, from each source into its card on the slide. */}
        {mounted && box.w > 0 && (
          <svg className="pointer-events-none absolute inset-0 z-[2] overflow-visible" width={box.w} height={box.h} aria-hidden>
            {wires.map((w, i) => w.d && (
              <g key={i} className={cn("dg-wire", (flowing(i) || arrived(i)) && "on")} opacity={fade}>
                <path d={w.d} className="base" />
                <FlowPath d={w.d} p={progress(i)} moving={flowing(i)} />
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

/** The lit part of a wire, and the packet at its head. */
function FlowPath({ d, p, moving }: { d: string; p: number; moving: boolean }) {
  const ref = useRef<SVGPathElement>(null);
  const [head, setHead] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const path = ref.current;
    if (!path || !moving) { setHead(null); return; }
    const pt = path.getPointAtLength(path.getTotalLength() * p);
    setHead({ x: pt.x, y: pt.y });
  }, [d, p, moving]);
  return <>
    <path ref={ref} d={d} className="flow" pathLength={1} strokeDasharray={`${p} 1`} />
    {head && <circle cx={head.x} cy={head.y} r={4.5} className="dot" />}
  </>;
}

function SlideBody({ fade, arrived, writing, typed, dstRefs }: {
  t: number; fade: number; arrived: (i: number) => boolean; writing: boolean; typed: number;
  dstRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  return <div className="dg-inner" style={{ opacity: fade }}>
    <div className="dg-top">
      <span className="dg-eyebrow">Partnership proposal{arrived(0) && <> · <b>Nordway Retail</b></>}</span>
      <span className="dg-brand"><Leaf /> Green Harvest Foods</span>
    </div>
    <h2 className={cn("dg-title", !writing && "empty")}>
      {writing ? <>{TITLE.slice(0, typed)}{typed < TITLE.length && <i className="dg-caret" />}</> : <><span /><span /></>}
    </h2>
    {writing && <span className="dg-ai"><Sparkles /> Products and talking points picked by the model</span>}

    <div className="dg-grid">
      <div ref={(el) => { dstRefs.current[0] = el; }} className={cn("dg-card", arrived(0) && "in")}>
        <div className="dg-pic regions">
          {["N", "NE", "E", "C", "S", "SW", "W", "NW"].map((r, k) => <b key={r} className={k < 6 ? "on" : ""} style={{ "--k": k } as CSSProperties}>{r}</b>)}
        </div>
        <div className="dg-metric"><strong>6 of 8</strong><span>regions where you already sell our category</span></div>
        <h3>Strong regional fit</h3>
        <p>Your discounters carry plant-based lines in six regions. We start there.</p>
      </div>
      <div ref={(el) => { dstRefs.current[1] = el; }} className={cn("dg-card", arrived(1) && "in")}>
        <div className="dg-pic packs">
          {[{ c: "#2f8a52", i: Wheat, n: "Oat bar" }, { c: "#c27a1a", i: Cookie, n: "Lentil crisps" }, { c: "#5b6b3a", i: Leaf, n: "Hummus" }].map(({ c, i: I, n }, k) => (
            <span key={n} className="pack" style={{ "--c": c, "--k": k } as CSSProperties}><I /><small>{n}</small></span>
          ))}
        </div>
        <div className="dg-metric"><strong>3</strong><span>products to pitch first</span></div>
        <h3>Oat bars, lentil crisps, hummus</h3>
        <p>Best sellers with retailers your size, with shelf-ready shots.</p>
      </div>
      <div ref={(el) => { dstRefs.current[2] = el; }} className={cn("dg-card", arrived(2) && "in")}>
        <div className="dg-pic chart">
          <svg viewBox="0 0 120 56"><path pathLength={100} d="M4 48 L20 40 L34 44 L50 30 L66 34 L82 20 L98 24 L114 10" /><circle cx="114" cy="10" r="4" /></svg>
        </div>
        <div className="dg-metric"><strong>+11%</strong><span>category growth a year</span></div>
        <h3>Why now</h3>
        <p>Plant-based snacking is the fastest-growing shelf in your stores.</p>
      </div>
    </div>
    <div className="dg-foot"><span>Generated from partner data · reviewed before sending</span><span>3 / 12</span></div>
  </div>;
}
