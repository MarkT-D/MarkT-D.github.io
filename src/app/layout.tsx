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

// Runs before first paint so a dark-mode visitor never sees a white flash.
const THEME_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem("theme")}catch(e){}var d=t?t==="dark":true;document.documentElement.dataset.theme=d?"dark":"light"})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
