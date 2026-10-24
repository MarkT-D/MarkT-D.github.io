/**
 * The work, as data. The home page shows `short` and `stats`; each project's
 * own page (/work/<id>/) keeps the full write-up: `lede`, `points`, `stack`.
 * The long copy is the previous version of the home page, kept on purpose.
 */
export type Case = {
  id: string;
  index: string;
  org: string;
  label?: string;
  role: string;
  period: string;
  title: string;
  /** One sentence for the home page. */
  short: string;
  /** Three numbers that carry the project. */
  stats: { value: string; label: string }[];
  lede: string;
  points: string[];
  stack: string[];
  links?: { href: string; label: string }[];
};

export const CASES: Case[] = [
  {
    id: "grants",
    index: "01",
    org: "Twin AI",
    role: "AI Automation Engineer",
    period: "Mar – Oct 2025",
    title: "Grant applications in two minutes, not days",
    short: "An LLM platform that drafts grant applications from the grant's rules and the client's own documents.",
    stats: [
      { value: "2 min", label: "per application, down from days" },
      { value: "4", label: "enterprise clients live" },
      { value: "1 to 10", label: "LLM-judge score on every section" },
    ],
    lede: "Enterprise clients had grant writers drafting by hand for days. We built an LLM platform that writes submission-ready applications from the grant's own rules and the client's documents. An expert review is the only manual step.",
    points: [
      "The pipeline parses the grant call, splits it into its sections and drafts each one with its own prompt.",
      "Context from two sides: the grant's guidelines and EU rules, and RAG over the client's own documents, plus partner sources when there were any.",
      "An LLM judge scores every section 1 to 10 and flags where company guidelines pull against a grant rule. The expert settles those, then approves.",
      "Model-agnostic, with Azure-hosted EU models for data residency. Live with 4 enterprise clients, and reused for HR screening on a client's ATS.",
    ],
    stack: ["Python", "TypeScript", "OpenAI / Claude / Gemini APIs", "Azure OpenAI (EU)", "RAG"],
  },
  {
    id: "decks",
    index: "02",
    org: "Twin AI",
    role: "Forward Deployed Engineer",
    period: "Nov 2025 – Feb 2026",
    title: "A pitch deck from partner data, on demand",
    short: "A generator that builds a partner's pitch deck from Salesforce, the product catalogue and Bynder, with a reason for every choice.",
    stats: [
      { value: "4–5 h", label: "of manual work per deck, now on demand" },
      { value: "3", label: "systems wired in" },
      { value: "Solo", label: "from discovery to weekly releases" },
    ],
    lede: "Embedded with a major international food producer selling in 100+ countries, I owned their presentation generator from discovery to build, as the main technical contact.",
    points: [
      "Took a 4 to 5 hour manual job to on-demand. The model picks the product from the partner's Salesforce account, then pulls SKU and price from the catalogue and an approved shot from Bynder.",
      "Speaker notes give the reason for every choice, with the record ids, so the account manager can check it in a minute.",
      "Made the build-vs-extend call: prototyped on Twin's workflow engine, then rebuilt it standalone as sole developer, with weekly releases and demos.",
    ],
    stack: ["Next.js", "TypeScript", "Salesforce API", "Bynder API", "LLM pipelines", "Client discovery"],
  },
  {
    id: "menu",
    index: "03",
    org: "Pesto",
    label: "Side project",
    role: "Full-stack developer",
    period: "2026 – now",
    title: "One system for everything a restaurant runs, and AI for the typing",
    short: "A restaurant platform that puts menu, till, kitchen and payments in one system. I build the AI that does the typing.",
    stats: [
      { value: "1 photo", label: "of the paper menu becomes a structured menu" },
      { value: "10", label: "languages per menu, translated while you edit" },
      { value: "0 s", label: "waiting: parsing runs behind onboarding" },
    ],
    lede: "Restaurants juggle a menu tool, a till, a kitchen printer, a payment terminal and a fiscal register, and still type the menu in by hand. Pesto is a restaurant platform I build with a small team that puts all of it in one system. My focus is the AI that does the typing.",
    points: [
      "A photo of the paper menu becomes a structured menu: Google Vision OCR, then Claude with structured output to a strict schema, with sections, prices, allergens and nutrition.",
      "Parsing starts with the first photographed page and runs while the owner goes through onboarding. Translations run while they check the dishes, and an edited dish is translated again.",
      "Each stage is tested on its own against expected JSON for real menu photos. Translation is tested on awkward names: quotes, Cyrillic, accents.",
    ],
    stack: ["Next.js 16", "TypeScript", "Supabase / Postgres", "Google Vision", "Claude API", "Playwright"],
  },
  {
    id: "quotaclimat",
    index: "04",
    org: "QuotaClimat × University of Amsterdam",
    label: "Capstone",
    role: "Technical Lead & ML Engineer",
    period: "Feb – Jun 2026",
    title: "How 781 outlets frame the climate crisis",
    short: "The scraper, classifiers and dashboard behind a French media watchdog's evidence to the regulator. I led a team of five.",
    stats: [
      { value: "0.82", label: "macro F1 in French" },
      { value: "~20k", label: "articles classified" },
      { value: "2nd", label: "place, Environmental Award" },
    ],
    lede: "QuotaClimat, a French media watchdog, files evidence with the regulator ARCOM. I led a team of five building the tool behind it: a scraper, a classifier pipeline and a dashboard.",
    points: [
      "GPT-5-mini labelled the corpus. We checked those labels against human annotators and distilled them into multilingual XLM-RoBERTa classifiers that beat the partner's keyword baseline.",
      "Macro F1 0.82 in French, within ~11% of that in the other languages tested. Calibrated per frame, so a score means what it says.",
      "Owned the architecture: a session-parallel scraper (~2k articles/hr), Postgres, FastAPI, a Next.js dashboard, Docker. 2nd place, Environmental Award.",
    ],
    stack: ["Python", "PyTorch", "XLM-RoBERTa", "FastAPI", "Next.js", "PostgreSQL", "Docker"],
    links: [{ href: "https://github.com/MarkT-D/quotaclimat-media-framing", label: "Code on GitHub" }],
  },
  {
    id: "tracfm",
    index: "05",
    org: "TRAC FM × University of Amsterdam",
    label: "System design · proof of concept",
    role: "Pipeline design",
    period: "2026",
    title: "Radio call-ins in Ugandan languages, as themes on a dashboard",
    short: "A pipeline design that turns radio call-ins in Ugandan languages into English themes, per question and region.",
    stats: [
      { value: "6", label: "stages, each with a swappable model" },
      { value: "1 column", label: "per new model in the benchmark" },
      { value: "WER", label: "against the anthropologists' gold set" },
    ],
    lede: "TRAC FM runs radio polls in Uganda. Listeners call in and answer in their own languages, often over noisy lines. I designed the pipeline that turns those clips into English text, groups the answers by meaning, and shows them per question and region.",
    points: [
      "Model-agnostic by design: cleaning, transcription, translation and grouping are each swappable.",
      "A benchmark harness: add a provider and a model, and it runs the gold set and appends a column, with WER for transcripts and expert-validated translations as the reference.",
      "Containerised services from ingest to dashboard, so a better model is a configuration change.",
    ],
    stack: ["Whisper", "FFmpeg", "WebRTC VAD", "Embeddings + HDBSCAN", "LLM translation", "React", "Docker"],
  },
  {
    id: "xplorit",
    index: "06",
    org: "OceansX × University of Amsterdam",
    label: "Partner project",
    role: "Machine Learning Engineer",
    period: "Sep 2024 – Feb 2025",
    title: "What well-being sounds like, in 600 hours of interviews",
    short: "Three model families on ~600 hours of interviews, mostly with sailors, and LIME and SHAP to show why they decided.",
    stats: [
      { value: "0.89", label: "F1, BERT" },
      { value: "600 h", label: "of interviews transcribed" },
      { value: "1st", label: "place, Well-Being track" },
    ],
    lede: "Supervised by a Full Professor of Genetics and Wellbeing on XplorIT's board, my team of four turned ~600 hours of interviews, mostly with sailors, into a labelled corpus and compared three model families on it.",
    points: [
      "Scraping and transcription pipeline: BeautifulSoup, Selenium, OpenAI Whisper.",
      "LIME and SHAP to show which expressions the models tied to well-being, the deliverable our supervisor needed.",
      "Hosted on Hugging Face with an interactive demo. 1st place in the Well-Being track.",
    ],
    stack: ["PyTorch", "Hugging Face", "scikit-learn", "Whisper", "LIME", "SHAP"],
    links: [{ href: "https://github.com/MarkT-D/XplorIT", label: "Code on GitHub" }],
  },
];

export const caseById = (id: string) => CASES.find((c) => c.id === id)!;
