import Link from "next/link";
import { ArrowRight, FlaskConical, ShieldCheck, TestTubes } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { HeroVisual } from "@/components/HeroVisual";
import { CaseStudy } from "@/components/CaseStudy";
import { caseById } from "@/lib/cases";
import { GrantFactory } from "@/components/iso/GrantFactory";
import { DeckGenerator } from "@/components/DeckGenerator";
import { PestoStory } from "@/components/PestoStory";
import { QuotaShots } from "@/components/QuotaShots";
import { TracScene } from "@/components/TracScene";
import { OceansScene } from "@/components/OceansScene";
import { GpuStory } from "@/components/GpuStory";
import { Reveal } from "@/components/Reveal";
import { Fit } from "@/components/Fit";
import { Contact } from "@/components/Contact";
import { AgentHarness } from "@/components/AgentHarness";
import { NOTES } from "@/lib/notes";

const STATS = [
  { value: "1.5 yrs", label: "shipping LLM systems at an AI startup, promoted to FDE" },
  { value: "8.0 / 9 GPA", label: "BSc Computational Social Science, University of Amsterdam" },
  { value: "Teams of 5 and 4", label: "led on partner projects, both awarded" },
  { value: "EU citizen", label: "based in Barcelona, no visa or sponsorship needed" },
];

const HOW = [
  {
    icon: FlaskConical,
    title: "Evals come with the feature",
    body: "An LLM judge scoring each grant section against criteria, expected-JSON fixtures for every menu photo, gold sets from domain experts. If I cannot measure it, I do not ship it.",
  },
  {
    icon: ShieldCheck,
    title: "Rules live where they cannot be skipped",
    body: "Order totals, payment state and permissions in Pesto are database triggers and policies, not app code. A webhook, a worker and psql all obey the same rules, and parity tests catch drift.",
  },
  {
    icon: TestTubes,
    title: "Test the real thing",
    body: "Pesto's end-to-end suite runs a whole restaurant shift in a real browser against the real database. Only the OCR and the LLM are faked, at the network boundary. The app has no test mode.",
  },
];

const COURSES = [
  {
    name: "Distributed & Parallel Programming",
    body: "CUDA in C on the DAS-5 supercomputer's GPUs, plus pthreads, OpenMP, MPI across nodes and a Spark cluster in Docker.",
  },
  { name: "Advanced Calculus", body: "The analysis under optimisation and gradient-based learning." },
  { name: "Probability Theory", body: "Stochastic processes and sampling distributions, the base for evaluation and uncertainty." },
];

const TOOLBOX = [
  { group: "LLMs & ML", items: ["OpenAI · Claude · Gemini APIs", "Structured output", "LLM-as-judge", "PyTorch", "Hugging Face", "scikit-learn", "Whisper", "Google Vision OCR"] },
  { group: "Product engineering", items: ["TypeScript", "React", "Next.js", "Node.js", "NestJS", "FastAPI", "Flask", "PostgreSQL", "Supabase"] },
  { group: "Infrastructure", items: ["Docker", "AWS: S3, RDS, API Gateway", "Vercel", "CI pipelines", "Linux"] },
  { group: "Parallel & systems", items: ["C", "CUDA", "OpenMP", "pthreads", "MPI", "Spark"] },
  { group: "How I work", items: ["Claude Code agents", "git worktrees", "Playwright", "Vitest"] },
];

const EARLIER = [
  { year: "2022–23", title: "Co-founder, Altai Electronics", body: "An e-commerce shop on OZON. Built a supply chain across three Chinese manufacturing regions. ~€27k revenue at ~60% margins." },
  { year: "2022", title: "CTF olympiad for Moscow schools", body: "Designed 23 capture-the-flag security challenges for the city olympiad. Teams from 20 schools in its first year." },
  { year: "2021", title: "Reporting app, European Gymnasium", body: "Rebuilt the school's marking and reporting on top of its existing system's API. Report creation went from ~40 minutes to a seventh of that." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="grid-backdrop" />
          <div className="wrap grid items-center gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pb-24">
            <div className="animate-rise-in">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="chip"><span className="dot" /> Open to AI Engineer roles</span>
                <span className="chip">Barcelona</span>
              </div>
              <h1 className="font-display text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[60px]">
                I take LLM systems from a client&apos;s problem to <span className="text-acc-6">production.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[18px] leading-[1.6] text-gr-8">
                AI Engineer and Forward Deployed Engineer. At Twin AI I built LLM pipelines for enterprise clients and owned a client&apos;s product end to end. Before that, NLP and ML projects with research partners, two of them award-winning.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#work" className="btn btn-primary">See the work <ArrowRight className="size-4" /></Link>
                <Link href="#contact" className="btn btn-ghost">Get in touch</Link>
              </div>
            </div>
            <div className="animate-rise-in [animation-delay:150ms]">
              <HeroVisual />
            </div>
          </div>
          <div className="wrap pb-16">
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="card p-4 sm:p-5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-[24px] font-semibold leading-tight sm:text-[28px]">{s.value}</dd>
                  <dd className="mt-1 text-[13px] leading-snug text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Work */}
        <div id="work" className="scroll-mt-16">
          <div className="wrap pb-2 pt-6">
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-2 font-display text-[34px] font-semibold sm:text-[40px]">What I built, and how it runs</h2>
          </div>

          <CaseStudy c={caseById("grants")} side>
            <div className="card overflow-hidden p-3 sm:p-5">
              <Fit width={600}><GrantFactory /></Fit>
            </div>
          </CaseStudy>

          <CaseStudy c={caseById("decks")} side>
            <div className="card overflow-visible p-4 sm:p-5">
              <DeckGenerator />
            </div>
          </CaseStudy>

          <CaseStudy c={caseById("menu")}>
            <div className="card p-4">
              <PestoStory />
            </div>
          </CaseStudy>

          <CaseStudy c={caseById("quotaclimat")} side>
            <QuotaShots />
          </CaseStudy>

          <CaseStudy c={caseById("tracfm")}>
            <div className="card p-4 sm:p-5">
              <TracScene />
            </div>
          </CaseStudy>

          <CaseStudy c={caseById("xplorit")}>
            <div className="card p-4 sm:p-6">
              <OceansScene />
            </div>
          </CaseStudy>
        </div>

        {/* Foundations */}
        <section id="foundations" className="scroll-mt-14 border-t border-border py-12 sm:py-14">
          <div className="wrap">
            <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 [&>*]:min-w-0">
              <Reveal>
                <p className="eyebrow">Beyond the degree</p>
                <h2 className="mt-2 font-display text-[26px] font-semibold leading-tight sm:text-[30px]">My BSc was light on maths and systems, so I added master&apos;s-level courses</h2>
                <ul className="mt-5 space-y-3.5">
                  {COURSES.map((c) => (
                    <li key={c.name} className="border-l-2 border-acc-3 pl-4">
                      <div className="text-[15px] font-semibold">{c.name}</div>
                      <p className="mt-0.5 text-[14px] leading-[1.55] text-gr-8">{c.body}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={120}>
                <div className="card p-3 sm:p-5">
                  <div className="mb-3 px-1 text-[15px] font-semibold">What I programmed on DAS-5</div>
                  <GpuStory />
                </div>
              </Reveal>
            </div>
            <div className="mt-14">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Toolbox</h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {TOOLBOX.map((t) => (
                  <div key={t.group}>
                    <div className="mb-2 text-[14px] font-semibold">{t.group}</div>
                    <div className="flex flex-wrap gap-1.5">{t.items.map((i) => <span key={i} className="chip">{i}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How I build */}
        <section id="how" className="scroll-mt-16 border-t border-border bg-gr-2 py-16 sm:py-20">
          <div className="wrap">
            <p className="eyebrow">How I build</p>
            <h2 className="mt-2 max-w-3xl font-display text-[34px] font-semibold leading-tight sm:text-[40px]">AI-native: I design and review, agents do the typing</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-gr-8">I write the spec and split the work. Agents build each piece in its own worktree and report back. I review, and the spec ships with the code.</p>
            <Reveal className="mt-8">
              <div className="card p-4 sm:p-6"><AgentHarness /></div>
            </Reveal>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {HOW.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="card h-full p-6">
                    <span className="grid size-10 place-items-center rounded-xl bg-acc-1 text-acc-7"><Icon className="size-5" /></span>
                    <h3 className="mt-4 text-[18px] font-semibold">{title}</h3>
                    <p className="mt-2 text-[15px] leading-[1.65] text-gr-8">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Notes */}
        <section id="notes" className="scroll-mt-16 border-t border-border py-16 sm:py-20">
          <div className="wrap">
            <p className="eyebrow">Notes</p>
            <h2 className="mt-2 font-display text-[34px] font-semibold sm:text-[40px]">What went wrong, and what I changed</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {NOTES.map((n, i) => (
                <Reveal key={n.slug} delay={i * 80}>
                  <Link href={`/notes/${n.slug}/`} className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
                    <div className="flex flex-wrap gap-1.5">{n.tags.map((t) => <span key={t} className="chip h-6">{t}</span>)}</div>
                    <h3 className="mt-4 text-[18px] font-semibold leading-snug group-hover:text-acc-7">{n.title}</h3>
                    <p className="mt-2 flex-1 text-[14.5px] leading-[1.6] text-gr-8">{n.teaser}</p>
                    <span className="mt-5 text-[13px] font-semibold text-acc-7">Read →</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Earlier */}
        <section className="border-t border-border py-16">
          <div className="wrap">
            <p className="eyebrow">Earlier</p>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {EARLIER.map((e) => (
                <li key={e.title} className="border-l-2 border-acc-3 pl-4">
                  <div className="font-mono text-[12px] text-gr-6">{e.year}</div>
                  <div className="mt-1 text-[16px] font-semibold">{e.title}</div>
                  <p className="mt-1 text-[14px] leading-[1.6] text-gr-8">{e.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[14px] text-muted-foreground">
              BSc Computational Social Science, University of Amsterdam, 2026 · GPA 8.0/9 · Mathematics of ML, plus the master&apos;s-level courses above
            </p>
          </div>
        </section>
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
