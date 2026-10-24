/**
 * Short engineering notes. Each is a bug I hit in production, what caused it,
 * and what fixed it. Kept as data so the list and the pages cannot disagree.
 */
export type Note = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  teaser: string;
  body: { h?: string; p?: string; code?: string }[];
};

export const NOTES: Note[] = [
  {
    slug: "guidelines-vs-grant-rules",
    title: "When company guidelines pull against grant rules",
    date: "2025",
    tags: ["LLMs", "RAG", "evals"],
    teaser:
      "Two good sources of context, one awkward draft. The model quietly picked a side, and the output felt off whichever side it picked.",
    body: [
      {
        p: "At Twin AI the grant pipeline's writing stage pulled context from two places. One was RAG over the client's own documents: Salesforce and Bynder for one client, drives and APIs for the others. The other was a separate module that injected the EU and scheme-specific rules for the grant being written.",
      },
      { h: "What went wrong" },
      {
        p: "Sometimes a company's own guidelines pulled against a specific grant requirement. The model never said so. It leaned one way, quietly, and wrote a fluent section. Either the draft stopped sounding like the company, or it stopped fitting the grant.",
      },
      {
        p: "That was worse than a plain error. Even when a draft was right, nobody could tell which side it had taken or why it read slightly off, so reviewers second-guessed good drafts as well as bad ones.",
      },
      { h: "The fix: judge outside the model" },
      {
        p: "We added an automated assessment after drafting. Its criteria came from both sides: the grant's rules and the company's internal metrics. It scored each section from 1 to 10, named the weak spots, and flagged the sections where the two sides pulled apart.",
      },
      {
        p: "The flag went to the user, not back into the prompt. They made the call: accept the draft, or adjust the source documents. A draft that felt wrong for unclear reasons became a clear decision with a reason attached.",
      },
      { h: "What I took from it" },
      {
        p: "More context is not automatically better context. When two sources can disagree, the disagreement has to be detected and shown to a person, because the model will resolve it on its own, silently and fluently.",
      },
    ],
  },
  {
    slug: "blame-in-every-article",
    title: "Our classifier saw blame in almost every article",
    date: "June 2026",
    tags: ["NLP", "LLM labelling", "calibration"],
    teaser:
      "LLM labels taught our model to find 'attribution of responsibility' nearly everywhere. The fix went on top of the model, not inside it.",
    body: [
      {
        p: "For QuotaClimat we classified about 20,000 climate articles into five news frames. GPT-5-mini labelled the training data, and we distilled those labels into multilingual XLM-RoBERTa classifiers.",
      },
      { h: "What we saw" },
      {
        p: "One frame, attribution of responsibility, dominated: about 62.5% of articles. Checked against human annotators, the LLM labels caught 91% of the real cases, but agreement was poor: Krippendorff's α of 0.28, against 0.62 to 0.69 for the other frames. The labeller was not missing responsibility. It was seeing it where people did not.",
      },
      {
        p: "The classifier learned exactly that lean. A model trained on an LLM's labels inherits the LLM's habits, and a high recall number hides them.",
      },
      { h: "Filters on top of the model" },
      {
        p: "We did not retrain around it. Each frame's output was calibrated separately with Platt scaling, fitted against the human-labelled set. Responsibility got the strongest correction of the five, a slope of 0.44 against 1.12 for conflict, so a high score now means what it says.",
      },
      {
        p: "For shares across the whole corpus we used prediction-powered inference, which uses the human-labelled set to correct the bias in the model's counts. The dashboard shows calibrated probabilities rather than hard labels.",
      },
      { h: "What I took from it" },
      {
        p: "Check agreement per class, not overall. One frame can undermine a whole typology while the average looks fine.",
      },
    ],
  },
  {
    slug: "benchmark-before-model",
    title: "Pick the benchmark before the model",
    date: "2026",
    tags: ["speech", "evaluation", "system design"],
    teaser:
      "Radio call-ins in Ugandan languages break speech models in different ways. So the first thing I designed for TRAC FM was the test, not the pipeline.",
    body: [
      {
        p: "TRAC FM runs radio polls in Uganda. Listeners call in and answer in their own languages, often switching between them mid-sentence, over noisy phone and radio lines. The partner wanted those answers as English text, grouped by theme for each question.",
      },
      { h: "The problem with choosing a model" },
      {
        p: "Every stage had several candidates. Cleaning: FFmpeg loudness, voice activity detection, noise suppression. Transcription: Whisper, or models built for low-resource languages. Translation: an LLM or dedicated MT. Grouping: embeddings with clustering, or an LLM. New models in this space ship every few months, so any choice made once would be stale by launch.",
      },
      { h: "The design: a harness first" },
      {
        p: "The anthropologists already had the most valuable thing: original audio, transcripts in the original languages, and English translations they had validated. That became the gold set.",
      },
      {
        p: "The harness takes a provider and a model, runs the gold set, and appends a column: word error rate for transcripts, translations side by side for human rating, and a notes column for failure modes. Cleaning is judged the same way, by what it does to the error rate downstream. The pipeline itself is containerised stage by stage, so swapping in the winner is a configuration change.",
      },
      { h: "Where it ended" },
      {
        p: "The partnership ended at the design stage, before we built it. What I would keep is the order: agree on the gold set and the metric first, and make the model the part you expect to replace.",
      },
    ],
  },
];
