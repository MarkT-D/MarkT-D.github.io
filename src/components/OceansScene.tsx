"use client";

import { AudioLines, Check, Mic, Play, Sparkles, UserRound, X } from "lucide-react";
import { Fit } from "./Fit";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * OceansX in one line of work: videos and interviews are collected, Whisper
 * turns them into text, the classifier sorts each into well-being or not
 * (and gets some wrong, which is why it is scored), and what it found goes to
 * the PhD researcher with LIME showing why. Clips and the sentence are made up;
 * the three F1 scores are the project's.
 */

const W = 1080, H = 380;
const LOOP = 16;
const EVERY = 0.62, DUR = 4.6;
const MODELS = [["BERT", 0.89], ["SVM", 0.86], ["Random forest", 0.77]] as const;

/** One clip per slot: what it is, what it really is, and what the model said. */
const ITEMS = Array.from({ length: Math.floor(LOOP / EVERY) }, (_, i) => {
  const truth = [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19, 21, 23].includes(i);
  const wrong = i % 9 === 4;
  return { i, kind: i % 3 === 1 ? "interview" : "video", truth, said: wrong ? !truth : truth, mins: 4 + ((i * 7) % 23) };
});

const X0 = 40, X_ASR = 270, X_CLS = 500, X_BIN = 690, Y = 150;
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

  return (
    <div ref={ref}>
      <Fit width={W} minScale={0.6}>
        <div className="ox" style={{ width: W, height: H }}>
          {mounted && <>
            <svg className="ox-lines" width={W} height={H} aria-hidden>
              <path d={`M ${X0} ${Y} L ${X_CLS} ${Y}`} />
              <path d={`M ${X_CLS} ${Y} C ${X_CLS + 90} ${Y}, ${X_BIN - 90} ${BIN_Y.yes}, ${X_BIN} ${BIN_Y.yes}`} />
              <path d={`M ${X_CLS} ${Y} C ${X_CLS + 90} ${Y}, ${X_BIN - 90} ${BIN_Y.no}, ${X_BIN} ${BIN_Y.no}`} />
              <path d={`M ${X_BIN + 120} ${BIN_Y.yes} L 850 ${BIN_Y.yes}`} className="hand" />
            </svg>

            <div className="ox-col" style={{ left: 0, top: 18, width: 170 }}>
              <b>Collect</b><span>YouTube search and interviews, ~600 hours</span>
            </div>
            <div className="ox-pile" aria-hidden>
              {[Play, Mic, Play, Mic, Play].map((I, i) => <span key={i} className="ox-clip" style={{ transform: `translate(${4 + (i % 2) * 22}px, ${Y + 40 + i * 9}px)` }}><I className="size-3.5" /></span>)}
            </div>
            <div className="ox-gate" style={{ left: X_ASR - 54, top: Y - 46 }}>
              <AudioLines className="size-4" /><b>Whisper</b><span>audio to text</span>
            </div>
            <div className="ox-gate cls" style={{ left: X_CLS - 88, top: Y - 64 }}>
              <b>Classifier</b>
              {MODELS.map(([m, f1], i) => (
                <div key={m} className={cn("ox-model", i === 0 && "on")}>
                  <span>{m}</span><i style={{ width: `${Math.round((f1 - 0.6) * 300)}%` }} /><em>{f1.toFixed(2)}</em>
                </div>
              ))}
              <small>macro F1</small>
            </div>

            {moving.map((it) => {
              const p = where(it.s, it.said);
              return <div key={it.i} className={cn("ox-clip", p.text && "text")} style={{ transform: `translate(${(p.x - 24).toFixed(1)}px, ${(p.y - 16).toFixed(1)}px)`, opacity: it.s < 0.04 ? it.s / 0.04 : it.s > 0.78 ? 1 - (it.s - 0.78) / 0.07 : 1 }}>
                {p.text ? <><i /><i /><i /></> : it.kind === "video" ? <Play className="size-3.5" /> : <Mic className="size-3.5" />}
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
              <div className="ox-person"><UserRound className="size-5" /><div><b>PhD researcher</b><span>gets the labelled corpus, with explanations</span></div></div>
              <div key={explain} className="ox-lime">
                <div className="ox-lime-head"><Sparkles className="size-3.5" /> LIME · why it said well-being</div>
                <p>{EXPLAINS[explain].map(([w, s], i) => <span key={i} style={s ? { background: `color-mix(in oklab, var(--acc-5) ${Math.round(s * 45)}%, transparent)` } : undefined}>{w} </span>)}</p>
              </div>
              <p className="ox-why">What the researcher needed: not just a label, but which expressions the model tied to well-being.</p>
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
