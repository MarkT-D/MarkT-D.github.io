"use client";

import { Check, CircleDot, FileText, GitBranch, GitMerge, GitPullRequest, HelpCircle, Image as ImageIcon, MessagesSquare, X } from "lucide-react";
import { Fit } from "./Fit";
import { useInView, useMounted, useNarrow, useSceneClock } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * How I work, as one run. From the backlog I pick tickets that belong
 * together by meaning and give them one feature branch and one PR. Before
 * anything is built, the agent grills me on the plan (/grill-me) until the
 * open questions are answered, and the answers go into the spec. Then the PR
 * is split into worktrees where the parts can run in parallel, each with its
 * own agent (Claude Code or Codex) and CI. What comes back is not just a diff
 * but a report: screenshots and the key decisions, the ones that need me
 * marked. I review them one at a time into the feature branch, and the PR
 * lands on main with its spec, so the team can catch up without a meeting.
 * Ticket titles are the kind of thing Pesto's backlog holds; the run is
 * illustrative.
 */

const W = 1080, H = 400;
const LOOP = 18.6;
const SLOW = 1.5;

const PICK = 0.6, TAKE = 1.8, GRILL = 2.4, PR_AT = 5.0, SPLIT = 5.8, HAND = 6.4;
const ALL_IN = 16.0, MERGE = 16.6, SPEC = 16.9, NEXT = 17.4;

const ISSUES = [
  { id: 212, title: "Split one bill across phones", set: true },
  { id: 214, title: "Retry a receipt after a timeout", set: true },
  { id: 216, title: "Show who paid what", set: true },
  { id: 218, title: "Translate allergen names" },
  { id: 221, title: "Floor plan: joined tables" },
];

/** The questions the agent asks before it writes a line, and my answers. */
const QUESTIONS = [
  { at: 2.6, text: "Split by dish or by amount?" },
  { at: 3.2, me: true, text: "By dish. Amount as a fallback." },
  { at: 3.8, text: "Two cards on one bill: which is refunded first?" },
  { at: 4.4, me: true, text: "The most recent one." },
];

type Lane = {
  tree: string; part: string; agent: "Claude Code" | "Codex"; issue: number;
  work: [number, number]; ci: [number, number]; review: [number, number];
  fail?: [number, number];
  report: { shots: string[]; decisions: { text: string; ask?: boolean }[] };
};

const LANES: Lane[] = [
  {
    tree: "wt/ledger", part: "ledger", agent: "Claude Code", issue: 212,
    work: [6.9, 10.0], ci: [10.0, 10.8], review: [10.8, 12.6],
    report: {
      shots: ["Ledger, two phones", "Test run"],
      decisions: [
        { text: "Lock the order row" },
        { text: "Charges name their dishes" },
        { text: "Hold a share for 10 min? Your call", ask: true },
      ],
    },
  },
  {
    tree: "wt/share-sheet", part: "share sheet", agent: "Codex", issue: 216,
    work: [6.9, 10.6], ci: [10.6, 12.2], fail: [10.6, 11.4], review: [12.6, 14.4],
    report: {
      shots: ["Share sheet", "Dark mode"],
      decisions: [
        { text: "Share starts at your dishes" },
        { text: "½ ⅓ ¼ presets" },
      ],
    },
  },
  {
    tree: "wt/receipt-retry", part: "receipt retry", agent: "Claude Code", issue: 214,
    work: [6.9, 10.9], ci: [10.9, 11.7], review: [14.4, 16.0],
    report: {
      shots: ["Retry timeline", "Delivery log"],
      decisions: [
        { text: "Retry 6× with backoff" },
        { text: "One key per receipt" },
      ],
    },
  },
];

type Pt = { x: number; y: number };
type Box = Pt & { w: number };

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };
const lerp = (a: Pt, b: Pt, p: number) => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p });

function laneState(l: Lane, k: number, t: number) {
  const hand = HAND + k * 0.15;
  if (t < hand) return "idle" as const;
  if (t < l.work[0]) return "hand" as const;
  if (t < l.work[1]) return "work" as const;
  if (t < l.ci[1]) return "ci" as const;
  if (t < l.review[0]) return "waiting" as const;
  if (t < l.review[1]) return "review" as const;
  return "merged" as const;
}

type Geo = {
  W: number; H: number;
  issue: (k: number) => Pt; issueW: number;
  me: Pt; meSpot: Pt; panel: Box;
  laneX: number; laneW: number; laneY: (k: number) => number; laneSpot: (k: number) => Pt; reviewTo: Pt;
  prHead: Pt; pr: Box;
};

/** On a wide screen the run reads left to right: backlog, me, the worktrees, the PR. */
const WIDE: Geo = {
  W, H,
  issue: (k) => ({ x: 14, y: 30 + k * 60 }), issueW: 186,
  me: { x: 236, y: 22 }, meSpot: { x: 262, y: 142 }, panel: { x: 236, y: 160, w: 214 },
  laneX: 470, laneW: 380, laneY: (k) => 22 + k * 100, laneSpot: (k) => ({ x: 768, y: 22 + k * 100 + 44 }), reviewTo: { x: 400, y: 150 },
  prHead: { x: 880, y: 0 }, pr: { x: 880, y: 26, w: 196 },
};

/** On a phone it reads top to bottom: the same run, turned on its side. */
const TALL: Geo = {
  W: 340, H: 1130,
  issue: (k) => ({ x: (k % 2) * 172, y: 26 + Math.floor(k / 2) * 58 }), issueW: 168,
  me: { x: 72, y: 214 }, meSpot: { x: 98, y: 330 }, panel: { x: 14, y: 336, w: 326 },
  laneX: 14, laneW: 326, laneY: (k) => 556 + k * 100, laneSpot: (k) => ({ x: 248, y: 556 + k * 100 + 44 }), reviewTo: { x: 140, y: 360 },
  prHead: { x: 0, y: 870 }, pr: { x: 0, y: 896, w: 340 },
};

export function AgentHarness() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const mounted = useMounted();
  // Played at two thirds of the speed it is written in, so each step can be read.
  const t = useSceneClock(LOOP * SLOW, inView, 13 * SLOW) / SLOW;
  const tall = useNarrow();
  const g = tall ? TALL : WIDE;
  const fade = t > LOOP - 0.6 ? (LOOP - t) / 0.6 : 1;

  const reviewing = LANES.find((l) => t >= l.review[0] && t < l.review[1]);
  const meText = t < PICK ? "Next set of tickets"
    : t < TAKE ? "Grouping by meaning"
    : t < GRILL ? "Taking 3 tickets"
    : t < PR_AT ? "/grill-me on the plan"
    : t < SPLIT ? "Spec + PR #230"
    : t < HAND + 0.5 ? "Splitting into worktrees"
    : reviewing ? `Reviewing ${reviewing.part}`
    : t >= ALL_IN && t < NEXT ? "Merging PR #230"
    : t >= NEXT ? "Next set of tickets"
    : "Agents at work";

  const panel = t >= GRILL && t < SPLIT ? "grill" : t >= SPLIT && t < HAND + 0.6 ? "split" : reviewing ? "report" : null;
  const prState = t >= MERGE ? "merged" : t >= ALL_IN ? "ready" : "draft";
  const focus = t < TAKE ? 120 : t < HAND ? 360 : t < 10.8 ? 660 : t < ALL_IN ? 560 : 900;

  return (
    <div ref={ref}>
      <Fit width={g.W} minScale={tall ? 0 : 0.6} focus={tall ? undefined : focus}>
        <div className={cn("ah", tall && "tall")} style={{ width: g.W, height: g.H }}>
          {mounted && <div style={{ opacity: fade }}>
            <svg className="ah-wires" width={g.W} height={g.H} aria-hidden>
              {tall ? <>
                <path d={`M 170 ${g.issue(4).y + 52} L 170 ${g.me.y}`} />
                <path d={`M ${g.me.x} ${g.me.y + 52} H 6 V ${g.laneY(2) + 44}`} />
                {LANES.map((_, k) => <path key={k} d={`M 6 ${g.laneY(k) + 44} H 14`} />)}
                <path d={`M 170 ${g.laneY(2) + 88} V ${g.prHead.y - 6}`} className="faint" />
              </> : <>
                <path d={`M 200 90 L 236 90`} />
                {LANES.map((_, k) => <path key={k} d={`M 432 90 C 452 90, 452 ${g.laneY(k) + 44}, 470 ${g.laneY(k) + 44}`} />)}
                {LANES.map((_, k) => <path key={`o${k}`} d={`M 850 ${g.laneY(k) + 44} C 866 ${g.laneY(k) + 44}, 866 90, 880 90`} className="faint" />)}
              </>}
            </svg>

            <div className="ah-col" style={{ left: 0, top: 0, width: 200 }}><div className="ah-head"><CircleDot className="size-3.5" /> Backlog</div></div>
            {ISSUES.map((is, k) => {
              const picked = is.set && t >= PICK + k * 0.3;
              return <div key={is.id} className={cn("ah-issue", picked && "picked", is.set && t >= TAKE && "taken", !is.set && "more")} style={{ left: g.issue(k).x, top: g.issue(k).y, width: g.issueW }}>
                <b>#{is.id}</b> {is.title}
                {picked && <span className="ah-tag">{t >= PR_AT ? "PR #230" : "payments"}</span>}
              </div>;
            })}

            {tall && !panel && <div className="ah-slot" style={{ left: g.panel.x, top: g.panel.y, width: g.panel.w }}>The plan and the reports show up here</div>}

            <div className="ah-me" style={{ left: g.me.x, top: g.me.y }}>
              <span className="ah-avatar">MT</span>
              <div><b>Me</b><span>Group, plan, review</span></div>
              <div key={meText} className="ah-doing">{meText}</div>
            </div>

            {panel === "grill" && (
              <div className="ah-grill" style={{ left: g.panel.x, top: g.panel.y, width: g.panel.w }}>
                <div className="ah-split-head"><MessagesSquare className="size-3.5" /> /grill-me <span>before a line is written</span></div>
                {QUESTIONS.map((q) => t >= q.at && <div key={q.at} className={cn("ah-q", q.me && "me")}>{q.text}</div>)}
              </div>
            )}
            {panel === "split" && (
              <div className="ah-split" style={{ left: g.panel.x, top: g.panel.y, width: g.panel.w }}>
                <div className="ah-split-head"><GitBranch className="size-3.5" /> PR #230 in three parts</div>
                {LANES.map((ln) => <div key={ln.tree} className="ah-split-row"><b>#{ln.issue}</b> {ln.part}</div>)}
                <p className="ah-split-note">No shared files, so all three run at once.</p>
              </div>
            )}
            {panel === "report" && reviewing && <Report key={reviewing.tree} lane={reviewing} t={t} at={g.panel} />}

            {LANES.map((ln, k) => {
              const s = laneState(ln, k, t);
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
                    : s === "merged" ? <span className="ah-done"><GitMerge className="size-3.5" /> in the feature branch</span>
                    : s === "review" ? <span className="ah-done"><GitPullRequest className="size-3.5" /> in review</span>
                    : s === "waiting" ? <span className="ah-step muted"><GitPullRequest className="size-3.5" /> in my queue</span>
                    : s === "ci" ? <span className={cn("ah-ci", failing && "bad")}>{failing ? <X className="size-3.5" /> : <Check className="size-3.5" />} {failing ? "1 test failed" : fixing ? "fixed" : "CI passing"}</span>
                    : <span className="ah-step">{work < 0.3 ? "Reading the spec" : work < 0.75 ? "Building" : "Writing the report"}</span>}
                  <div className="ah-bar"><i style={{ width: `${Math.round(work * 100)}%` }} /></div>
                </div>
              </div>;
            })}

            <div className="ah-col" style={{ left: g.prHead.x, top: g.prHead.y, width: 200 }}><div className="ah-head"><GitPullRequest className="size-3.5" /> Feature PR</div></div>
            {t >= PR_AT && (
              <div className="ah-pr" style={{ left: g.pr.x, top: g.pr.y, width: g.pr.w }}>
                <div className="ah-pr-head"><b>PR #230</b><span className={cn("ah-pr-state", prState)}>{prState}</span></div>
                <div className="ah-pr-branch">feature/split-bill → main</div>
                <ul>
                  {LANES.map((ln) => {
                    const done = t >= ln.review[1];
                    return <li key={ln.tree} className={cn(done && "in")}>
                      {done ? <Check className="size-3.5" /> : <CircleDot className="size-3.5" />}
                      <span>{ln.part}</span><em>#{ln.issue}</em>
                    </li>;
                  })}
                </ul>
                {t >= MERGE && <div className="ah-merged"><GitMerge className="size-3.5" /> Merged into main, 3 tickets closed</div>}
                {t >= SPEC && (
                  <div className="ah-doc">
                    <FileText className="size-3.5" />
                    <div><b>specs/split-bill.md</b><span>with the answers, for the team</span></div>
                  </div>
                )}
              </div>
            )}

            {/* The three tickets travel to me together and leave as three worktrees. */}
            {t >= TAKE && t < GRILL && (() => {
              const from = { x: g.issue(1).x + 40, y: g.issue(1).y + 8 };
              const at = lerp(from, g.meSpot, ease((t - TAKE) / 0.5));
              return <div className="ah-ticket" style={{ transform: `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)` }}><CircleDot className="size-3.5" /> #212 #214 #216</div>;
            })()}
            {LANES.map((ln, k) => {
              const s = laneState(ln, k, t);
              const hand = HAND + k * 0.15;
              let at: Pt;
              if (s === "hand") at = lerp(g.meSpot, g.laneSpot(k), ease((t - hand) / (ln.work[0] - hand)));
              else if (s === "work" || s === "ci" || s === "waiting") at = g.laneSpot(k);
              else if (s === "review") at = lerp(g.laneSpot(k), g.reviewTo, ease((t - ln.review[0]) / 0.5));
              else return null;
              return <div key={ln.tree} className={cn("ah-ticket", (s === "work" || s === "ci") && "docked", (s === "waiting" || s === "review") && "pr")} style={{ transform: `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)`, opacity: s === "review" ? 1 - clamp((t - ln.review[0] - 0.5) / 0.3) : 1 }}>
                {s === "waiting" || s === "review" ? <GitPullRequest className="size-3.5" /> : <CircleDot className="size-3.5" />} #{ln.issue}
              </div>;
            })}
          </div>}
        </div>
      </Fit>
    </div>
  );
}

function Report({ lane, t, at }: { lane: Lane; t: number; at: Box }) {
  const shown = (i: number) => t > lane.review[0] + 0.4 + i * 0.25;
  return <div className="ah-report" style={{ left: at.x, top: at.y, width: at.w }}>
    <div className="ah-report-head"><GitPullRequest className="size-3.5" /> Report · {lane.part}</div>
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
