import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Сегодня" },
  { to: "/diary", label: "Дневник" },
  { to: "/recognize", label: "Фото еды" },
  { to: "/recommendations", label: "Рекомендации" },
  { to: "/profile", label: "Профиль" },
];

export function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <span className="font-semibold text-brand-700">КБЖУ Tracker</span>
          <nav className="flex gap-1 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    isActive ? "bg-brand-600 text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={logout} className="text-sm text-neutral-400 hover:text-neutral-700 shrink-0">
            Выйти
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
