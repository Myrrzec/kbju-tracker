import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarIcon, HomeIcon, SparklesIcon, UserIcon } from "./icons";
import { Logo } from "./Logo";

const links: { to: string; label: string; icon: ReactNode }[] = [
  { to: "/", label: "Сегодня", icon: <HomeIcon size={20} /> },
  { to: "/diary", label: "Дневник", icon: <CalendarIcon size={20} /> },
  { to: "/recommendations", label: "Рекомендации", icon: <SparklesIcon size={20} /> },
  { to: "/profile", label: "Профиль", icon: <UserIcon size={20} /> },
];

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="max-w-[1280px] mx-auto px-5 sm:px-14 pt-6 sm:pt-12 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden sm:flex gap-8" aria-label="Основная навигация">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `py-1 border-b-2 text-[15px] transition-colors ${
                  isActive
                    ? "text-protein border-protein font-medium"
                    : "text-ink-2 border-transparent hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-[1280px] mx-auto px-5 sm:px-14 py-8 sm:py-10 pb-28 sm:pb-16">
        <Outlet />
      </main>

      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-surface border-t border-line grid grid-cols-4"
        aria-label="Основная навигация"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 pt-3 pb-3 text-[11px] min-h-14 ${
                isActive ? "text-protein" : "text-ink-2"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-protein shadow-glow-protein" />}
                {link.icon}
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
