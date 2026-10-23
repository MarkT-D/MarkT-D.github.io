import Link from "next/link";
import { notFound } from "next/navigation";
import { NOTES } from "@/lib/notes";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export function generateStaticParams() {
  return NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = NOTES.find((n) => n.slug === slug);
  return { title: note ? `${note.title} · Mark Temchenko` : "Note" };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = NOTES.find((n) => n.slug === slug);
  if (!note) notFound();
  return (
    <>
      <SiteHeader />
      <main className="wrap max-w-[720px] py-14 sm:py-20">
        <Link href="/#notes" className="text-[14px] font-semibold text-acc-7">← All notes</Link>
        <div className="mt-6 flex flex-wrap gap-1.5">{note.tags.map((t) => <span key={t} className="chip h-6">{t}</span>)}</div>
        <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.15] sm:text-[42px]">{note.title}</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">{note.date} · Mark Temchenko</p>
        <article className="mt-10 space-y-5 text-[17px] leading-[1.75] text-gr-9">
          {note.body.map((b, i) =>
            b.h ? (
              <h2 key={i} className="pt-4 text-[21px] font-semibold text-foreground">{b.h}</h2>
            ) : b.code ? (
              <pre key={i} className="overflow-x-auto rounded-xl bg-term p-4 font-mono text-[13px] leading-relaxed text-term-fg">{b.code}</pre>
            ) : (
              <p key={i}>{b.p}</p>
            ),
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
