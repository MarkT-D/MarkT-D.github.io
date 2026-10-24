import Link from "next/link";
import { ArrowRight, Bot, FlaskConical, ShieldCheck, TestTubes } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { HeroVisual } from "@/components/HeroVisual";
import { CaseStudy } from "@/components/CaseStudy";
import { GrantFactory } from "@/components/iso/GrantFactory";
import { DeckGenerator } from "@/components/DeckGenerator";
import { MenuOnboarding } from "@/components/MenuOnboarding";
import { TaskGraph } from "@/components/TaskGraph";
import { QuotaShots } from "@/components/QuotaShots";
import { TracScene } from "@/components/TracScene";
import { OceansScene } from "@/components/OceansScene";
import { GpuSpeedup } from "@/components/GpuSpeedup";
import { GpuNode } from "@/components/iso/GpuNode";
import { Reveal } from "@/components/Reveal";
import { Fit } from "@/components/Fit";
import { Contact } from "@/components/Contact";
import { NOTES } from "@/lib/notes";
import { asset } from "@/lib/utils";

const STATS = [
  { value: "1.5 yrs", label: "shipping LLM systems at an AI startup, promoted to FDE" },
  { value: "~€360k/yr", label: "labour saved for clients by my grant platform (est.)" },
  { value: "Teams of 5 & 4", label: "led on partner projects, both awarded" },
  { value: "EU citizen", label: "based in Barcelona, no visa or sponsorship needed" },
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
            lede="Enterprise clients had grant writers drafting by hand for days. We built an LLM platform that writes submission-ready applications from the grant's own rules and the client's documents. An expert review is the only manual step."
            points={[
              "The pipeline parses the grant call, splits it into its sections and drafts each one with its own prompt.",
              "Context from two sides: the grant's guidelines and EU rules, and RAG over the client's own documents, plus partner sources when there were any.",
              "An LLM judge scores every section 1 to 10 and flags where company guidelines pull against a grant rule. The expert settles those, then approves.",
              "Model-agnostic, with Azure-hosted EU models for data residency. Live with 4 enterprise clients, and reused for HR screening on a client's ATS.",
            ]}
            stack={["Python", "TypeScript", "OpenAI / Claude / Gemini APIs", "Azure OpenAI (EU)", "RAG"]}
            side
          >
            <div className="card overflow-hidden p-3 sm:p-5">
              <Fit width={600}><GrantFactory /></Fit>
            </div>
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
              "Turned a 4 to 5 hour manual workflow into on-demand generation. The model picks what to pitch from the partner's account and orders in Salesforce, pulls the SKU, EAN and price from the catalogue and an approved shot from Bynder.",
              "Every slide carries speaker notes saying why each part was chosen, with the record ids to check it by, so the account manager can trust it or fix it fast.",
              "Made the build-vs-extend call: prototyped on Twin's workflow engine, found where its grant assumptions broke, rebuilt standalone as sole developer.",
              "Ran weekly releases and client demos, and onboarded the engineer who took over my previous role.",
            ]}
            stack={["Next.js", "TypeScript", "Salesforce API", "Bynder API", "LLM pipelines", "Client discovery"]}
          >
            <div className="card overflow-visible p-4 sm:p-7">
              <DeckGenerator />
            </div>
          </CaseStudy>

          <CaseStudy
            id="menu"
            index="03"
            org="Pesto"
            label="Side project"
            role="Full-stack developer"
            period="2026 – now"
            title="One system for everything a restaurant runs, and AI for the typing"
            lede="Restaurants juggle a menu tool, a till, a kitchen printer, a payment terminal and a fiscal register, and still type the menu in by hand. Pesto is a restaurant platform I build with a small team that puts all of it in one system. My focus is the AI that does the typing."
            points={[
              "A photo of the paper menu becomes a structured menu: Google Vision OCR, then Claude with structured output to a strict schema, with sections, prices, allergens and nutrition.",
              "Parsing starts with the first photographed page and runs while the owner goes through onboarding. Translations run while they check the dishes, and an edited dish is translated again.",
              "Each stage is tested on its own against expected JSON for real menu photos. Translation is tested on awkward names: quotes, Cyrillic, accents.",
            ]}
            stack={["Next.js 16", "TypeScript", "Supabase / Postgres", "Google Vision", "Claude API", "Playwright"]}
          >
            <div className="card p-4 sm:p-7">
              <TaskGraph />
            </div>
            <div className="card mt-6 p-4 sm:p-7">
              <MenuOnboarding />
            </div>
          </CaseStudy>

          <CaseStudy
            id="quotaclimat"
            index="04"
            org="QuotaClimat × University of Amsterdam"
            label="Capstone"
            role="Technical Lead & ML Engineer"
            period="Feb – Jun 2026"
            title="How 781 outlets frame the climate crisis"
            lede="QuotaClimat, a French media watchdog, files evidence with the regulator ARCOM. I led a team of five building the tool behind it: a scraper, a classifier pipeline and a dashboard."
            points={[
              "GPT-5-mini labelled the corpus. We checked those labels against human annotators and distilled them into multilingual XLM-RoBERTa classifiers that beat the partner's keyword baseline.",
              "Macro F1 0.82 in French, within ~11% of that in the other languages tested. Calibrated per frame, so a score means what it says.",
              "Owned the architecture: a session-parallel scraper (~2k articles/hr), Postgres, FastAPI, a Next.js dashboard, Docker. 2nd place, Environmental Award.",
            ]}
            stack={["Python", "PyTorch", "XLM-RoBERTa", "FastAPI", "Next.js", "PostgreSQL", "Docker"]}
            links={[{ href: "https://github.com/MarkT-D/quotaclimat-media-framing", label: "Code on GitHub" }]}
            side
          >
            <QuotaShots />
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
            <div className="card p-4 sm:p-6">
              <TracScene />
            </div>
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
            <div className="card p-4 sm:p-6">
              <OceansScene />
            </div>
          </CaseStudy>
        </div>

        {/* Foundations */}
        <section id="foundations" className="scroll-mt-16 border-t border-border py-16 sm:py-20">
          <div className="wrap">
            <div className="grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10 [&>*]:min-w-0">
              <Reveal>
                <p className="eyebrow">Beyond the degree</p>
                <h2 className="mt-2 font-display text-[30px] font-semibold leading-tight sm:text-[34px]">My BSc was light on maths and systems, so I added master&apos;s-level courses</h2>
                <ul className="mt-7 space-y-5">
                  {COURSES.map((c) => (
                    <li key={c.name} className="border-l-2 border-acc-3 pl-4">
                      <div className="text-[16px] font-semibold">{c.name}</div>
                      <p className="mt-1 text-[14.5px] leading-[1.6] text-gr-8">{c.body}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[14.5px] leading-[1.6] text-gr-8">
                  The lesson I kept from the GPU labs: the kernel was 83× faster than the CPU, but copying the data over PCIe ate most of that. End to end it was about 15×, and below roughly 40 KB the CPU won.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <div className="card p-3 sm:p-5">
                  <div className="mb-1 px-1 text-[15px] font-semibold">One DAS-5 node, a 525 MB job</div>
                  <p className="mb-2 px-1 text-[12.5px] text-muted-foreground">Data crosses PCIe, the GPU&apos;s thread blocks run the kernel, the result comes back. Timed like the real run.</p>
                  <Fit width={600}><GpuNode /></Fit>
                </div>
              </Reveal>
            </div>
            <Reveal className="mt-8">
              <GpuSpeedup />
            </Reveal>

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
