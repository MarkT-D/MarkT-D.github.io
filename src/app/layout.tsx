import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/playfair-display";
import "./globals.css";

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

export const viewport: Viewport = { themeColor: "#fbfcfb", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
