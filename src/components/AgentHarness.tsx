"use client";

import { Check, CircleDot, GitBranch, GitMerge, GitPullRequest, X } from "lucide-react";
import { Fit } from "./Fit";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * How I work, as a loop: issues come in, I plan each one, the harness hands
 * them to agents in their own git worktrees (Claude Code and Codex), CI runs
 * the tests, and nothing merges until I have read the diff. Issue titles are
 * the kind of thing Pesto's backlog holds; the run itself is illustrative.
 */

const W = 1080, H = 360;
const LOOP = 17;

const ISSUES = [
  { id: 212, title: "Split one bill across phones" },
  { id: 214, title: "Retry a receipt after a timeout" },
  { id: 218, title: "Translate allergen names" },
];
const LANES = [
  { tree: "wt/212-split-bill", agent: "Claude Code", files: 7 },
  { tree: "wt/214-receipt-retry", agent: "Codex", files: 3 },
  { tree: "wt/218-allergens", agent: "Claude Code", files: 4 },
];

// Per issue: planned by me, worked by an agent, tested, reviewed by me, merged.
const START = (k: number) => 0.5 + k * 1.7;
const PLAN = 1.1, HAND = 0.5, WORK = 4.4, CI = 1.0, REVIEW = 1.2;
/** Lane 1's first test run fails and the agent fixes it: CI goes red, then green. */
const RETRY = (k: number) => (k === 1 ? 1.6 : 0);
function stage(k: number, t: number) {
  const s = START(k);
  const a = s + PLAN, b = a + HAND, c = b + WORK, d = c + CI + RETRY(k), e = d + REVIEW;
  if (t < s) return { name: "backlog" as const, p: 0 };
  if (t < a) return { name: "plan" as const, p: (t - s) / PLAN };
  if (t < b) return { name: "hand" as const, p: (t - a) / HAND };
  if (t < c) return { name: "work" as const, p: (t - b) / WORK };
  if (t < d) return { name: "ci" as const, p: (t - c) / (CI + RETRY(k)) };
  if (t < e) return { name: "review" as const, p: (t - d) / REVIEW };
  return { name: "merged" as const, p: 1 };
}

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };

// Where a ticket sits at each stage.
const SLOT = { backlog: (k: number) => ({ x: 14, y: 54 + k * 58 }), me: { x: 262, y: 244 }, lane: (k: number) => ({ x: 756, y: 62 + k * 104 }), done: (k: number) => ({ x: 892, y: 46 + k * 46 }) };

export function AgentHarness() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  const t = useSceneClock(LOOP, inView, 9.2);
  const fade = t > LOOP - 0.6 ? (LOOP - t) / 0.6 : 1;
  const st = ISSUES.map((_, k) => stage(k, t));

  const me = st.map((s, k) => ({ s, k })).filter(({ s }) => s.name === "plan" || s.name === "review").pop();
  const meText = me ? `${me.s.name === "plan" ? "Planning" : "Reviewing the diff of"} #${ISSUES[me.k].id}` : "Writing the next issue";

  return (
    <div ref={ref}>
      <Fit width={W} minScale={0.6}>
        <div className="ah" style={{ width: W, height: H }}>
          {mounted && <div style={{ opacity: fade }}>
            <svg className="ah-wires" width={W} height={H} aria-hidden>
              <path d={`M 200 ${H / 2} L 236 ${H / 2}`} />
              {LANES.map((_, k) => <path key={k} d={`M 420 ${H / 2} C 445 ${H / 2}, 445 ${66 + k * 104}, 470 ${66 + k * 104}`} />)}
              {LANES.map((_, k) => <path key={`o${k}`} d={`M 850 ${66 + k * 104} C 872 ${66 + k * 104}, 872 ${H / 2}, 880 ${H / 2}`} className="faint" />)}
            </svg>

            <div className="ah-col" style={{ left: 0, top: 0, width: 200 }}>
              <div className="ah-head"><CircleDot className="size-3.5" /> Issues</div>
            </div>
            {ISSUES.map((is, k) => (
              <div key={is.id} className={cn("ah-issue ghost", st[k].name !== "backlog" && "taken")} style={{ left: SLOT.backlog(k).x, top: SLOT.backlog(k).y }}>
                <b>#{is.id}</b> {is.title}
              </div>
            ))}
            <div className="ah-issue ghost more" style={{ left: 14, top: 54 + 3 * 58 }}><b>#221</b> Floor plan: joined tables</div>

            <div className="ah-me" style={{ left: 236, top: 96 }}>
              <span className="ah-avatar">MT</span>
              <div><b>Me</b><span>Architecture, the issue spec, and every review</span></div>
              <div key={meText} className="ah-doing">{meText}</div>
            </div>

            {LANES.map((ln, k) => {
              const s = st[k];
              const active = s.name === "work" || s.name === "ci";
              const work = s.name === "work" ? s.p : ["ci", "review", "merged"].includes(s.name) ? 1 : 0;
              const step = work < 0.25 ? "Reading the codebase" : work < 0.7 ? `Editing ${Math.max(1, Math.round(ln.files * clamp((work - 0.25) / 0.45)))} of ${ln.files} files` : "Writing tests";
              const ciRed = k === 1 && s.name === "ci" && s.p < 0.45;
              const ciFix = k === 1 && s.name === "ci" && s.p >= 0.45 && s.p < 0.62;
              const ciText = s.name !== "ci" ? null : ciRed ? "1 test failed" : ciFix ? "Agent fixes it" : "CI: vitest, playwright";
              return <div key={ln.tree} className={cn("ah-lane", active && "on")} style={{ left: 470, top: 20 + k * 104 }}>
                <div className="ah-lane-head">
                  <span className="ah-tree"><GitBranch className="size-3.5" /> {ln.tree}</span>
                  <span className={cn("ah-agent", ln.agent === "Codex" && "codex")}>{ln.agent}</span>
                </div>
                <div className="ah-lane-body">
                  {s.name === "backlog" || s.name === "plan" || s.name === "hand"
                    ? <span className="ah-idle">waiting for an issue</span>
                    : s.name === "merged" ? <span className="ah-done"><GitMerge className="size-3.5" /> merged, worktree removed</span>
                    : s.name === "review" ? <span className="ah-done"><GitPullRequest className="size-3.5" /> PR open, waiting for me</span>
                    : s.name === "ci" ? <span className={cn("ah-ci", ciRed && "bad")}>{ciRed ? <X className="size-3.5" /> : <Check className="size-3.5" />} {ciText}</span>
                    : <span className="ah-step">{step}</span>}
                  <div className="ah-bar"><i style={{ width: `${Math.round(work * 100)}%` }} /></div>
                </div>
              </div>;
            })}

            <div className="ah-col" style={{ left: 880, top: 0, width: 200 }}>
              <div className="ah-head"><GitMerge className="size-3.5" /> Merged to main</div>
            </div>
            {ISSUES.map((is, k) => st[k].name === "merged" && (
              <div key={is.id} className="ah-merged" style={{ left: SLOT.done(k).x, top: SLOT.done(k).y }}>
                <Check className="size-3.5" /> #{is.id} {is.title}
              </div>
            ))}

            {/* The tickets themselves, moving between the columns. */}
            {ISSUES.map((is, k) => {
              const s = st[k];
              let x: number, y: number;
              if (s.name === "backlog") return null;
              if (s.name === "plan") { const a = SLOT.backlog(k), b = SLOT.me; const p = ease(s.p / 0.4); x = a.x + (b.x - a.x) * p; y = a.y + (b.y - a.y) * p; }
              else if (s.name === "hand") { const a = SLOT.me, b = SLOT.lane(k); const p = ease(s.p); x = a.x + (b.x - a.x) * p; y = a.y + (b.y - a.y) * p; }
              else if (s.name === "work" || s.name === "ci") { ({ x, y } = SLOT.lane(k)); }
              else if (s.name === "review") { const a = SLOT.lane(k), b = SLOT.me; const p = ease(s.p / 0.35); x = a.x + (b.x - a.x) * p; y = a.y + (b.y - a.y) * p; if (s.p > 0.75) { const q = ease((s.p - 0.75) / 0.25); const d = SLOT.done(k); x = b.x + (d.x - b.x) * q; y = b.y + (d.y - b.y) * q; } }
              else return null;
              const inLane = s.name === "work" || s.name === "ci";
              return <div key={is.id} className={cn("ah-ticket", inLane && "docked", s.name === "review" && "pr")} style={{ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` }}>
                {s.name === "review" ? <GitPullRequest className="size-3.5" /> : <CircleDot className="size-3.5" />} #{is.id}
              </div>;
            })}
          </div>}
        </div>
      </Fit>
    </div>
  );
}
