"use client";

import { useState } from "react";
import { Check, Copy, FileText, Mail, Terminal } from "lucide-react";
import card from "@/lib/card.json";
import { ContactScene } from "./iso/ContactScene";
import { asset, cn } from "@/lib/utils";

const CURL = "curl -sL markt-d.github.io/card";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); }, () => {});
      }}
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg transition-colors", done ? "bg-acc-6 text-primary-foreground" : "bg-gr-2 text-gr-8 hover:bg-gr-3")}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

/** LinkedIn and GitHub marks, drawn here since the icon set no longer ships brands. */
const InMark = () => <span className="grid size-5 place-items-center rounded-[4px] bg-current"><b className="text-[11px] leading-none text-card">in</b></span>;
const GhMark = () => (
  <svg viewBox="0 0 16 16" className="size-5" fill="currentColor" aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const CHANNELS = [
  { icon: <Mail className="size-5" />, name: "Email", value: "mstemchenko.dev@gmail.com", href: "mailto:mstemchenko.dev@gmail.com", copy: "mstemchenko.dev@gmail.com" },
  { icon: <InMark />, name: "LinkedIn", value: "in/mark-the-artichoke", href: "https://www.linkedin.com/in/mark-the-artichoke/" },
  { icon: <GhMark />, name: "GitHub", value: "MarkT-D", href: "https://github.com/MarkT-D" },
  { icon: <FileText className="size-5" />, name: "CV", value: "PDF, one page", href: "cv" },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-14 border-t border-border bg-gr-2 py-12 sm:py-14">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] [&>*]:min-w-0">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 className="mt-2 font-display text-[34px] font-semibold leading-tight sm:text-[40px]">Let&apos;s talk.</h2>
          <p className="mt-3 max-w-md text-[16px] leading-[1.6] text-gr-8">
            I&apos;m looking for AI Engineer and Forward Deployed Engineer roles. Based in Barcelona, EU citizen, no visa needed.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {CHANNELS.map((c) => (
              <li key={c.name} className="card flex items-center gap-3 p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-acc-1 text-acc-7">{c.icon}</span>
                <a href={c.href === "cv" ? asset("/Mark_Temchenko_CV.pdf") : c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="min-w-0 flex-1 hover:text-acc-7">
                  <div className="text-[14px] font-semibold">{c.name}</div>
                  <div className="truncate text-[12.5px] text-muted-foreground">{c.value}</div>
                </a>
                {c.copy && <CopyButton text={c.copy} label="Copy email address" />}
              </li>
            ))}
          </ul>

          <div className="mt-6 overflow-hidden rounded-xl bg-term">
            <div className="flex items-center gap-2 px-4 pt-3 text-[12px] font-semibold text-term-fg/70"><Terminal className="size-3.5" /> From any terminal</div>
            <div className="flex items-center gap-2 px-4 pb-3 pt-1.5">
              <code className="min-w-0 flex-1 truncate font-mono text-[13.5px] text-term-fg"><span className="text-term-ok">$</span> {CURL}</code>
              <CopyButton text={CURL} label="Copy the curl command" />
            </div>
            <div className="overflow-x-auto border-t border-white/10 px-4 py-3">
              <pre className="w-max font-mono text-[9.5px] leading-[1.12] sm:text-[10.5px]" aria-label="The card it prints">
                {(card as [string, string, boolean][][]).map((segs, i) => (
                  <div key={i}>{segs.map(([text, color, bold], j) => <span key={j} style={{ color, fontWeight: bold ? 700 : 400 }}>{text}</span>)}</div>
                ))}
              </pre>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-6">
          <ContactScene />
        </div>
      </div>
    </section>
  );
}
