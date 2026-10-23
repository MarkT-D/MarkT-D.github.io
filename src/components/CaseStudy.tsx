import { Reveal } from "./Reveal";

export function CaseStudy({
  id,
  index,
  org,
  role,
  period,
  title,
  lede,
  points,
  stack,
  links,
  label,
  children,
}: {
  id: string;
  index: string;
  org: string;
  role: string;
  period: string;
  title: string;
  lede: string;
  points: string[];
  stack: string[];
  links?: { href: string; label: string }[];
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-16 sm:py-20">
      <div className="wrap">
        <Reveal>
          <div className="mb-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[12px] text-gr-6">{index}</span>
                <span className="eyebrow">{org}</span>
                {label && <span className="chip h-6 border-acc-3 bg-acc-1 text-acc-8">{label}</span>}
              </div>
              <h3 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[34px]">{title}</h3>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {role} · {period}
              </p>
            </div>
            <div>
              <p className="text-[17px] leading-[1.65] text-gr-9">{lede}</p>
              <ul className="mt-4 space-y-2">
                {points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-[1.6] text-gr-8">
                    <span className="dot mt-[9px]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {stack.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
              {links && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {links.map((l) => (
                    <a key={l.href} href={l.href} className="text-[14px] font-semibold text-acc-7 underline decoration-acc-3 underline-offset-4 hover:decoration-acc-6" target="_blank" rel="noreferrer">
                      {l.label} →
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>{children}</Reveal>
      </div>
    </section>
  );
}
