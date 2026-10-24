import Link from "next/link";
import { notFound } from "next/navigation";
import { CASES } from "@/lib/cases";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CASES.find((x) => x.id === slug);
  return { title: c ? `${c.title} · Mark Temchenko` : "Work" };
}

/** A project's full write-up: the copy the home page used to carry. */
export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CASES.find((x) => x.id === slug);
  if (!c) notFound();
  return (
    <>
      <SiteHeader />
      <main className="wrap max-w-[760px] py-14 sm:py-20">
        <Link href={`/#${c.id}`} className="text-[14px] font-semibold text-acc-7">← Back to the work</Link>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12px] text-gr-6">{c.index}</span>
          <span className="eyebrow">{c.org}</span>
          {c.label && <span className="chip h-6 border-acc-3 bg-acc-1 text-acc-8">{c.label}</span>}
        </div>
        <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.15] sm:text-[42px]">{c.title}</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">{c.role} · {c.period}</p>
        <dl className="mt-8 grid grid-cols-3 gap-4">
          {c.stats.map((s) => (
            <div key={s.label} className="border-l-2 border-acc-3 pl-3">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[26px] font-semibold leading-tight text-acc-7">{s.value}</dd>
              <dd className="mt-1 text-[13px] leading-snug text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-[18px] leading-[1.7] text-gr-9">{c.lede}</p>
        <ul className="mt-6 space-y-3">
          {c.points.map((p) => (
            <li key={p} className="flex gap-3 text-[16px] leading-[1.7] text-gr-8">
              <span className="dot mt-[11px]" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-1.5">{c.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        {c.links && (
          <div className="mt-6 flex flex-wrap gap-4">
            {c.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-[14px] font-semibold text-acc-7 underline decoration-acc-3 underline-offset-4">{l.label} →</a>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
