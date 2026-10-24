"use client";

import type { ReactNode } from "react";
import { Camera, Check, GripVertical, Hand, QrCode, RefreshCw, ScanText, Sparkles, Languages, Braces } from "lucide-react";
import { PhoneFrame } from "./PhoneFrame";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Pesto's menu intake as two lanes on one clock. On the phone, the owner
 * photographs three pages, gets on with onboarding, then checks the dishes and
 * edits one. Behind it, Vision reads the pages while onboarding runs, Claude
 * turns the text into a structured menu, and translations fill in while the
 * owner edits, an edited dish being translated again. The menu is invented.
 */

export const MO_LOOP = 20.5;
const LOOP = MO_LOOP;
const STILL = 14.6;

type Seg = { key: string; from: number; to: number; label: string };
const OWNER: Seg[] = [
  { key: "shoot", from: 0, to: 3.2, label: "Photographs the menu" },
  { key: "onboard", from: 3.2, to: 9.6, label: "Onboarding: name, hours, tables, payments" },
  { key: "edit", from: 9.6, to: 16.8, label: "Checks the dishes: reorders, renames, picks a style" },
  { key: "live", from: 16.8, to: 19.8, label: "Publishes" },
];
const AI: Seg[] = [
  { key: "upload", from: 0, to: 3.2, label: "Upload" },
  { key: "ocr", from: 3.2, to: 6.3, label: "Vision OCR" },
  { key: "parse", from: 6.3, to: 9.6, label: "Claude parse" },
  { key: "translate", from: 9.6, to: 16.8, label: "Translations, while you edit" },
];
const at = (segs: Seg[], t: number) => segs.find((s) => t >= s.from && t < s.to)?.key ?? null;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

const PAGES = [
  { head: "Antipasti", dishes: [["Fiori di zucca fritti", "9"], ["Carpaccio", "13,5"], ["Burrata e pomodorini", "11"], ["Vitello tonnato", "12"]] },
  { head: "Primi", dishes: [["Tagliatelle al ragù", "14"], ["Cacio e pepe", "12"], ["Risotto ai funghi", "15"], ["Gnocchi al pesto", "13"]] },
  { head: "Dolci", dishes: [["Tiramisù", "7"], ["Panna cotta", "6,5"], ["Cannoli siciliani", "6"], ["Affogato", "5"]] },
];
const LANGS = ["EN", "IT", "ES", "DE", "FR", "RU"];
const EDIT = { start: 12.5, end: 13.6 };
const DRAG = { start: 10.7, end: 11.9 };
const STYLES = [{ name: "Classic", at: 0 }, { name: "Bistro", at: 14.3 }, { name: "Night", at: 15.3 }];
const EDIT_FROM = "Carpaccio", EDIT_TO = "Carpaccio di manzo";

/** When dish d's translation into language l lands. The edited dish goes again after the edit. */
function cellAt(d: number, l: number, t: number): "empty" | "done" | "redo" {
  const first = 9.9 + d * 0.55 + l * 0.22;
  if (d === 1 && t >= EDIT.end) {
    const again = EDIT.end + 0.4 + l * 0.18;
    return t >= again ? "done" : "redo";
  }
  return t >= first ? "done" : "empty";
}

export function MenuOnboarding({ time }: { time?: number } = {}) {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const own = useSceneClock(LOOP, inView && time === undefined, STILL);
  const t = time ?? own;
  const owner = at(OWNER, t) ?? "live";
  const ai = at(AI, t);
  const fade = t > LOOP - 0.5 ? (LOOP - t) / 0.5 : 1;

  return (
    <div ref={ref} className="mo">
      {mounted ? (
        <div className="mo-top" style={{ opacity: fade }}>
          <div className="mo-col">
            <div className="mo-cap"><span className="mo-dot" /> What the owner sees</div>
            <PhoneFrame width={244} screenClassName="bg-card">
              <div className="mo-phone">
                <Crossfade t={t} segs={OWNER} render={(tt) => <OwnerScreen step={at(OWNER, tt) ?? "live"} t={tt} />} />
              </div>
            </PhoneFrame>
          </div>
          <div className="mo-col grow">
            <div className="mo-cap"><Sparkles className="size-3.5" /> What runs behind it</div>
            <div className="mo-behind">
              <Crossfade t={t} segs={AI} render={(tt) => { const a = at(AI, tt); return <BehindScreen key={a ?? (tt < 3.2 ? "upload" : "done")} step={a} t={tt} />; }} />
            </div>
          </div>
        </div>
      ) : <div className="mo-top" style={{ minHeight: 520 }} />}

    </div>
  );
}

/**
 * One stage handing over to the next: the old screen, frozen where it ended,
 * lifts away, then the new one settles in, so a change of step reads as a
 * change and not a cut.
 */
const XF = 0.9;
function Crossfade({ t, segs, render }: { t: number; segs: Seg[]; render: (t: number) => React.ReactNode }) {
  const b = segs.map((s) => s.from).concat(segs.map((s) => s.to)).filter((x) => x > 0 && x <= t && t - x < XF).sort((x, y) => y - x)[0];
  if (b === undefined) return <div className="mo-xf"><div key="now">{render(t)}</div></div>;
  // Out, then in: the two screens never show at once, which read as a double exposure.
  const p = (t - b) / XF;
  const out = Math.min(1, p * 2), inn = Math.max(0, p * 2 - 1);
  return <div className="mo-xf">
    <div key={`was${b}`} style={{ opacity: 1 - out * out, transform: `translateY(${(-6 * out).toFixed(1)}px)` }} aria-hidden>{render(b - 0.001)}</div>
    <div key="now" style={{ opacity: inn * (2 - inn), transform: `translateY(${(6 * (1 - inn)).toFixed(1)}px)` }}>{render(t)}</div>
  </div>;
}

// ───────────────────────────── the phone ─────────────────────────────

function OwnerScreen({ step, t }: { step: string; t: number }) {
  if (step === "shoot") {
    const shots = [0.7, 1.7, 2.6].filter((s) => t >= s).length;
    const flash = [0.7, 1.7, 2.6].some((s) => t >= s && t < s + 0.18);
    return <div className="mo-cam">
      <div className="mo-view">
        <MiniPage page={PAGES[Math.min(2, shots)]} />
        <span className="mo-corners" />
        {flash && <span className="mo-flash" />}
      </div>
      <div className="mo-cam-foot">
        <div className="mo-thumbs">{[0, 1, 2].map((i) => <span key={i} className={cn(i < shots && "on")} />)}</div>
        <span className="mo-shutter"><Camera className="size-4" /></span>
        <span className="mo-count">{shots}/3</span>
      </div>
    </div>;
  }

  if (step === "onboard") {
    const parsing = t < 9.4;
    const page = Math.min(3, 1 + Math.floor(prog(t, 3.2, 6.3) * 3));
    const sub = t < 4.8 ? 0 : t < 6.4 ? 1 : t < 8.0 ? 2 : 3;
    return <div className="mo-wiz">
      <div className={cn("mo-banner", !parsing && "ok")}>
        {parsing ? <><RefreshCw className="size-3.5 mo-spin" /> {t < 6.3 ? `Reading your menu · page ${page}/3` : "Building your menu…"}</> : <><Check className="size-3.5" /> Menu ready · 34 dishes</>}
      </div>
      <div className="mo-steps">{[0, 1, 2, 3].map((i) => <span key={i} className={cn(i < sub && "done", i === sub && "on")} />)}</div>
      <div key={sub} className="mo-wiz-body">
        {sub === 0 && <><h5>What&apos;s it called?</h5><Field label="Restaurant name" value={typed("Osteria del Ponte", t, 3.4, 4.4)} /></>}
        {sub === 1 && <><h5>Opening hours</h5>{["Mon–Thu", "Fri–Sat", "Sunday"].map((d, i) => <div key={d} className="mo-hours"><span>{d}</span><b style={{ opacity: t > 5.0 + i * 0.3 ? 1 : 0.15 }}>{i === 2 ? "12:00–15:00" : "12:00–23:00"}</b></div>)}</>}
        {sub === 2 && <><h5>How many tables?</h5><div className="mo-stepper"><span>−</span><b>{Math.min(12, 4 + Math.floor(prog(t, 6.6, 7.6) * 8))}</b><span>+</span></div><div className="mo-tables">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ opacity: i < 4 + Math.floor(prog(t, 6.6, 7.6) * 8) ? 1 : 0.15 }} />)}</div></>}
        {sub === 3 && <><h5>Card payments</h5><div className="mo-toggle"><span>Take cards at the table</span><i className={cn(t > 8.5 && "on")} /></div><p className="mo-hint">Connect Stripe later, the menu works either way.</p></>}
      </div>
      <div className="mo-next">Next</div>
    </div>;
  }

  if (step === "edit") {
    // Burrata is dragged from third to first; the rest close up behind it.
    const order = t < (DRAG.start + DRAG.end) / 2 ? [0, 1, 2, 3] : [2, 0, 1, 3];
    const ROW = 66;
    const dragging = t >= DRAG.start && t < DRAG.end + 0.2;
    const dragY = ROW * 2 * (1 - prog(t, DRAG.start + 0.25, DRAG.end - 0.15));
    const style = [...STYLES].reverse().find((st) => t >= st.at)!.name;
    const pressing = STYLES.find((st) => st.at > 0 && t >= st.at - 0.35 && t < st.at + 0.1);
    return <div className={cn("mo-ed", `style-${style.toLowerCase()}`)}>
      <div className="mo-styles">{STYLES.map((st) => <span key={st.name} className={cn(st.name === style && "on", pressing?.name === st.name && "press")}>{st.name}</span>)}</div>
      <div className="mo-ed-head"><b>Antipasti</b><span>drag to reorder</span></div>
      <div className="mo-rows" style={{ height: ROW * 4 }}>
        {PAGES[0].dishes.map(([name, price], d) => {
          const editing = d === 1 && t >= EDIT.start && t < EDIT.end + 0.3;
          const shown = d === 1 ? (t < EDIT.start ? EDIT_FROM : t < EDIT.end ? EDIT_FROM + EDIT_TO.slice(EDIT_FROM.length, EDIT_FROM.length + Math.round((EDIT_TO.length - EDIT_FROM.length) * prog(t, EDIT.start + 0.2, EDIT.end))) : EDIT_TO) : name;
          const lifted = d === 2 && dragging;
          const y = lifted ? dragY : order.indexOf(d) * ROW;
          return <div key={name} className={cn("mo-dish", editing && "editing", lifted && "lifted")} style={{ transform: `translateY(${y.toFixed(1)}px)` }}>
            <Dish kind={d} />
            <div className="mo-dish-text">
              <div className="mo-dish-top"><span>{shown}{editing && t < EDIT.end && <i className="mo-caret" />}</span><b>€{price}</b></div>
              <div className="mo-langs">{LANGS.map((l, li) => { const c = cellAt(d, li, t); return <span key={l} className={c}>{l}</span>; })}</div>
            </div>
            <GripVertical className="mo-grip" />
            {lifted && <Hand className="mo-hand" />}
          </div>;
        })}
      </div>
      <div className="mo-ed-foot">Preview as a guest →</div>
    </div>;
  }

  return <div className="mo-live">
    <QrCode className="mo-qr" strokeWidth={1.4} />
    <b>Osteria del Ponte is live</b>
    <span>34 dishes · 6 languages</span>
    <div className="mo-langs big">{LANGS.map((l) => <span key={l} className="done">{l}</span>)}</div>
  </div>;
}

/** A dish photo, drawn: a plate seen from above with what is on it. */
function Dish({ kind }: { kind: number }) {
  return <svg viewBox="0 0 48 48" className="mo-photo" aria-hidden>
    <rect width="48" height="48" fill={["#e9dccb", "#d9e4dc", "#e4dcd2", "#dfe2e8"][kind]} />
    <circle cx="24" cy="24" r="18" fill="#fbfaf7" />
    <circle cx="24" cy="24" r="13.5" fill="#f1eee8" />
    {kind === 0 && <>{[[-6, -3, -30], [3, -5, 20], [-1, 5, -60]].map(([x, y, a], i) => <ellipse key={i} cx={24 + x} cy={24 + y} rx="8" ry="3.4" fill={i === 1 ? "#f2a33a" : "#e7b54a"} transform={`rotate(${a} ${24 + x} ${24 + y})`} />)}<circle cx="31" cy="30" r="2" fill="#7aa35a" /></>}
    {kind === 1 && <>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={24 + Math.cos((a * Math.PI) / 180) * 6} cy={24 + Math.sin((a * Math.PI) / 180) * 6} rx="6" ry="4.2" fill="#c8424e" opacity="0.9" />)}<circle cx="24" cy="24" r="3.6" fill="#6aa04a" /><circle cx="27" cy="21" r="1.2" fill="#f3e6b0" /></>}
    {kind === 2 && <><circle cx="22" cy="23" r="7.5" fill="#fffdf6" stroke="#e8e1d2" /><circle cx="31" cy="20" r="3" fill="#d8352f" /><circle cx="30" cy="29" r="3" fill="#e2483a" /><circle cx="18" cy="31" r="2.6" fill="#d8352f" /><path d="M14 18 q3 -3 6 0" stroke="#4f8d3a" strokeWidth="1.6" fill="none" /></>}
    {kind === 3 && <>{[-5, 0, 5].map((y) => <ellipse key={y} cx="24" cy={24 + y} rx="10" ry="3.2" fill="#d9a59a" />)}<path d="M15 22 q9 6 18 0" stroke="#efe0b8" strokeWidth="3" fill="none" />{[[19, 20], [28, 27], [24, 23]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.1" fill="#5b7a32" />)}</>}
  </svg>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <label className="mo-field"><span>{label}</span><b>{value}<i className="mo-caret" /></b></label>;
}
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(s.length * prog(t, a, b)));

function MiniPage({ page, boxes }: { page: (typeof PAGES)[number]; boxes?: number }) {
  return <div className="mo-paper">
    <div className={cn("mo-paper-line head", boxes !== undefined && boxes > 0 && "boxed")}>{page.head}</div>
    {page.dishes.map(([n, p], i) => (
      <div key={n} className={cn("mo-paper-line", boxes !== undefined && boxes > i + 1 && "boxed")}><span>{n}</span><span>{p}</span></div>
    ))}
  </div>;
}

// ───────────────────────────── behind it ─────────────────────────────

function BehindScreen({ step, t }: { step: string | null; t: number }) {
  if (step === "upload" || (step === null && t < 3.2)) {
    const n = [0.7, 1.7, 2.6].filter((s) => t >= s + 0.25).length;
    return <Stage icon={<ScanText className="size-4" />} title="Pages arrive as they are shot" note="Stored privately; the scan starts on the first page, not the last.">
      <div className="mo-stack">{PAGES.map((p, i) => <div key={i} className={cn("mo-stack-page", i < n && "in")} style={{ "--i": i } as React.CSSProperties}><MiniPage page={p} /></div>)}</div>
    </Stage>;
  }
  if (step === "ocr") {
    const k = prog(t, 3.2, 6.3) * 3;
    const page = Math.min(2, Math.floor(k));
    const boxes = Math.floor((k - page) * 7);
    return <Stage icon={<ScanText className="size-4" />} title={`Google Vision OCR · page ${page + 1} of 3`} note="Text with its position on the page, so a price stays with its dish.">
      <div className="mo-ocr">
        <MiniPage page={PAGES[page]} boxes={boxes} />
        <div className="mo-ocr-out">
          {[PAGES[page].head, ...PAGES[page].dishes.map(([n, p]) => `${n} …… ${p}`)].slice(0, Math.max(0, boxes)).map((l) => <div key={l}>{l}</div>)}
        </div>
      </div>
    </Stage>;
  }
  if (step === "parse") {
    const lines = JSON_LINES.slice(0, Math.round(JSON_LINES.length * prog(t, 6.5, 8.8)));
    const counts = prog(t, 6.5, 9.2);
    return <Stage icon={<Braces className="size-4" />} title="Claude, structured output to a strict schema" note="Tested against expected JSON for a set of real menu photos.">
      <div className="mo-parse">
        <pre>{lines.map((l, i) => <div key={i}>{l}</div>)}</pre>
        <div className="mo-counts">
          <div><b>{Math.round(6 * counts)}</b><span>sections</span></div>
          <div><b>{Math.round(34 * counts)}</b><span>dishes</span></div>
          <div><b>{Math.round(41 * counts)}</b><span>allergens</span></div>
          <span className={cn("mo-schema", counts >= 1 && "ok")}>{counts >= 1 ? <><Check className="size-3" /> schema valid</> : "validating…"}</span>
        </div>
      </div>
    </Stage>;
  }
  if (step === "translate") {
    return <Stage icon={<Languages className="size-4" />} title="Translations, batched, while the owner edits" note="An edited dish is sent again; the others are untouched.">
      <table className="mo-grid">
        <thead><tr><th />{LANGS.map((l) => <th key={l}>{l}</th>)}</tr></thead>
        <tbody>
          {PAGES[0].dishes.map(([name], d) => (
            <tr key={name} className={cn(d === 1 && t >= EDIT.end && t < EDIT.end + 1.6 && "redo")}>
              <td>{d === 1 && t >= EDIT.end ? EDIT_TO : name}</td>
              {LANGS.map((l, li) => { const c = cellAt(d, li, t); return <td key={l} className={c}>{c === "done" ? <Check className="size-3.5" strokeWidth={3} /> : c === "redo" ? <RefreshCw className="size-3 mo-spin" /> : null}</td>; })}
            </tr>
          ))}
          <tr className="more"><td>+ 30 more dishes</td>{LANGS.map((l, li) => <td key={l}>{t > 10.6 + li * 0.5 ? <Check className="size-3.5" strokeWidth={3} /> : null}</td>)}</tr>
        </tbody>
      </table>
    </Stage>;
  }
  return <Stage icon={<Check className="size-4" />} title="Nothing left to wait for" note="The owner never waited on the AI: it ran behind the screens they were on anyway.">
    <div className="mo-done">
      <div><b>3</b><span>pages read</span></div>
      <div><b>34</b><span>dishes structured</span></div>
      <div><b>6</b><span>languages</span></div>
    </div>
  </Stage>;
}

const JSON_LINES = [
  `{ "section": "Antipasti",`,
  `  "dishes": [{`,
  `    "name": "Fiori di zucca fritti",`,
  `    "price_cents": 900,`,
  `    "description": "ripieni di ricotta e acciuga",`,
  `    "allergens": ["gluten", "milk", "fish"]`,
  `  }, {`,
  `    "name": "Carpaccio",`,
  `    "price_cents": 1350, … }`,
];

function Stage({ icon, title, note, children }: { icon: ReactNode; title: string; note: string; children: ReactNode }) {
  return <div className="mo-stage">
    <div className="mo-stage-head">{icon}<b>{title}</b></div>
    <div className="mo-stage-body">{children}</div>
    <p className="mo-stage-note">{note}</p>
  </div>;
}


