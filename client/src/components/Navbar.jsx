import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const linkClass = ({ isActive }) =>
  `link-draw pb-1 text-sm font-semibold transition ${
    isActive
      ? "is-active text-stone-900 dark:text-stone-50"
      : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
  }`;

function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="flex h-8 w-8 items-center justify-center rounded-full text-base text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export default function Navbar() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Single source of truth shared by the desktop + mobile toggles.
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      const root = document.documentElement;
      // Fade colors instead of snapping: temporarily enable transitions,
      // then remove the class so hovers stay instant afterwards.
      root.classList.add("theme-transition");
      root.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      setTimeout(() => root.classList.remove("theme-transition"), 450);
      return next;
    });
  }

  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-ivory/80 backdrop-blur dark:border-white/10 dark:bg-[#0e0e13]/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={close}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-md shadow-indigo-600/25">
            T
          </span>
          <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Template
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Store
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex sm:gap-6">
          <NavLink to="/" className={linkClass} end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/templates" className={linkClass} onClick={close}>
            Templates
          </NavLink>
          {token && (
            <>
              <NavLink to="/favorites" className={linkClass} onClick={close}>
                My Favorites
              </NavLink>
              <NavLink to="/collections" className={linkClass} onClick={close}>
                Collections
              </NavLink>
              <NavLink to="/submit" className={linkClass} onClick={close}>
                Submit
              </NavLink>
            </>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin/reviews" className={linkClass} onClick={close}>
              Reviews
            </NavLink>
          )}
          <ThemeToggle dark={dark} onToggle={toggleTheme} />
          {token && (
            <NotificationBell
              onOpenChange={(isOpen) => {
                if (isOpen) setMenuOpen(false);
              }}
            />
          )}
          {user ? (
            <NavLink
              to="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white"
              title={`${user.name} — profile`}
              onClick={close}
            >
              {user.name.charAt(0).toUpperCase()}
            </NavLink>
          ) : (
            <Link
              to="/login"
              state={{ from: location }}
              className="flex h-8 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle dark={dark} onToggle={toggleTheme} />
          {token && (
            <NotificationBell
              onOpenChange={(isOpen) => {
                if (isOpen) setMenuOpen(false);
              }}
            />
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg transition hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <span
              className={`h-0.5 w-5 rounded bg-stone-700 transition dark:bg-stone-200 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded bg-stone-700 transition dark:bg-stone-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded bg-stone-700 transition dark:bg-stone-200 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t border-stone-200 bg-ivory px-4 py-3 sm:hidden dark:border-white/10 dark:bg-[#0e0e13]">
          <div className="flex flex-col gap-1">
            <NavLink
              to="/"
              end
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Home
            </NavLink>
            <NavLink
              to="/templates"
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Templates
            </NavLink>
            {token && (
              <NavLink
                to="/favorites"
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                My Favorites
              </NavLink>
            )}
            {token && (
              <NavLink
                to="/collections"
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                My collections
              </NavLink>
            )}
            {token && (
              <NavLink
                to="/submit"
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                Submit a template
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/admin/reviews"
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                Review queue
              </NavLink>
            )}
            {user ? (
              <NavLink
                to="/profile"
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                Profile ({user.name})
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                onClick={close}
                state={{ from: location }}
                className="mt-1 rounded-lg bg-stone-900 px-3 py-2.5 text-center text-sm font-semibold text-white dark:bg-white dark:text-stone-900"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
