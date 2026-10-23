import Link from "next/link";
import { ArrowRight, Bot, FlaskConical, ShieldCheck, TestTubes } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { HeroVisual } from "@/components/HeroVisual";
import { CaseStudy } from "@/components/CaseStudy";
import { GrantPipeline } from "@/components/GrantPipeline";
import { DeckBuilder } from "@/components/DeckBuilder";
import { MenuPipeline } from "@/components/MenuPipeline";
import { AttentionDemo } from "@/components/AttentionDemo";
import { TracPipeline } from "@/components/TracPipeline";
import { ModelBars } from "@/components/ModelBars";
import { GpuSpeedup } from "@/components/GpuSpeedup";
import { LaptopFrame } from "@/components/LaptopFrame";
import { Reveal } from "@/components/Reveal";
import { NOTES } from "@/lib/notes";
import { asset } from "@/lib/utils";

const STATS = [
  { value: "4", label: "enterprise clients on my grant platform" },
  { value: "days → 2 min", label: "per submission-ready application" },
  { value: "~€360k/yr", label: "estimated labour saved" },
  { value: "2 awards", label: "1st and 2nd place, research projects" },
];

const HOW = [
  {
    icon: FlaskConical,
    title: "Evals come with the feature",
    body: "An LLM judge scoring each grant section against criteria, expected-JSON fixtures for every menu photo, gold sets from domain experts. If I cannot measure it, I do not ship it.",
  },
  {
    icon: Bot,
    title: "Agents do the typing, I do the design",
    body: "I work with Claude Code: issues trigger agents, parallel tasks run in separate git worktrees, a review agent triages tickets, CI runs the tests. I plan the architecture and review every change.",
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

const PARALLEL_FACTS = [
  { value: "2.6 s", label: "a 10-million-point wave equation, 1,000 steps, on one GPU" },
  { value: "7× slower", label: "a 1,000-point wave split over 8 MPI nodes vs one: messages cost more than the maths" },
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
          <div className="wrap grid items-center gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
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
                <a href={asset("/Mark_Temchenko_CV.pdf")} className="btn btn-ghost">Download CV</a>
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

          <CaseStudy
            id="grants"
            index="01"
            org="Twin AI"
            role="AI Automation Engineer"
            period="Mar – Oct 2025"
            title="Grant applications in two minutes, not days"
            lede="Enterprise clients had teams of grant writers drafting by hand. I built the LLM platform that now writes submission-ready applications from each client's own data, with an expert review as the only manual step."
            points={[
              "Owned the pipeline end to end: requirement parsing, task decomposition, context injection, per-section drafting.",
              "Built the Salesforce and Bynder integrations from their API docs, so drafts come from the client's source of truth.",
              "Added an LLM-as-judge stage that derives criteria from the grant's requirements and internal metrics and scores every section 1 to 10 with notes.",
              "Live with 4 enterprise clients. Reused the architecture for an HR screening system on a client's ATS. It now powers the company's main product.",
            ]}
            stack={["Python", "TypeScript", "OpenAI / Claude / Gemini APIs", "Salesforce API", "Bynder API"]}
          >
            <GrantPipeline />
          </CaseStudy>

          <CaseStudy
            id="decks"
            index="02"
            org="Twin AI"
            role="Forward Deployed Engineer"
            period="Nov 2025 – Feb 2026"
            title="A pitch deck from partner data, on demand"
            lede="Embedded with a major international food producer selling in 100+ countries, I owned a presentation generator from discovery to build as the client's primary technical contact."
            points={[
              "Turned a 4 to 5 hour manual workflow into on-demand generation: partner data from several sources, products to pitch, key points, the template filled.",
              "Made the build-vs-extend call: prototyped on Twin's workflow engine, found where its grant assumptions broke, rebuilt standalone as sole developer.",
              "Ran weekly releases and client demos, and onboarded the engineer who took over my previous role.",
            ]}
            stack={["Next.js", "TypeScript", "LLM pipelines", "Client discovery"]}
          >
            <DeckBuilder />
          </CaseStudy>

          <CaseStudy
            id="menu"
            index="03"
            org="Pesto"
            label="Side project"
            role="Full-stack developer"
            period="2026 – now"
            title="From a photo of a paper menu to a menu in any language"
            lede="Pesto is a restaurant platform I build with a small team. Its first step is the one guests never see: a restaurant photographs the menu it already has, and gets a structured, translated digital menu back."
            points={[
              "Google Vision OCR, then Claude with structured output to a strict schema: sections, dishes, prices, allergens, nutrition.",
              "The OCR stage and the LLM stage are each tested on their own against expected JSON for a set of menu photos.",
              "Translation into any language, up to 10 per menu, batched, with the quoting bug in the notes below fixed for good.",
            ]}
            stack={["Next.js 16", "TypeScript", "Supabase / Postgres", "Google Vision", "Claude API", "Playwright"]}
          >
            <MenuPipeline />
          </CaseStudy>

          <CaseStudy
            id="quotaclimat"
            index="04"
            org="QuotaClimat × University of Amsterdam"
            label="Capstone"
            role="Technical Lead & ML Engineer"
            period="Feb – Jun 2026"
            title="How 781 outlets frame the climate crisis"
            lede="QuotaClimat, a French media watchdog, files evidence with the regulator ARCOM. I led a team of five building the tool behind that evidence: a scraper, a classifier pipeline and a dashboard."
            points={[
              "Set targets with the partner, and beat the keyword classifier they used before.",
              "GPT-5-mini labelled the corpus. We validated those labels against human annotators and distilled them into multilingual XLM-RoBERTa classifiers.",
              "Macro F1 0.82 in French, and within ~11% of that in the other languages tested.",
              "Owned the architecture: a session-parallel scraper (~2k articles/hr), Postgres, FastAPI, a Next.js dashboard, Docker. 2nd place, Environmental Award.",
            ]}
            stack={["Python", "PyTorch", "XLM-RoBERTa", "FastAPI", "Next.js", "PostgreSQL", "Docker"]}
            links={[{ href: "https://github.com/MarkT-D/quotaclimat-media-framing", label: "Code on GitHub" }]}
          >
            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <LaptopFrame>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset("/img/dashboard.png")} alt="QuotaClimat dashboard with frame distribution and sector charts" className="block w-full" />
              </LaptopFrame>
              <AttentionDemo />
            </div>
          </CaseStudy>

          <CaseStudy
            id="tracfm"
            index="05"
            org="TRAC FM × University of Amsterdam"
            label="System design · proof of concept"
            role="Pipeline design"
            period="2026"
            title="Radio call-ins in Ugandan languages, as themes on a dashboard"
            lede="TRAC FM runs radio polls in Uganda. Listeners call in and answer in their own languages, often over noisy lines. I designed the pipeline that turns those clips into English text, groups the answers by meaning, and shows them per question and region."
            points={[
              "Model-agnostic by design: cleaning, transcription, translation and grouping are each swappable.",
              "A benchmark harness: add a provider and a model, and it runs the gold set and appends a column, with WER for transcripts and expert-validated translations as the reference.",
              "Containerised services from ingest to dashboard, so a better model is a configuration change.",
            ]}
            stack={["Whisper", "FFmpeg", "WebRTC VAD", "Embeddings + HDBSCAN", "LLM translation", "React", "Docker"]}
          >
            <TracPipeline />
          </CaseStudy>

          <CaseStudy
            id="xplorit"
            index="06"
            org="OceansX × University of Amsterdam"
            label="Partner project"
            role="Machine Learning Engineer"
            period="Sep 2024 – Feb 2025"
            title="What well-being sounds like, in 600 hours of video"
            lede="With a supervising PhD researcher, my team of four turned ~600 hours of interviews and YouTube videos into a labelled corpus and compared three model families on it."
            points={[
              "Scraping and transcription pipeline: BeautifulSoup, Selenium, OpenAI Whisper.",
              "LIME and SHAP to show which expressions the models tied to well-being, the deliverable the researcher needed.",
              "Hosted on Hugging Face with an interactive demo. 1st place in the Well-Being track.",
            ]}
            stack={["PyTorch", "Hugging Face", "scikit-learn", "Whisper", "LIME", "SHAP"]}
            links={[{ href: "https://github.com/MarkT-D/XplorIT", label: "Code on GitHub" }]}
          >
            <div className="card grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              <ModelBars />
              <div className="rounded-xl bg-gr-2 p-4 text-[13.5px] leading-relaxed text-gr-8">
                <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Pipeline</div>
                YouTube search → audio → Whisper transcripts → keyword filters → labelled corpus → BERT · SVM · Random Forest → LIME / SHAP
              </div>
            </div>
          </CaseStudy>
        </div>

        {/* Foundations */}
        <section id="foundations" className="scroll-mt-16 border-t border-border py-16 sm:py-20">
          <div className="wrap">
            <p className="eyebrow">Beyond the degree</p>
            <h2 className="mt-2 max-w-3xl font-display text-[34px] font-semibold leading-tight sm:text-[40px]">My BSc was light on maths and systems, so I added master&apos;s-level courses</h2>
            <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <ul className="space-y-5">
                  {COURSES.map((c) => (
                    <li key={c.name} className="border-l-2 border-acc-3 pl-4">
                      <div className="text-[16px] font-semibold">{c.name}</div>
                      <p className="mt-1 text-[14.5px] leading-[1.6] text-gr-8">{c.body}</p>
                    </li>
                  ))}
                </ul>
                <dl className="mt-8 grid grid-cols-2 gap-3">
                  {PARALLEL_FACTS.map((f) => (
                    <div key={f.label} className="card p-4">
                      <dd className="font-display text-[22px] font-semibold">{f.value}</dd>
                      <dt className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{f.label}</dt>
                    </div>
                  ))}
                </dl>
              </Reveal>
              <Reveal delay={120}>
                <GpuSpeedup />
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
            <h2 className="mt-2 max-w-2xl font-display text-[34px] font-semibold leading-tight sm:text-[40px]">Four habits that make AI features hold up in production</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
            <h2 className="mt-2 font-display text-[34px] font-semibold sm:text-[40px]">Bugs worth writing down</h2>
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
      </main>
      <SiteFooter />
    </>
  );
}
