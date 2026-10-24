"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A Konsole window (KDE Plasma on Arch, Breeze Dark): fastfetch, then an nmap
 * scan whose open ports are me. Commands type themselves, output streams in, the window keeps
 * a fixed height and scrolls like a real terminal, then it clears and loops.
 */

// Breeze terminal colour scheme.
const C = {
  fg: "#fcfcfc",
  dim: "#7f8c8d",
  red: "#ed1515",
  green: "#11d116",
  green2: "#1cdc9a",
  yellow: "#fdbc4b",
  blue: "#1d99f3",
  blue2: "#3daee9",
  cyan: "#1abc9c",
  magenta: "#9b59b6",
};

type Seg = [string, string?];
type Line = { segs: Seg[]; type?: boolean; wait?: number };

const prompt = (cmd: string, wait = 500): Line[] => [
  { segs: [["[", C.fg], ["mark@archlinux", C.green], [" ", C.fg], ["~", C.blue2], ["]$ ", C.fg], [cmd, C.fg]], type: true, wait },
];

const port = (p: string, svc: string, ver: string): Line => ({
  segs: [[p.padEnd(10), C.fg], ["open  ", C.green2], [svc.padEnd(11), C.fg], [ver, C.fg]],
});

// fastfetch's small Arch logo, with the info column beside it.
const LOGO = [
  "      /\\      ",
  "     /  \\     ",
  "    /\\   \\    ",
  "   /      \\   ",
  "  /   ,,   \\  ",
  " /   |  |  -\\ ",
  "/_-''    ''-_\\",
  "",
  "",
  "",
];
const INFO: Seg[][] = [
  [["mark", C.blue], ["@", C.fg], ["archlinux", C.blue]],
  [["-----------------", C.fg]],
  [["OS", C.blue], [": Arch Linux x86_64 (btw)", C.fg]],
  [["Host", C.blue], [": Barcelona, ES", C.fg]],
  [["Role", C.blue], [": AI Engineer / FDE", C.fg]],
  [["Uptime", C.blue], [": 1.5 yrs shipping LLM systems", C.fg]],
  [["DE", C.blue], [": KDE Plasma 6.4", C.fg]],
  [["Langs", C.blue], [": ru · en (C1) · de (A1)", C.fg]],
  [["Stack", C.blue], [": Python · TypeScript · PyTorch", C.fg]],
  [["Status", C.blue], [": ", C.fg], ["open to AI Engineer roles", C.green]],
];
const FETCH: Line[] = INFO.map((info, i) => ({ segs: [[(LOGO[i] ?? "").padEnd(16), "#1793d1"], ...info] }));

const SCRIPT: Line[] = [
  ...prompt("fastfetch", 400),
  ...FETCH,
  { segs: [["", C.fg]], wait: 1400 },
  ...prompt("nmap -sV -sC mark-temchenko.dev"),
  { segs: [["Starting Nmap 7.95 ( https://nmap.org )", C.fg]], wait: 700 },
  { segs: [["Nmap scan report for ", C.fg], ["mark-temchenko.dev", C.blue2], [" (Barcelona, ES)", C.fg]] },
  { segs: [["Host is up (0.0021s latency).", C.fg]] },
  { segs: [["Not shown: 994 closed tcp ports (reset)", C.dim]], wait: 300 },
  { segs: [["PORT      STATE SERVICE    VERSION", C.yellow]] },
  port("80/tcp", "http", "AI Engineer / FDE"),
  port("443/tcp", "ssl/llm", "OpenAI · Claude · Gemini"),
  port("3000/tcp", "nextjs", "TypeScript · React 19"),
  port("5432/tcp", "postgres", "PostgreSQL · Supabase"),
  port("8000/tcp", "fastapi", "PyTorch · Hugging Face"),
  port("11434/tcp", "ollama", "local models, for fun"),
  { segs: [["| whoami:", C.cyan]], wait: 250 },
  { segs: [["|   recent_work:", C.cyan]] },
  { segs: [["|     - ", C.cyan], ["LLM grant platform, 4 enterprise clients", C.fg]] },
  { segs: [["|     - ", C.cyan], ["XLM-RoBERTa classifiers, ~20k articles", C.fg]] },
  { segs: [["|     - ", C.cyan], ["GenAI product shipped end to end", C.fg]] },
  { segs: [["|_  fun_fact: ", C.cyan], ['"It worked in the demo, I swear."', C.yellow]] },
  { segs: [["Nmap done: 1 IP address (1 host up) scanned in 2.71s", C.fg]], wait: 900 },
  { segs: [["", C.fg]] },
  ...prompt("curl -sL markt-d.github.io/card"),
  { segs: [["╭────────────────────────────────────────╮", C.dim]], wait: 500 },
  { segs: [["│ ", C.dim], ["Mark Temchenko", C.fg], [" · AI Engineer / FDE", C.dim], ["     ", C.fg], ["│", C.dim]] },
  { segs: [["│ ", C.dim], ["mail ", C.blue], ["mstemchenko.dev@gmail.com", C.green2], ["         ", C.fg], ["│", C.dim]] },
  { segs: [["│ ", C.dim], ["in   ", C.blue], ["linkedin.com/in/mark-the-artichoke", C.fg], ["│", C.dim]] },
  { segs: [["╰────────────────────────────────────────╯", C.dim]], wait: 600 },
  { segs: [["", C.fg]], wait: 300 },
  ...prompt("", 0),
];

const TYPE_MS = 38;
const LINE_MS = 85;
const HOLD_MS = 5200;

/** How far into the script we are: whole lines shown, and characters typed of the next command. */
function useScript(reduced: boolean) {
  const [state, setState] = useState({ line: SCRIPT.length, chars: 0 });
  useEffect(() => {
    if (reduced) return;
    let line = 0, chars = 0, timer = 0;
    const step = () => {
      if (line >= SCRIPT.length) {
        setState({ line, chars: 0 });
        timer = window.setTimeout(() => { line = 0; chars = 0; step(); }, HOLD_MS);
        return;
      }
      const l = SCRIPT[line];
      if (l.type) {
        const cmd = l.segs[l.segs.length - 1][0];
        if (chars < cmd.length) {
          chars++;
          setState({ line, chars });
          timer = window.setTimeout(step, TYPE_MS + (Math.random() < 0.1 ? 120 : 0));
          return;
        }
        // Enter pressed.
        chars = 0;
        line++;
        setState({ line, chars });
        timer = window.setTimeout(step, l.wait ?? LINE_MS);
        return;
      }
      line++;
      setState({ line, chars: 0 });
      timer = window.setTimeout(step, l.wait ?? LINE_MS);
    };
    setState({ line: 0, chars: 0 });
    timer = window.setTimeout(step, 600);
    return () => clearTimeout(timer);
  }, [reduced]);
  return state;
}

function Segs({ segs, cut }: { segs: Seg[]; cut?: number }) {
  return <>
    {segs.map(([text, color], i) => {
      const last = i === segs.length - 1;
      const shown = last && cut !== undefined ? text.slice(0, cut) : text;
      return <span key={i} style={{ color }}>{shown}</span>;
    })}
  </>;
}

/** Breeze window buttons: minimise, maximise, close. */
function WinButtons() {
  return <div className="flex items-center gap-1.5" aria-hidden>
    {["min", "max", "close"].map((k) => (
      <span key={k} className={`grid size-[18px] place-items-center rounded-full ${k === "close" ? "bg-[#da4453] text-white" : "text-[#fcfcfc]/80"}`}>
        <svg viewBox="0 0 10 10" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          {k === "min" && <path d="M2 3.8 L5 6.8 L8 3.8" />}
          {k === "max" && <path d="M2 6.2 L5 3.2 L8 6.2" />}
          {k === "close" && <path d="M2.8 2.8 L7.2 7.2 M7.2 2.8 L2.8 7.2" />}
        </svg>
      </span>
    ))}
  </div>;
}

export function HeroVisual() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const { line, chars } = useScript(reduced);
  const bodyRef = useRef<HTMLDivElement>(null);

  const typing = line < SCRIPT.length && !!SCRIPT[line].type;
  const visible = typing ? SCRIPT.slice(0, line + 1) : SCRIPT.slice(0, line);

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_60%_40%,var(--acc-1),transparent_70%)]" />
      <div
        className="float-soft overflow-hidden rounded-[10px] border border-black/60 bg-[#232627] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55),0_8px_20px_-10px_rgba(0,0,0,0.35)]"
        role="img"
        aria-label="A Konsole terminal on Arch Linux running fastfetch and nmap. The output lists role, languages, stack and recent work."
      >
        {/* Breeze title bar */}
        <div className="relative flex h-8 items-center justify-between bg-[#2a2e32] px-2.5">
          <div className="flex items-center gap-2">
            <span className="grid size-[18px] place-items-center rounded-[4px] bg-[#31363b] font-mono text-[9px] font-bold text-[#3daee9]">&gt;_</span>
          </div>
          <span className="pointer-events-none absolute inset-x-0 text-center text-[12px] font-medium text-[#fcfcfc]/90">mark@archlinux:~ — Konsole</span>
          <WinButtons />
        </div>
        {/* Menu bar */}
        <div className="flex h-6 items-center gap-3.5 border-b border-black/40 bg-[#31363b] px-3 text-[11.5px] text-[#fcfcfc]/85" aria-hidden>
          {["File", "Edit", "View", "Bookmarks", "Plugins", "Settings", "Help"].map((m, i) => (
            <span key={m} className={i > 4 ? "hidden sm:inline" : undefined}>{m}</span>
          ))}
        </div>
        {/* Terminal */}
        <div ref={bodyRef} className="flex h-[340px] flex-col justify-end overflow-hidden px-3 py-2.5 font-mono text-[10.5px] leading-[1.5] sm:h-[372px] sm:text-[11.5px]">
          {visible.map((l, i) => {
            const current = i === line && typing;
            return (
              <div key={i} className="min-h-[1.5em] whitespace-pre">
                <Segs segs={l.segs} cut={current ? chars : undefined} />
                {(current || (i === visible.length - 1 && line >= SCRIPT.length)) && <span className="ml-px inline-block h-[1.1em] w-[0.6em] translate-y-[2px] animate-pulse bg-[#fcfcfc]/85" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
