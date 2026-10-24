"use client";

import { Check, CircleDot, FileText, GitBranch, GitMerge, GitPullRequest, HelpCircle, Image as ImageIcon, X } from "lucide-react";
import { Fit } from "./Fit";
import { useInView, useMounted, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * How I work, as one run. I write the issue and split a feature into pieces
 * that can be built apart; the harness gives each piece its own git worktree
 * and agent (Claude Code or Codex); CI runs the tests. What comes back is not
 * just a diff but a report: screenshots and the key decisions, with the ones
 * that need me marked. I review one at a time, and every merge lands with its
 * spec in the repo, so the team can catch up without a meeting. Issue titles
 * are the kind of thing Pesto's backlog holds; the run is illustrative.
 */

const W = 1080, H = 400;
const LOOP = 18;
const SLOW = 1.5;

type Lane = {
  tree: string; agent: "Claude Code" | "Codex"; ticket: string; issue: number;
  hand: number; work: [number, number]; ci: [number, number]; review: [number, number];
  fail?: [number, number];
  report: { shots: string[]; decisions: { text: string; ask?: boolean }[] };
};

const LANES: Lane[] = [
  {
    tree: "wt/212a-ledger", agent: "Claude Code", ticket: "212a", issue: 212,
    hand: 2.3, work: [2.8, 6.4], ci: [6.4, 7.2], review: [7.4, 9.6],
    report: {
      shots: ["Ledger, two phones", "Test run"],
      decisions: [
        { text: "Lock the order row" },
        { text: "Charges name their dishes" },
        { text: "Refund order? Your call", ask: true },
      ],
    },
  },
  {
    tree: "wt/212b-share-sheet", agent: "Codex", ticket: "212b", issue: 212,
    hand: 2.3, work: [2.8, 7.2], ci: [7.2, 9.0], fail: [7.2, 8.0], review: [9.8, 12.0],
    report: {
      shots: ["Share sheet", "Dark mode"],
      decisions: [
        { text: "Share starts at your dishes" },
        { text: "½ ⅓ ¼ presets" },
      ],
    },
  },
  {
    tree: "wt/214-receipt-retry", agent: "Claude Code", ticket: "214", issue: 214,
    hand: 4.2, work: [4.7, 8.2], ci: [8.2, 9.0], review: [12.2, 14.2],
    report: {
      shots: ["Retry timeline", "Delivery log"],
      decisions: [
        { text: "Retry 6× with backoff" },
        { text: "One key per receipt" },
      ],
    },
  },
];

const ISSUES = [
  { id: 212, title: "Split one bill across phones", plan: [0.5, 2.3] as [number, number], split: true },
  { id: 214, title: "Retry a receipt after a timeout", plan: [3.0, 4.2] as [number, number] },
];
/** When each issue's spec lands in the repo: once every piece of it has merged. */
const SPEC_AT = { 212: 12.3, 214: 14.5 } as Record<number, number>;
const SPECS = { 212: "specs/212-split-bill.md", 214: "specs/214-receipt-retry.md" } as Record<number, string>;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };
const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, p: number) => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p });

function laneState(l: Lane, t: number) {
  if (t < l.hand) return "idle" as const;
  if (t < l.work[0]) return "hand" as const;
  if (t < l.work[1]) return "work" as const;
  if (t < l.ci[1]) return "ci" as const;
  if (t < l.review[0]) return "waiting" as const;
  if (t < l.review[1]) return "review" as const;
  return "merged" as const;
}

const LANE_Y = (k: number) => 22 + k * 100;
const ME = { x: 236, y: 22 };
const SPOT = { me: { x: 262, y: 150 }, issue: (k: number) => ({ x: 14, y: 54 + k * 58 }), lane: (k: number) => ({ x: 768, y: LANE_Y(k) + 44 }) };

export function AgentHarness() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  // Played at two thirds of the speed it is written in, so each step can be read.
  const t = useSceneClock(LOOP * SLOW, inView, 8.6 * SLOW) / SLOW;
  const fade = t > LOOP - 0.6 ? (LOOP - t) / 0.6 : 1;

  const planning = ISSUES.find((is) => t >= is.plan[0] && t < is.plan[1]);
  const reviewing = LANES.find((l) => t >= l.review[0] && t < l.review[1]);
  const meText = planning ? (planning.split ? `Splitting #${planning.id} in two` : `Spec for #${planning.id}`)
    : reviewing ? `Reviewing ${reviewing.ticket}` : "Next issue";

  return (
    <div ref={ref}>
      <Fit width={W} minScale={0.6}>
        <div className="ah" style={{ width: W, height: H }}>
          {mounted && <div style={{ opacity: fade }}>
            <svg className="ah-wires" width={W} height={H} aria-hidden>
              <path d={`M 200 90 L 236 90`} />
              {LANES.map((_, k) => <path key={k} d={`M 432 90 C 452 90, 452 ${LANE_Y(k) + 44}, 470 ${LANE_Y(k) + 44}`} />)}
              {LANES.map((_, k) => <path key={`o${k}`} d={`M 850 ${LANE_Y(k) + 44} C 866 ${LANE_Y(k) + 44}, 866 90, 880 90`} className="faint" />)}
            </svg>

            <div className="ah-col" style={{ left: 0, top: 0, width: 200 }}><div className="ah-head"><CircleDot className="size-3.5" /> Issues</div></div>
            {ISSUES.map((is, k) => (
              <div key={is.id} className={cn("ah-issue ghost", t >= is.plan[0] && "taken")} style={{ left: SPOT.issue(k).x, top: SPOT.issue(k).y }}>
                <b>#{is.id}</b> {is.title}
              </div>
            ))}
            <div className="ah-issue ghost more" style={{ left: 14, top: 54 + 2 * 58 }}><b>#218</b> Translate allergen names</div>
            <div className="ah-issue ghost more" style={{ left: 14, top: 54 + 3 * 58 }}><b>#221</b> Floor plan: joined tables</div>

            <div className="ah-me" style={{ left: ME.x, top: ME.y }}>
              <span className="ah-avatar">MT</span>
              <div><b>Me</b><span>Spec, split, review</span></div>
              <div key={meText} className="ah-doing">{meText}</div>
            </div>

            {/* The split: one feature becomes two pieces that can be built apart. */}
            {planning?.split && t > planning.plan[0] + 0.7 && (
              <div className="ah-split" style={{ left: ME.x, top: 168 }}>
                <div className="ah-split-head"><FileText className="size-3.5" /> #212 in two parts</div>
                <div className="ah-split-row"><b>212a</b> ledger</div>
                <div className="ah-split-row"><b>212b</b> share sheet</div>
              </div>
            )}

            {/* What a worktree hands back: screenshots and the decisions it made, the open ones marked. */}
            {reviewing && <Report key={reviewing.ticket} lane={reviewing} t={t} />}

            {LANES.map((ln, k) => {
              const s = laneState(ln, t);
              const work = s === "work" ? clamp((t - ln.work[0]) / (ln.work[1] - ln.work[0])) : ["ci", "waiting", "review", "merged"].includes(s) ? 1 : 0;
              const failing = ln.fail && t >= ln.fail[0] && t < ln.fail[1];
              const fixing = ln.fail && t >= ln.fail[1] && t < ln.fail[1] + 0.5;
              return <div key={ln.tree} className={cn("ah-lane", (s === "work" || s === "ci") && "on")} style={{ left: 470, top: LANE_Y(k) }}>
                <div className="ah-lane-head">
                  <span className="ah-tree"><GitBranch className="size-3.5" /> {ln.tree}</span>
                  <span className={cn("ah-agent", ln.agent === "Codex" && "codex")}>{ln.agent}</span>
                </div>
                <div className="ah-lane-body">
                  {s === "idle" || s === "hand" ? <span className="ah-idle">idle</span>
                    : s === "merged" ? <span className="ah-done"><GitMerge className="size-3.5" /> merged</span>
                    : s === "review" ? <span className="ah-done"><GitPullRequest className="size-3.5" /> in review</span>
                    : s === "waiting" ? <span className="ah-step muted"><GitPullRequest className="size-3.5" /> in my queue</span>
                    : s === "ci" ? <span className={cn("ah-ci", failing && "bad")}>{failing ? <X className="size-3.5" /> : <Check className="size-3.5" />} {failing ? "1 test failed" : fixing ? "fixed" : "CI passing"}</span>
                    : <span className="ah-step">{work < 0.3 ? "Reading the spec" : work < 0.75 ? "Building" : "Writing the report"}</span>}
                  <div className="ah-bar"><i style={{ width: `${Math.round(work * 100)}%` }} /></div>
                </div>
              </div>;
            })}

            <div className="ah-col" style={{ left: 880, top: 0, width: 200 }}><div className="ah-head"><GitMerge className="size-3.5" /> Main + specs</div></div>
            <div className="ah-out" style={{ left: 880, top: 32 }}>
              {LANES.map((ln) => t >= ln.review[1] && (
                <div key={ln.ticket} className="ah-merged"><Check className="size-3.5" /> {ln.ticket} merged</div>
              ))}
              {ISSUES.map((is) => t >= SPEC_AT[is.id] && (
                <div key={`spec${is.id}`} className="ah-doc">
                  <FileText className="size-3.5" />
                  <div><b>{SPECS[is.id]}</b><span>for the team, async</span></div>
                </div>
              ))}
            </div>

            {/* The tickets themselves. #212 reaches me as one and leaves as two. */}
            {ISSUES.map((is, k) => {
              if (t < is.plan[0] || t >= is.plan[1]) return null;
              const p = ease((t - is.plan[0]) / 0.5);
              const at = lerp(SPOT.issue(k), SPOT.me, p);
              return <div key={is.id} className="ah-ticket" style={{ transform: `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)` }}><CircleDot className="size-3.5" /> #{is.id}</div>;
            })}
            {LANES.map((ln, k) => {
              const s = laneState(ln, t);
              let at: { x: number; y: number };
              if (s === "hand") at = lerp(SPOT.me, SPOT.lane(k), ease((t - ln.hand) / (ln.work[0] - ln.hand)));
              else if (s === "work" || s === "ci" || s === "waiting") at = SPOT.lane(k);
              else if (s === "review") at = lerp(SPOT.lane(k), { x: 400, y: 150 }, ease((t - ln.review[0]) / 0.5));
              else return null;
              return <div key={ln.ticket} className={cn("ah-ticket", (s === "work" || s === "ci") && "docked", (s === "waiting" || s === "review") && "pr")} style={{ transform: `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)`, opacity: s === "review" ? 1 - clamp((t - ln.review[0] - 0.5) / 0.3) : 1 }}>
                {s === "waiting" || s === "review" ? <GitPullRequest className="size-3.5" /> : <CircleDot className="size-3.5" />} #{ln.ticket}
              </div>;
            })}
          </div>}
        </div>
      </Fit>
    </div>
  );
}

function Report({ lane, t }: { lane: Lane; t: number }) {
  const shown = (i: number) => t > lane.review[0] + 0.4 + i * 0.25;
  return <div className="ah-report" style={{ left: ME.x, top: 168 }}>
    <div className="ah-report-head"><GitPullRequest className="size-3.5" /> Report · {lane.ticket}</div>
    <div className="ah-shots">
      {lane.report.shots.map((s, i) => (
        <figure key={s} className={cn("ah-shot", i === 1 && "b", shown(i) && "in")}>
          <div className="ah-shot-img"><i /><i /><i /></div>
          <figcaption><ImageIcon className="size-3" /> {s}</figcaption>
        </figure>
      ))}
    </div>
    <ul className="ah-decisions">
      {lane.report.decisions.map((d, i) => (
        <li key={d.text} className={cn(d.ask && "ask", shown(i + 2) && "in")}>
          {d.ask ? <HelpCircle className="size-3.5" /> : <Check className="size-3.5" />}
          <b>{d.text}</b>
        </li>
      ))}
    </ul>
  </div>;
}
