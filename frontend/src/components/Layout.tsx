import type { ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { CalendarIcon, HomeIcon, SparklesIcon, UserIcon } from "./icons";
import { LegalLinks } from "./LegalLinks";
import { Logo } from "./Logo";

const links: { to: string; label: string; icon: ReactNode }[] = [
  { to: "/", label: "Today", icon: <HomeIcon size={20} /> },
  { to: "/diary", label: "Diary", icon: <CalendarIcon size={20} /> },
  { to: "/recommendations", label: "Advice", icon: <SparklesIcon size={20} /> },
  { to: "/profile", label: "Profile", icon: <UserIcon size={20} /> },
];

export function Layout() {
  return (
    <div className="min-h-dvh">
      <header className="max-w-[1280px] mx-auto px-5 sm:px-14 pt-6 sm:pt-12 flex items-center justify-between gap-6">
        <Link to="/" aria-label="Macros Tracker, home" className="rounded-lg">
          <Logo />
        </Link>
        <nav className="hidden sm:flex gap-8" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-[1280px] mx-auto px-5 sm:px-14 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="max-w-[1280px] mx-auto px-5 sm:px-14 pt-4 pb-28 sm:pb-12">
        <LegalLinks />
      </footer>

      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-surface border-t border-line grid grid-cols-4 pb-[env(safe-area-inset-bottom)]"
        aria-label="Main navigation"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 pt-3 pb-3 text-[11px] min-h-14 transition-colors duration-300 ${
                isActive ? "text-protein" : "text-ink-2"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute top-0 h-0.5 w-8 rounded-full bg-protein shadow-glow-protein transition-transform duration-500 ease-out ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
                <span className={`transition-transform duration-300 ${isActive ? "-translate-y-0.5" : ""}`}>
                  {link.icon}
                </span>
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
