import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/playfair-display";
import "./globals.css";
import "./iso.css";
import "./pesto.css";

export const metadata: Metadata = {
  title: "Mark Temchenko · AI Engineer",
  description:
    "AI Engineer in Barcelona. LLM pipelines for enterprise clients, NLP and ML research projects, and how I build them.",
  openGraph: {
    title: "Mark Temchenko · AI Engineer",
    description: "LLM systems, from a client's problem to production.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#1b1e1c" },
  ],
  colorScheme: "light dark",
};

/** For whoever reads the source: an HTML comment, so it never renders. */
const SOURCE_ART = `
  You opened the source. Respect.

            ____
           /\\   \\       a man in a trench coat,
          (  o o )      dancing badly, forever
           \\  ^ /
       ____/|  |\\____
      /    \\|__|/    \\
     /  /\\   ||   /\\  \\
        \\ \\  ||  / /
         \\ \\_||_/ /
          \\__  __/
             ||
            _||_         ~ ~ ~
           /    \\       ~ ~ ~ ~
          /  /\\  \\
       __/  /  \\  \\__
      |____/    \\____|

  Your reward for reading this far:
  https://www.youtube.com/watch?v=dQw4w9WgXcQ

  Never Gonna Give You Up. Rick Astley, 1987.
  (Neither will I, on a failing test.)

  Hiring? mstemchenko.dev@gmail.com
`;
const SOURCE_COMMENT = `<!--${SOURCE_ART}-->`;

// Runs before first paint so a dark-mode visitor never sees a white flash.
const THEME_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem("theme")}catch(e){}var d=t?t==="dark":true;document.documentElement.dataset.theme=d?"dark":"light"})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: SOURCE_COMMENT }} />
        {children}
      </body>
    </html>
  );
}
