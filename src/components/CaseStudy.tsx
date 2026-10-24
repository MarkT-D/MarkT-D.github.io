import Link from "next/link";
import { Reveal } from "./Reveal";
import type { Case } from "@/lib/cases";

/**
 * One project on the home page: a sentence, three numbers and the visual.
 * The full write-up lives on the project's own page, linked as "Full story".
 */
export function CaseStudy({
  c,
  side,
  children,
}: {
  c: Case;
  /** Text on the left, the visual on the right, sized to fit one screen. */
  side?: boolean;
  children: React.ReactNode;
}) {
  const head = (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] text-gr-6">{c.index}</span>
        <span className="eyebrow">{c.org}</span>
        {c.label && <span className="chip h-6 border-acc-3 bg-acc-1 text-acc-8">{c.label}</span>}
      </div>
      <h3 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[32px]">{c.title}</h3>
      <p className="mt-2 text-[14px] text-muted-foreground">{c.role} · {c.period}</p>
    </div>
  );
  const body = (
    <div>
      <p className="text-[17px] leading-[1.6] text-gr-9">{c.short}</p>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {c.stats.map((s) => (
          <div key={s.label} className="border-l-2 border-acc-3 pl-3">
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-[22px] font-semibold leading-tight text-acc-7 sm:text-[26px]">{s.value}</dd>
            <dd className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{s.label}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {c.stack.map((s) => <span key={s} className="chip h-6 text-[12px]">{s}</span>)}
        <Link href={`/work/${c.id}/`} className="ml-2 text-[14px] font-semibold text-acc-7 underline decoration-acc-3 underline-offset-4 hover:decoration-acc-6">Full story →</Link>
        {c.links?.map((l) => (
          <a key={l.href} href={l.href} className="ml-2 text-[14px] font-semibold text-acc-7 underline decoration-acc-3 underline-offset-4 hover:decoration-acc-6" target="_blank" rel="noreferrer">
            {l.label} →
          </a>
        ))}
      </div>
    </div>
  );

  if (side) {
    return (
      <section id={c.id} className="scroll-mt-24 border-t border-border py-14 sm:py-16">
        <div className="wrap grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10 [&>*]:min-w-0">
          <Reveal>
            <div className="space-y-5">
              {head}
              {body}
            </div>
          </Reveal>
          <Reveal delay={120}>{children}</Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id={c.id} className="scroll-mt-14 border-t border-border py-10">
      <div className="wrap">
        <Reveal>
          <div className="mb-5 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
            {head}
            {body}
          </div>
        </Reveal>
        <Reveal delay={120}>{children}</Reveal>
      </div>
    </section>
  );
}
