/**
 * The toolbox as evidence: each tool lists the projects on this page that
 * used it. Ids are the case ids in cases.ts, plus "das5" for the CUDA and
 * MPI coursework in the foundations section. Keep it honest: a dot means the
 * project shipped with that tool, not that it could have.
 */

export type ToolProject = { id: string; index: string; name: string; href: string };

export const TOOL_PROJECTS: ToolProject[] = [
  { id: "grants", index: "01", name: "Grant platform", href: "#grants" },
  { id: "decks", index: "02", name: "Deck generator", href: "#decks" },
  { id: "menu", index: "03", name: "Pesto", href: "#menu" },
  { id: "quotaclimat", index: "04", name: "QuotaClimat", href: "#quotaclimat" },
  { id: "tracfm", index: "05", name: "TRAC FM", href: "#tracfm" },
  { id: "xplorit", index: "06", name: "XplorIT", href: "#xplorit" },
  { id: "das5", index: "C", name: "DAS-5 course", href: "#foundations" },
];

export type ToolGroup = { name: string; tools: { name: string; used: string[] }[] };

export const TOOL_GROUPS: ToolGroup[] = [
  {
    name: "AI and ML",
    tools: [
      { name: "OpenAI · Claude · Gemini APIs", used: ["grants", "decks", "menu", "quotaclimat", "tracfm"] },
      { name: "Structured output", used: ["decks", "menu"] },
      { name: "PyTorch", used: ["quotaclimat", "xplorit"] },
      { name: "Hugging Face", used: ["quotaclimat", "xplorit"] },
      { name: "Whisper", used: ["tracfm", "xplorit"] },
      { name: "LLM-as-judge", used: ["grants"] },
      { name: "RAG", used: ["grants"] },
      { name: "OCR (Google Vision)", used: ["menu"] },
      { name: "Embeddings + clustering", used: ["tracfm"] },
      { name: "scikit-learn", used: ["xplorit"] },
      { name: "LIME · SHAP", used: ["xplorit"] },
    ],
  },
  {
    name: "Engineering",
    tools: [
      { name: "Python", used: ["grants", "quotaclimat", "tracfm", "xplorit"] },
      { name: "TypeScript", used: ["grants", "decks", "menu", "quotaclimat"] },
      { name: "React · Next.js", used: ["decks", "menu", "quotaclimat", "tracfm"] },
      { name: "Docker", used: ["quotaclimat", "tracfm", "das5"] },
      { name: "PostgreSQL", used: ["menu", "quotaclimat"] },
      { name: "Salesforce · Bynder APIs", used: ["grants", "decks"] },
      { name: "FastAPI", used: ["quotaclimat"] },
      { name: "Playwright end-to-end", used: ["menu"] },
      { name: "Azure OpenAI (EU)", used: ["grants"] },
      { name: "CUDA · C", used: ["das5"] },
      { name: "MPI · OpenMP", used: ["das5"] },
    ],
  },
];
