"use client";

import { Check, CircleDot, FileText, GitBranch, GitMerge, GitPullRequest, HelpCircle, Image as ImageIcon, X } from "lucide-react";
import { Fit } from "./Fit";
import { useInView, useMounted, useNarrow, useSceneClock } from "@/lib/use-in-view";
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
    hand: 2.3, work: [2.8, 6.4], ci: [6.4, 7.2], review: [7.2, 9.6],
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
    hand: 2.3, work: [2.8, 7.2], ci: [7.2, 9.0], fail: [7.2, 8.0], review: [9.6, 11.8],
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
    hand: 4.2, work: [4.7, 8.2], ci: [8.2, 9.0], review: [11.8, 13.8],
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
const SPEC_AT = { 212: 11.8, 214: 13.8 } as Record<number, number>;
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

type Pt = { x: number; y: number };
type Geo = {
  W: number; H: number;
  issue: (k: number) => Pt; issueW: number; issuesHead: Pt;
  me: Pt; meSpot: Pt; panel: Pt & { w: number };
  laneX: number; laneW: number; laneY: (k: number) => number; laneSpot: (k: number) => Pt; reviewTo: Pt;
  outHead: Pt; out: Pt & { w: number };
};

/** On a wide screen the run reads left to right: issues, me, the worktrees, main. */
const WIDE: Geo = {
  W, H,
  issue: (k) => ({ x: 14, y: 54 + k * 58 }), issueW: 186, issuesHead: { x: 0, y: 0 },
  me: { x: 236, y: 22 }, meSpot: { x: 262, y: 150 }, panel: { x: 236, y: 168, w: 214 },
  laneX: 470, laneW: 380, laneY: (k) => 22 + k * 100, laneSpot: (k) => ({ x: 768, y: 22 + k * 100 + 44 }), reviewTo: { x: 400, y: 150 },
  outHead: { x: 880, y: 0 }, out: { x: 880, y: 32, w: 196 },
};

/** On a phone it reads top to bottom: the same run, turned on its side. */
const TALL: Geo = {
  W: 340, H: 950,
  issue: (k) => ({ x: (k % 2) * 172, y: 26 + Math.floor(k / 2) * 62 }), issueW: 168, issuesHead: { x: 0, y: 0 },
  me: { x: 72, y: 162 }, meSpot: { x: 98, y: 280 }, panel: { x: 14, y: 284, w: 326 },
  laneX: 14, laneW: 326, laneY: (k) => 478 + k * 100, laneSpot: (k) => ({ x: 248, y: 478 + k * 100 + 44 }), reviewTo: { x: 140, y: 300 },
  outHead: { x: 0, y: 792 }, out: { x: 0, y: 818, w: 340 },
};

export function AgentHarness() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  // Played at two thirds of the speed it is written in, so each step can be read.
  const t = useSceneClock(LOOP * SLOW, inView, 8.6 * SLOW) / SLOW;
  const tall = useNarrow();
  const g = tall ? TALL : WIDE;
  const fade = t > LOOP - 0.6 ? (LOOP - t) / 0.6 : 1;

  const planning = ISSUES.find((is) => t >= is.plan[0] && t < is.plan[1]);
  const reviewing = LANES.find((l) => t >= l.review[0] && t < l.review[1]);
  const meText = planning ? (planning.split ? `Splitting #${planning.id} in two` : `Spec for #${planning.id}`)
    : reviewing ? `Reviewing ${reviewing.ticket}` : "Next issue";

  return (
    <div ref={ref}>
      <Fit width={g.W} minScale={tall ? 0 : 0.6} focus={tall ? undefined : t < 2.8 ? 230 : t < 7.2 ? 640 : t < 13.8 ? 360 : 900}>
        <div className={cn("ah", tall && "tall")} style={{ width: g.W, height: g.H }}>
          {mounted && <div style={{ opacity: fade }}>
            <svg className="ah-wires" width={g.W} height={g.H} aria-hidden>
              {tall ? <>
                <path d="M 170 140 L 170 162" />
                <path d={`M ${g.me.x} 214 H 6 V ${g.laneY(2) + 44}`} />
                {LANES.map((_, k) => <path key={k} d={`M 6 ${g.laneY(k) + 44} H 14`} />)}
                <path d={`M 170 ${g.laneY(2) + 88} V ${g.outHead.y - 6}`} className="faint" />
              </> : <>
                <path d={`M 200 90 L 236 90`} />
                {LANES.map((_, k) => <path key={k} d={`M 432 90 C 452 90, 452 ${g.laneY(k) + 44}, 470 ${g.laneY(k) + 44}`} />)}
                {LANES.map((_, k) => <path key={`o${k}`} d={`M 850 ${g.laneY(k) + 44} C 866 ${g.laneY(k) + 44}, 866 90, 880 90`} className="faint" />)}
              </>}
            </svg>

            <div className="ah-col" style={{ left: g.issuesHead.x, top: g.issuesHead.y, width: 200 }}><div className="ah-head"><CircleDot className="size-3.5" /> Issues</div></div>
            {ISSUES.map((is, k) => (
              <div key={is.id} className={cn("ah-issue ghost", t >= is.plan[0] && "taken")} style={{ left: g.issue(k).x, top: g.issue(k).y, width: g.issueW }}>
                <b>#{is.id}</b> {is.title}
              </div>
            ))}
            <div className="ah-issue ghost more" style={{ left: g.issue(2).x, top: g.issue(2).y, width: g.issueW }}><b>#218</b> Translate allergen names</div>
            <div className="ah-issue ghost more" style={{ left: g.issue(3).x, top: g.issue(3).y, width: g.issueW }}><b>#221</b> Floor plan: joined tables</div>

            {tall && !planning?.split && !reviewing && <div className="ah-slot" style={{ left: g.panel.x, top: g.panel.y, width: g.panel.w }}>Splits and reports show up here</div>}

            <div className="ah-me" style={{ left: g.me.x, top: g.me.y }}>
              <span className="ah-avatar">MT</span>
              <div><b>Me</b><span>Spec, split, review</span></div>
              <div key={meText} className="ah-doing">{meText}</div>
            </div>

            {/* The split: one feature becomes two pieces that can be built apart. */}
            {planning?.split && t > planning.plan[0] + 0.7 && (
              <div className="ah-split" style={{ left: g.panel.x, top: g.panel.y, width: g.panel.w }}>
                <div className="ah-split-head"><FileText className="size-3.5" /> #212 in two parts</div>
                <div className="ah-split-row"><b>212a</b> ledger</div>
                <div className="ah-split-row"><b>212b</b> share sheet</div>
              </div>
            )}

            {/* What a worktree hands back: screenshots and the decisions it made, the open ones marked. */}
            {reviewing && <Report key={reviewing.ticket} lane={reviewing} t={t} at={g.panel} />}

            {LANES.map((ln, k) => {
              const s = laneState(ln, t);
              const work = s === "work" ? clamp((t - ln.work[0]) / (ln.work[1] - ln.work[0])) : ["ci", "waiting", "review", "merged"].includes(s) ? 1 : 0;
              const failing = ln.fail && t >= ln.fail[0] && t < ln.fail[1];
              const fixing = ln.fail && t >= ln.fail[1];
              return <div key={ln.tree} className={cn("ah-lane", (s === "work" || s === "ci") && "on")} style={{ left: g.laneX, top: g.laneY(k), width: g.laneW }}>
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

            <div className="ah-col" style={{ left: g.outHead.x, top: g.outHead.y, width: 200 }}><div className="ah-head"><GitMerge className="size-3.5" /> Main + specs</div></div>
            <div className="ah-out" style={{ left: g.out.x, top: g.out.y, width: g.out.w }}>
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
              const at = lerp(g.issue(k), g.meSpot, p);
              return <div key={is.id} className="ah-ticket" style={{ transform: `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)` }}><CircleDot className="size-3.5" /> #{is.id}</div>;
            })}
            {LANES.map((ln, k) => {
              const s = laneState(ln, t);
              let at: { x: number; y: number };
              if (s === "hand") at = lerp(g.meSpot, g.laneSpot(k), ease((t - ln.hand) / (ln.work[0] - ln.hand)));
              else if (s === "work" || s === "ci" || s === "waiting") at = g.laneSpot(k);
              else if (s === "review") at = lerp(g.laneSpot(k), g.reviewTo, ease((t - ln.review[0]) / 0.5));
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

function Report({ lane, t, at }: { lane: Lane; t: number; at: Pt & { w: number } }) {
  const shown = (i: number) => t > lane.review[0] + 0.4 + i * 0.25;
  return <div className="ah-report" style={{ left: at.x, top: at.y, width: at.w }}>
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
