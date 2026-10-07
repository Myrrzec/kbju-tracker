import { Link } from "react-router-dom";
import { DemoAnalyzer } from "../components/DemoAnalyzer";
import { LegalLinks } from "../components/LegalLinks";
import { Logo } from "../components/Logo";

export function LandingPage() {
  return (
    <div className="min-h-dvh">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-12">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="Macros Tracker, home" className="rounded-lg">
            <Logo />
          </Link>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0 whitespace-nowrap">
            <Link to="/login" className="btn-ghost inline-flex items-center !px-2 sm:!px-3 !text-ink-2 hover:!text-ink">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary !min-h-10 !px-4">
              <span className="sm:hidden">Sign up</span>
              <span className="hidden sm:inline">Create account</span>
            </Link>
          </div>
        </header>

        <main className="stagger">
          <section className="pt-14 sm:pt-20 pb-10">
            <h1 className="text-[40px] sm:text-[56px] leading-[1.05] font-bold max-w-[16ch]">
              Photograph a meal. See its calories and macros.
            </h1>
            <p className="text-ink-2 text-lg mt-6 max-w-[56ch] leading-relaxed">
              Upload a photo of what you are eating and the AI estimates the portion, calories, protein, fat and carbs.
              Correct the numbers if you want, then log the meal to a daily diary.
            </p>
          </section>

          <DemoAnalyzer />

          <section className="pt-14">
            <h2 className="text-[22px] font-bold">With a free account</h2>
            <ul className="mt-4 space-y-3 text-ink-2 max-w-[60ch]">
              <li className="border-t border-line-soft pt-3">
                Daily calorie, protein, fat and carb targets calculated from your profile.
              </li>
              <li className="border-t border-line-soft pt-3">
                A diary that groups dishes into meals and lets you edit any number.
              </li>
              <li className="border-t border-line-soft pt-3">Advice based on your last 7 days of entries.</li>
              <li className="border-t border-line-soft pt-3">
                Export your data or delete your account at any time.
              </li>
            </ul>
          </section>
        </main>

        <footer className="mt-16 pt-6 border-t border-line-soft">
          <LegalLinks />
        </footer>
      </div>
    </div>
  );
}
