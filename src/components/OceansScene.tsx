"use client";

import { AudioLines, Check, Mic, Ship, Sparkles, UserRound, X } from "lucide-react";
import { Fit } from "./Fit";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * OceansX in one line of work: videos and interviews are collected, Whisper
 * turns them into text, the classifier sorts each into well-being or not
 * (and gets some wrong, which is why it is scored), and what it found goes to
 * our supervising professor with LIME showing why. Clips and the sentence are made up;
 * the three F1 scores are the project's.
 */

const W = 1080, H = 370;
const LOOP = 16;
const EVERY = 0.62, DUR = 4.6;
const MODELS = [["BERT", 0.89], ["SVM", 0.86], ["Random forest", 0.77]] as const;

/** One clip per slot: what it is, what it really is, and what the model said. */
const noise = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const ITEMS = Array.from({ length: Math.floor(LOOP / EVERY) }, (_, i) => {
  const truth = [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19, 21, 23].includes(i);
  const wrong = i % 9 === 4;
  // How sure each model is that this clip is about well-being. BERT decides;
  // the other two are shown for comparison and wander further from the truth.
  const sure = (k: number, spread: number) => {
    const base = truth ? 0.8 : 0.2;
    const v = base + (noise(i, k) - 0.5) * spread;
    return Math.min(0.98, Math.max(0.03, wrong && k === 0 ? 1 - v : v));
  };
  const probs = [sure(0, 0.3), sure(1, 0.5), sure(2, 0.75)];
  return { i, kind: i % 4 === 2 ? "ship" : "interview", truth, said: probs[0] >= 0.5, probs };
});

const X0 = 132, X_ASR = 300, X_CLS = 500, X_BIN = 690, Y = 150;
const BIN_Y = { yes: 80, no: 250 };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };

function where(s: number, yes: boolean) {
  if (s < 0.3) return { x: X0 + (X_ASR - X0) * ease(s / 0.3), y: Y, text: s > 0.27 };
  if (s < 0.55) return { x: X_ASR + (X_CLS - X_ASR) * ease((s - 0.3) / 0.25), y: Y, text: true };
  const p = ease((s - 0.55) / 0.25);
  return { x: X_CLS + (X_BIN - X_CLS) * p, y: Y + ((yes ? BIN_Y.yes : BIN_Y.no) - Y) * p, text: true };
}

export function OceansScene() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, 11);

  // Items in flight this turn, and the ones already sorted (counted in their bin).
  const moving = ITEMS.map((it) => ({ ...it, s: (t - it.i * EVERY) / DUR })).filter((it) => it.s > 0 && it.s < 0.85);
  const sorted = ITEMS.filter((it) => (t - it.i * EVERY) / DUR >= 0.8);
  const bin = (yes: boolean) => sorted.filter((it) => it.said === yes);
  const right = sorted.filter((it) => it.said === it.truth).length;
  const explain = t > 4 ? Math.floor((t - 4) / 4) % EXPLAINS.length : 0;
  // The clip the classifier is reading right now.
  const current = moving.filter((it) => it.s >= 0.4 && it.s < 0.62).sort((a, b) => b.s - a.s)[0];

  return (
    <div ref={ref}>
      <Fit width={W} minScale={0.6} follow="instant" focus={W / 2 - 250 * Math.cos((2 * Math.PI * t) / LOOP)}>
        <div className="ox" style={{ width: W, height: H }}>
          {mounted && <>
            <svg className="ox-lines" width={W} height={H} aria-hidden>
              <path d={`M ${X0} ${Y} L ${X_CLS} ${Y}`} />
              <path d={`M ${X_CLS} ${Y} C ${X_CLS + 90} ${Y}, ${X_BIN - 90} ${BIN_Y.yes}, ${X_BIN} ${BIN_Y.yes}`} />
              <path d={`M ${X_CLS} ${Y} C ${X_CLS + 90} ${Y}, ${X_BIN - 90} ${BIN_Y.no}, ${X_BIN} ${BIN_Y.no}`} />
              <path d={`M ${X_BIN + 120} ${BIN_Y.yes} L 850 ${BIN_Y.yes}`} className="hand" />
            </svg>

            <div className="ox-col" style={{ left: 0, top: 6, width: 190 }}>
              <b>Collect</b><span>Interviews with sailors, plus onboard video. ~600 hours</span>
            </div>
            <Boat t={t} />
            <div className="ox-gate" style={{ left: X_ASR - 54, top: Y - 46 }}>
              <AudioLines className="size-4" /><b>Whisper</b><span>audio to text</span>
            </div>
            <div className="ox-gate cls" style={{ left: X_CLS - 88, top: Y - 64 }}>
              <b>Classifier</b>
              <small className="ox-sub">P(well-being), this clip</small>
              {MODELS.map(([m], k) => {
                const v = current ? current.probs[k] : 0;
                return <div key={m} className={cn("ox-model", k === 0 && "on")}>
                  <span>{m}</span><i style={{ width: `${Math.round(v * 100)}%`, opacity: current ? 1 : 0.2 }} /><em>{current ? v.toFixed(2) : "–"}</em>
                </div>;
              })}
              <small>macro F1 on the test set: {MODELS.map(([m, f1]) => `${m === "Random forest" ? "RF" : m} ${f1.toFixed(2)}`).join(" · ")}</small>
            </div>

            {moving.map((it) => {
              const p = where(it.s, it.said);
              return <div key={it.i} className={cn("ox-clip", p.text && "text")} style={{ transform: `translate(${(p.x - 24).toFixed(1)}px, ${(p.y - 16).toFixed(1)}px)`, opacity: it.s < 0.04 ? it.s / 0.04 : it.s > 0.78 ? 1 - (it.s - 0.78) / 0.07 : 1 }}>
                {p.text ? <><i /><i /><i /></> : it.kind === "ship" ? <Ship className="size-3.5" /> : <Mic className="size-3.5" />}
              </div>;
            })}

            {(["yes", "no"] as const).map((k) => {
              const items = bin(k === "yes");
              return <div key={k} className={cn("ox-bin", k)} style={{ left: X_BIN, top: BIN_Y[k] - 40 }}>
                <div className="ox-bin-head"><b>{k === "yes" ? "Well-being" : "Other"}</b><span>{items.length}</span></div>
                <div className="ox-bin-items">
                  {items.slice(-12).map((it) => <span key={it.i} className={cn(it.said !== it.truth && "wrong")}>{it.said !== it.truth ? <X /> : <Check />}</span>)}
                </div>
              </div>;
            })}

            <div className="ox-acc" style={{ left: X_BIN, top: 318 }}>
              Checked against hand labels: <b>{right}/{sorted.length || 0}</b> right. The wrong ones are what the score counts.
            </div>

            <div className="ox-desk" style={{ left: 850, top: 26 }}>
              <div className="ox-person"><UserRound className="size-5" /><div><b>Our supervisor</b><span>Full Professor of Genetics and Wellbeing, on XplorIT&apos;s board</span></div></div>
              <div key={explain} className="ox-lime">
                <div className="ox-lime-head"><Sparkles className="size-3.5" /> LIME · why it said well-being</div>
                <p>{EXPLAINS[explain].map(([w, s], i) => <span key={i} style={s ? { background: `color-mix(in oklab, var(--acc-5) ${Math.round(s * 45)}%, transparent)` } : undefined}>{w} </span>)}</p>
              </div>
              <p className="ox-why">What she needed: not just a label, but which expressions the model tied to well-being.</p>
            </div>
          </>}
        </div>
      </Fit>
    </div>
  );
}

const EXPLAINS: [string, number][][] = [
  [["Since", 0], ["the", 0], ["garden", 0.5], ["opened", 0], ["I", 0], ["feel", 0.6], ["connected", 1], ["to", 0], ["my", 0], ["neighbours", 0.8], ["again.", 0]],
  [["Fishing", 0], ["with", 0], ["my", 0], ["son", 0.6], ["is", 0], ["the", 0], ["calmest", 1], ["part", 0], ["of", 0], ["my", 0], ["week.", 0.3]],
  [["We", 0], ["finally", 0.4], ["have", 0], ["time", 0.7], ["to", 0], ["just", 0], ["sit", 0.5], ["and", 0], ["talk", 0.9], ["together.", 0.6]],
];

/** A sailing boat on a moving sea, where the interviews come from. */
function Boat({ t }: { t: number }) {
  const rock = Math.sin(t * 1.6) * 3;
  const bob = Math.sin(t * 1.6 + 0.6) * 2;
  return <svg className="ox-boat" width={130} height={150} viewBox="0 0 130 150" style={{ left: 0, top: 70 }} aria-hidden>
    <g transform={`translate(0 ${bob.toFixed(1)}) rotate(${rock.toFixed(1)} 62 104)`}>
      <path className="sail" d="M 64 22 L 64 92 L 24 92 Z" />
      <path className="sail jib" d="M 68 34 L 68 92 L 98 92 Z" />
      <line className="mast" x1="66" y1="16" x2="66" y2="98" />
      <path className="hull" d="M 18 96 L 112 96 L 100 114 L 30 114 Z" />
    </g>
    {[0, 1].map((k) => <path key={k} className={`sea s${k}`} d={`M ${-40 + ((t * 18 + k * 20) % 40)} ${116 + k * 9} q 10 -6 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`} />)}
  </svg>;
}
