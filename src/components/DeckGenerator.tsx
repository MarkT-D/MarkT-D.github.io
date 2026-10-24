"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Building2, Images, Barcode, Sparkles, Leaf, MessageSquare } from "lucide-react";
import { LaptopFrame } from "./LaptopFrame";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The presentation generator, one product slide at a time. The partner's
 * account in Salesforce says what they buy; the model picks the product to
 * pitch; the catalogue supplies its SKU, EAN and price; Bynder supplies the
 * approved shot. The speaker notes under the slide say why each choice was
 * made, with the ids to check it by. Partner, products, ids and numbers are
 * all invented for the picture.
 */

const SOURCES = [
  { key: "dam", icon: Images, name: "Bynder", detail: "Approved shots" },
  { key: "pim", icon: Barcode, name: "Product catalogue", detail: "SKUs and prices" },
  { key: "crm", icon: Building2, name: "Salesforce", detail: "Partner orders" },
] as const;

const LOOP = 15;
const STILL = 11;
// Salesforce first (what the partner buys), then the product, then its picture.
const WIRE = [
  { start: 4.4, end: 5.4 },
  { start: 3.0, end: 4.0 },
  { start: 0.6, end: 1.6 },
];
const TITLE_AT = { start: 1.8, end: 3.0 };
const NOTE_AT = (k: number) => ({ start: 5.8 + k * 1.7, end: 5.8 + k * 1.7 + 1.4 });

const W = 960, H = 690;
const TITLE = "Berry Oat Bar, for your better-for-you shelf";

const NOTES = [
  { tag: "Product", text: "Berry Oat Bar: Nordway sold €412k of oat bars last year, up 9%, and lists none of ours. Opportunity 0065g00000QK7Lm." },
  { tag: "Image", text: "BYN-48213, the shelf shot with the Dutch pack: approved for retail. The studio shot is tagged trade-fair only." },
  { tag: "Numbers", text: "214 of 260 stores: Nordway's planograms in Salesforce, matched to the DCs that already ship SKU GH-OB-640." },
];

/** Scales the fixed-size screen to the width it is given. */
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

type Wire = { d: string };
const clamp = (v: number) => Math.min(1, Math.max(0, v));

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

  // From the foot of each source down into the top of the column it fills.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !mounted) return;
    const measure = () => {
      const o = wrap.getBoundingClientRect();
      setBox({ w: o.width, h: o.height });
      setWires(SOURCES.map((_, i) => {
        const s = srcRefs.current[i]?.getBoundingClientRect();
        const d = dstRefs.current[i]?.getBoundingClientRect();
        if (!s || !d) return { d: "" };
        const x1 = s.left + s.width / 2 - o.left, y1 = s.bottom - o.top;
        const x2 = d.left + d.width / 2 - o.left, y2 = d.top - o.top + 4;
        const mid = (y2 - y1) * 0.5;
        return { d: `M ${x1} ${y1} C ${x1} ${y1 + mid}, ${x2} ${y2 - mid}, ${x2} ${y2}` };
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [mounted, scale]);

  const fade = t > LOOP - 0.6 ? (LOOP - t) / 0.6 : 1;
  const arrived = (i: number) => t >= WIRE[i].end;
  const flowing = (i: number) => t >= WIRE[i].start && t < WIRE[i].end;
  const progress = (i: number) => clamp((t - WIRE[i].start) / (WIRE[i].end - WIRE[i].start));
  // A wire shows while its data travels, then lets go so it never sits over the slide.
  const wireOpacity = (i: number) => clamp((t - WIRE[i].start + 0.5) / 0.4) * clamp((WIRE[i].end + 0.7 - t) / 0.5);

  return (
    <div ref={ref}>
      <div ref={wrapRef} className="dg relative">
        <ul className="relative z-[1] mx-auto mb-6 grid max-w-[720px] grid-cols-3 gap-2 sm:gap-3">
          {SOURCES.map(({ key, icon: Icon, name, detail }, i) => (
            <li
              key={key}
              ref={(el) => { srcRefs.current[i] = el; }}
              className={cn("flex flex-col items-center gap-1.5 rounded-xl border bg-card p-2 text-center transition-colors duration-300 sm:flex-row sm:gap-2.5 sm:p-2.5 sm:text-left", (flowing(i) || arrived(i)) ? "border-acc-3" : "border-border")}
            >
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300 sm:size-9", (flowing(i) || arrived(i)) ? "bg-acc-6 text-primary-foreground" : "bg-gr-2 text-gr-7")}><Icon className="size-[18px]" /></span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold sm:text-[14px]">{name}</div>
                <div className="hidden truncate text-[12px] leading-snug text-muted-foreground sm:block">{detail}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mx-auto max-w-[640px]">
          <LaptopFrame>
            <div ref={fitRef} className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
              <div className="dg-screen absolute left-0 top-0" style={{ width: W, height: H, transform: `scale(${scale})` } as CSSProperties}>
                {mounted && <Screen t={t} fade={fade} arrived={arrived} dstRefs={dstRefs} />}
              </div>
            </div>
          </LaptopFrame>
        </div>
        <p className="mt-2 text-center text-[11.5px] text-muted-foreground">Partner, products and ids invented for this picture.</p>

        {mounted && box.w > 0 && (
          <svg className="pointer-events-none absolute inset-0 z-[2] overflow-visible" width={box.w} height={box.h} aria-hidden>
            {wires.map((w, i) => w.d && (
              <g key={i} className="dg-wire on" opacity={wireOpacity(i) * fade}>
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

function Screen({ t, fade, arrived, dstRefs }: {
  t: number; fade: number; arrived: (i: number) => boolean;
  dstRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const typed = Math.round(TITLE.length * clamp((t - TITLE_AT.start) / (TITLE_AT.end - TITLE_AT.start)));
  const writing = t >= TITLE_AT.start;
  return <div className="dg-frame" style={{ opacity: fade }}>
    <div className="dg-slide">
      <div className="dg-top">
        <span className="dg-eyebrow">Proposal{arrived(2) && <> · <b>Nordway Retail</b></>}</span>
        <span className="dg-brand"><Leaf /> Green Harvest Foods</span>
      </div>
      <h2 className={cn("dg-title", !writing && "empty")}>
        {writing ? <>{TITLE.slice(0, typed)}{typed < TITLE.length && <i className="dg-caret" />}</> : <><span /></>}
      </h2>
      <div className="dg-grid">
        {/* Bynder: the picture, and why this one */}
        <div ref={(el) => { dstRefs.current[0] = el; }} className={cn("dg-card pic", arrived(0) && "in")}>
          <div className="dg-shot">
            <ProductShot />
            <span className="dg-asset">Bynder · BYN-48213</span>
          </div>
          <div className="dg-comment"><MessageSquare /><span><b>Usage:</b> retail approved · NL pack · shelf context</span></div>
        </div>

        {/* The catalogue: what exactly is being pitched */}
        <div ref={(el) => { dstRefs.current[1] = el; }} className={cn("dg-card", arrived(1) && "in")}>
          <span className="dg-label">Recommended product</span>
          <h3>Berry Oat Bar</h3>
          <p className="dg-sub">Multipack, 6 × 40 g</p>
          <dl className="dg-ids">
            <div><dt>SKU</dt><dd>GH-OB-640</dd></div>
            <div><dt>EAN</dt><dd>8714221006403</dd></div>
            <div><dt>List price</dt><dd>€3.10</dd></div>
            <div><dt>RRP</dt><dd>€4.49</dd></div>
            <div><dt>Case</dt><dd>12 × 6 packs</dd></div>
            <div><dt>Shelf life</dt><dd>9 months</dd></div>
          </dl>
        </div>

        {/* Salesforce: why this partner, why now */}
        <div ref={(el) => { dstRefs.current[2] = el; }} className={cn("dg-card", arrived(2) && "in")}>
          <span className="dg-label">Why Nordway</span>
          <div className="dg-fact"><strong>€412k</strong><span>oat-bar sales in your stores, last 12 months, up 9%</span></div>
          <div className="dg-fact"><strong>214 of 260</strong><span>stores with a better-for-you shelf</span></div>
          <div className="dg-fact"><strong>3 of 41</strong><span>of our snack SKUs you list today, and no bars</span></div>
          <span className="dg-acct">Account 0015g00000NWR42</span>
        </div>
      </div>
      <div className="dg-foot"><span>Generated from partner data · checked before sending</span><span>4 / 9</span></div>
    </div>

    <div className="dg-notes">
      <div className="dg-notes-head">
        <span>Speaker notes</span>
        {t >= NOTE_AT(0).start && <span className="dg-ai"><Sparkles /> Why the model chose each part</span>}
      </div>
      {NOTES.map((n, k) => {
        const at = NOTE_AT(k);
        if (t < at.start) return <div key={n.tag} className="dg-note empty"><i /></div>;
        const shown = Math.round(n.text.length * clamp((t - at.start) / (at.end - at.start)));
        return <div key={n.tag} className="dg-note">
          <b>{n.tag}</b>
          <span>{n.text.slice(0, shown)}{shown < n.text.length && <i className="dg-caret" />}</span>
        </div>;
      })}
    </div>
  </div>;
}

/** A shelf, and on it the pack the slide is about. Drawn, not photographed. */
function ProductShot() {
  return <svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMid slice" className="dg-svg" aria-hidden>
    <rect width="280" height="200" fill="#e7ede8" />
    <rect y="128" width="280" height="10" fill="#c9d3cb" />
    <rect y="138" width="280" height="62" fill="#dfe6e0" />
    {/* the rest of the shelf, out of focus */}
    {[[14, "#b9c7bc"], [58, "#cdb89a"], [196, "#b7c2d6"], [238, "#c9b2b2"]].map(([x, c]) => (
      <rect key={x as number} x={x as number} y="62" width="36" height="66" rx="5" fill={c as string} opacity="0.75" />
    ))}
    {/* the pack */}
    <g transform="translate(140 98) rotate(-6)">
      <rect x="-62" y="-46" width="124" height="86" rx="10" fill="#2f8a52" />
      <path d="M -62 -26 L -70 -22 L -70 22 L -62 26 Z M 62 -26 L 70 -22 L 70 22 L 62 26 Z" fill="#256e41" />
      <rect x="-52" y="-36" width="104" height="22" rx="5" fill="#fff" opacity="0.95" />
      <text x="0" y="-21" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1f5a36" letterSpacing="0.06em">BERRY OAT</text>
      <text x="-50" y="30" fontSize="9" fontWeight="700" fill="#e3f1e7">6 × 40 g</text>
      <circle cx="18" cy="8" r="9" fill="#b3263a" /><circle cx="32" cy="2" r="8" fill="#7a2a6a" /><circle cx="28" cy="18" r="7.5" fill="#c23a4e" />
      {[[-30, 4], [-18, 12], [-36, 18], [-8, 2]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="7" ry="3.6" fill="#e9d6a6" transform={`rotate(-30 ${x} ${y})`} />)}
    </g>
    <text x="232" y="160" fontSize="10" fontWeight="700" fill="#4b5a50">€4.49</text>
  </svg>;
}
