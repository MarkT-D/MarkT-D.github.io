import Link from "next/link";
import { asset } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="wrap flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-acc-6 text-[12px] font-bold text-primary-foreground">MT</span>
          <span className="hidden sm:inline">Mark Temchenko</span>
        </Link>
        <nav className="flex items-center gap-1 text-[14px] font-medium text-gr-8">
          <Link href="/#work" className="rounded-lg px-2.5 py-1.5 hover:bg-gr-2">Work</Link>
          <Link href="/#how" className="hidden rounded-lg px-2.5 py-1.5 hover:bg-gr-2 md:block">How I build</Link>
          <Link href="/#notes" className="rounded-lg px-2.5 py-1.5 hover:bg-gr-2">Notes</Link>
          <Link href="/#contact" className="hidden rounded-lg px-2.5 py-1.5 hover:bg-gr-2 sm:block">Contact</Link>
          <ThemeToggle />
          <a href={asset("/Mark_Temchenko_CV.pdf")} className="btn btn-primary ml-1 h-9 px-3.5 text-[14px]">CV</a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-6 text-[13px] text-muted-foreground">
        <span>Mark Temchenko · Barcelona</span>
        <span>Built with Next.js, in Pesto&apos;s design system. Demo data throughout is invented.</span>
      </div>
    </footer>
  );
}
