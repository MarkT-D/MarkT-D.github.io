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
    slug: "curly-quotes-broke-structured-output",
    title: "A quoted dish name broke every translation batch",
    date: "October 2026",
    tags: ["LLMs", "structured output", "evals"],
    teaser:
      "One menu item with quotes in its name took down a whole batch of translations. Switching to structured output fixed the parse and broke the name in a new way.",
    body: [
      {
        p: "Pesto translates a restaurant's whole menu in batches: one request to Claude per group of dishes, JSON back, rows written. One day a single dish failed every batch it was in. Its name was Шоколад \"Вдохновение\", a chocolate dessert with its name in quotes.",
      },
      { h: "What went wrong" },
      {
        p: "In German the model wrote the name with German quotation marks, opening with „ as German does. It then closed with a plain straight quote. That straight quote ended the JSON string one character early, and the parse of the entire batch failed. One dish, forty dishes lost.",
      },
      {
        code: `"name": "Schokolade „Vdochnovenie""\n                               ^ the string ends here`,
      },
      { h: "Fix one: structured output" },
      {
        p: "I moved the call to structured output with a strict schema, so the reply is valid JSON by construction. A strict schema cannot have keys named after data, so the shape became arrays, and a small fold puts them back into the id-keyed maps the app reads.",
      },
      {
        p: "That made the reply parseable, and then lost the name a different way. Asked for Schokolade „Inspiration“, the closing “ reached the decoder as a bare quote. The JSON was valid. The dish name was cut short.",
      },
      { h: "Fix two: ask for the quotes that survive" },
      {
        p: "I tested each quote style through the same path. „ “ ” ‟ were all unsafe. A straight quote came back correctly escaped, and « » came back intact. So the prompt now asks for those and forbids the curly ones, and a unit test fails if anyone makes the prompt typographically nicer again.",
      },
      { h: "What I took from it" },
      {
        p: "Structured output solves syntax, not content. The test that matters is the round trip of real, awkward data: names with quotes, Cyrillic, accents. That is why the fix ships with a unit test on the prompt and not only on the parser.",
      },
    ],
  },
  {
    slug: "chrome-translate-crashes-react",
    title: "Chrome's page translation crashes React, on the one button that matters",
    date: "October 2026",
    tags: ["React", "frontend", "production bugs"],
    teaser:
      "A guest's phone offered to translate the menu. They accepted, pressed Send, and the order silently never reached the kitchen.",
    body: [
      {
        p: "Tourists read Pesto's public menu on their own phones, and Chrome offers to translate it. That is the normal case on a menu, not an edge case. Some orders never arrived, and the restaurant saw nothing: no order, no error.",
      },
      { h: "The cause" },
      {
        p: "Chrome does not translate text in place. It replaces each text node with a <font> element that wraps the translation. React still holds a reference to the original text node, which now has a different parent.",
      },
      {
        p: "When the Send button's label changed from \"Send to the kitchen\" to \"Sending…\", React called removeChild on a node that was no longer a child of that element. The tree unmounted with \"The node to be removed is not a child of this node\", and the order request never fired.",
      },
      { h: "The fix" },
      {
        p: "The surfaces React re-renders under a guest's hands, the basket, the checkout sheet and the live order page, carry translate=\"no\". The restaurant's own words inside them get translate=\"yes\" back, and dynamic text lives in its own <span> rather than as a bare child, so a swap replaces an element React owns.",
      },
      {
        p: "Nothing is lost for the guest: those strings were already localised by the app. The menu content itself stays translatable, which is the part a guest reading in a fifth language needs.",
      },
    ],
  },
  {
    slug: "never-void-work-in-serverless",
    title: "Never void the work a serverless route starts",
    date: "September 2026",
    tags: ["Next.js", "serverless", "reliability"],
    teaser:
      "Fiscal receipts for card payments were filed 10 to 20 seconds late, and once not at all. The code looked fine. The platform froze it.",
    body: [
      {
        p: "When a card payment lands, a Stripe webhook records it and files the fiscal receipt with the tax authority. The filing was started with void and not awaited, so the webhook could answer Stripe quickly.",
      },
      { h: "What actually happened" },
      {
        p: "On Vercel the function is frozen as soon as the response goes out. A promise still running does not keep going. It resumes only when another request happens to land on the same instance. Receipts were filed whenever the next event thawed the function, usually 10 to 20 seconds later. On one day nothing thawed it in time and the receipt was never queued.",
      },
      { h: "The fix" },
      {
        p: "Background work now goes through one helper built on Next's after(), which keeps the function alive until the work finishes. No route starts work it does not either await or hand to that helper.",
      },
      {
        p: "And because a missed job should not depend on luck, the guest's order page now checks for a missing receipt on its own poll and queues it. The daily drain only ever sees rows that exist, so the gap had to be closed from the side that notices it.",
      },
    ],
  },
];
