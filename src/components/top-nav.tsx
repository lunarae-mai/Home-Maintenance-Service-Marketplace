import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useState, useEffect } from "react";
import api, { getApiData } from "@/lib/api";

const links = [
  { to: "/" as const, label: "Home" },
  { to: "/services" as const, label: "Services" },
];

export function TopNav() {
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const syncAuthState = () => {
      const loggedIn = typeof window !== "undefined" && !!localStorage.getItem("accessToken");
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setName("");
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/User/me");
        const u = getApiData<any>(res);
        if (u) {
          setName(u.name || "");
        }
      } catch (err) {
        console.error("Failed to load customer profile in top-nav", err);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setName("");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Home className="h-4 w-4" />
          </div>
          <span>Home Services</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/customer/profile"
                className="flex items-center gap-2 rounded-full border border-slate-205 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 hover:scale-[1.01] active:scale-98 transition duration-200 text-xs font-extrabold cursor-pointer"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-extrabold text-[10px]">
                  {name.charAt(0).toUpperCase() || "C"}
                </div>
                <span className="hidden sm:inline text-slate-700 dark:text-slate-250">{name || "Profile"}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="grid h-9 w-9 place-items-center rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-2.5 font-semibold text-white transition hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(109,40,217,0.3)] text-xs cursor-pointer"
              >
                Log In / Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
