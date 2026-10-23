import Link from "next/link";
import { asset } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="wrap flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-acc-6 text-[12px] font-bold text-white">MT</span>
          <span className="hidden sm:inline">Mark Temchenko</span>
        </Link>
        <nav className="flex items-center gap-1 text-[14px] font-medium text-gr-8">
          <Link href="/#work" className="rounded-lg px-2.5 py-1.5 hover:bg-gr-2">Work</Link>
          <Link href="/#how" className="hidden rounded-lg px-2.5 py-1.5 hover:bg-gr-2 sm:block">How I build</Link>
          <Link href="/#notes" className="rounded-lg px-2.5 py-1.5 hover:bg-gr-2">Notes</Link>
          <a href={asset("/Mark_Temchenko_CV.pdf")} className="btn btn-primary ml-1 h-9 px-3.5 text-[14px]">CV</a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-gr-2">
      <div className="wrap grid gap-8 py-14 sm:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="font-display text-[30px] font-semibold leading-tight">Let&apos;s talk.</h2>
          <p className="mt-2 max-w-md text-[15px] text-gr-8">
            I&apos;m looking for AI Engineer and Forward Deployed Engineer roles in Barcelona. German citizen, no visa needed in the EU.
          </p>
          <a href="mailto:mstemchenko.dev@gmail.com" className="btn btn-primary mt-5">mstemchenko.dev@gmail.com</a>
        </div>
        <ul className="grid content-start gap-2 text-[15px]">
          <li><a className="hover:text-acc-7" href="https://www.linkedin.com/in/mark-the-artichoke/" target="_blank" rel="noreferrer">LinkedIn →</a></li>
          <li><a className="hover:text-acc-7" href="https://github.com/MarkT-D" target="_blank" rel="noreferrer">GitHub →</a></li>
          <li><a className="hover:text-acc-7" href={asset("/Mark_Temchenko_CV.pdf")}>CV (PDF) →</a></li>
          <li className="pt-4 text-[13px] text-muted-foreground">Russian (native) · English (C1) · German (A1)</li>
        </ul>
      </div>
    </footer>
  );
}
