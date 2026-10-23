"use client";

import { Database, FileSearch, ListTree, Sparkles, Scale, Check } from "lucide-react";
import { useInView, useLoop } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Twin AI's grant pipeline, drawn as it runs. All content is invented: no
 * client, grant or figure here comes from a real application.
 */
const STAGES = [
  { icon: FileSearch, name: "Parse the call", note: "eligibility, sections, word limits" },
  { icon: ListTree, name: "Decompose", note: "one task per section" },
  { icon: Database, name: "Inject context", note: "Salesforce + Bynder, the client's own data" },
  { icon: Sparkles, name: "Draft sections", note: "per-section prompts" },
  { icon: Scale, name: "LLM-as-judge", note: "scores each section against criteria" },
];

const SCORES = [
  { section: "Project summary", score: 9, note: "Clear aim and scope." },
  { section: "Impact", score: 8, note: "Add one number per outcome." },
  { section: "Work plan", score: 6, note: "Milestones have no dates." },
  { section: "Budget justification", score: 8, note: "Cost per participant missing." },
];

export function GrantPipeline() {
  const [ref, inView] = useInView<HTMLDivElement>();
  // 0–4: stages light up, 5–8: judge scores land, 9–10: hold.
  const step = useLoop(13, 900, inView);
  const stageOn = (i: number) => step >= i;
  const scoresShown = Math.max(0, Math.min(SCORES.length, step - 4));

  return (
    <div ref={ref} className="card overflow-hidden p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">Grant application · run #214</span>
        <span className="chip">
          <span className={cn("dot", step < 5 && "bg-gr-5")} />
          {step < 5 ? "Generating" : step < 9 ? "Judging" : "Ready for expert review"}
        </span>
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {STAGES.map(({ icon: Icon, name, note }, i) => (
          <li
            key={name}
            className={cn(
              "relative rounded-xl border p-3 transition-all duration-500",
              stageOn(i) ? "border-acc-3 bg-acc-1" : "border-border bg-gr-1",
            )}
          >
            <Icon className={cn("mb-2 size-5 transition-colors duration-500", stageOn(i) ? "text-acc-7" : "text-gr-6")} />
            <div className="text-[13px] font-semibold leading-tight">{name}</div>
            <div className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{note}</div>
            {i < STAGES.length - 1 && (
              <span aria-hidden className="absolute -right-2 top-1/2 hidden h-px w-2 bg-gr-4 sm:block" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Section</span>
          <span>Judge</span>
        </div>
        <ul>
          {SCORES.map((s, i) => {
            const shown = i < scoresShown;
            return (
              <li key={s.section} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">{s.section}</div>
                  <div className={cn("truncate text-[12px] text-muted-foreground transition-opacity duration-500", shown ? "opacity-100" : "opacity-0")}>
                    {s.note}
                  </div>
                </div>
                <div className="w-28 shrink-0">
                  <div className="h-1.5 overflow-hidden rounded-full bg-gr-2">
                    <div
                      className={cn("h-full rounded-full transition-[width] duration-700", s.score < 7 ? "bg-red-6" : "bg-acc-6")}
                      style={{ width: shown ? `${s.score * 10}%` : "0%" }}
                    />
                  </div>
                </div>
                <span className={cn("w-10 text-right text-[13px] font-semibold tabular-nums transition-opacity duration-500", shown ? "opacity-100" : "opacity-0")}>
                  {s.score}/10
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <Check className="size-4 text-acc-7" /> The expert reviewer gets the draft with every score and note beside it.
      </p>
    </div>
  );
}
