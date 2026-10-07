import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LegalLinks } from "./LegalLinks";
import { Logo } from "./Logo";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | Macros Tracker`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="min-h-dvh">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <header className="flex items-center justify-between gap-6 mb-10">
          <Link to="/" aria-label="Macros Tracker, home" className="rounded-lg">
            <Logo />
          </Link>
          <Link to="/" className="text-[15px] text-ink-2 hover:text-ink transition-colors">
            Back to the app
          </Link>
        </header>

        <main className="stagger">
          <div>
            <h1 className="text-[34px] sm:text-[40px] leading-tight font-bold">{title}</h1>
            <p className="text-ink-2 mt-2">Last updated {updated}</p>
          </div>
          <div className="mt-10 space-y-4 leading-relaxed text-ink [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-1 [&_p]:text-ink-2 [&_p]:max-w-[68ch] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:text-ink-2 [&_ul]:max-w-[68ch] [&_a]:text-protein [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-ink [&_strong]:font-semibold">
            {children}
          </div>
        </main>

        <footer className="mt-16 pt-6 border-t border-line-soft">
          <LegalLinks />
        </footer>
      </div>
    </div>
  );
}
