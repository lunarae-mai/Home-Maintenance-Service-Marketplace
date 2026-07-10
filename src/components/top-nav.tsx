import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sun, Moon, Palette, User } from "lucide-react";
import { useTheme } from "@/lib/theme";

const links = [
  { to: "/" as const, label: "Home" },
  { to: "/services" as const, label: "Services" },
  { to: "/admin/login" as const, label: "Admin" },
];

export function TopNav() {
  const { theme, toggle, palette, setPalette } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const cyclePalette = () => {
    if (palette === "purple") setPalette("cyan");
    else if (palette === "cyan") setPalette("green");
    else setPalette("purple");
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

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={cyclePalette}
            aria-label="Cycle Palette"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Palette
              className="h-4 w-4"
              style={{
                color:
                  palette === "purple" ? "#8B5CF6" : palette === "cyan" ? "#06B6D4" : "#10B981",
              }}
            />
          </button>
          <Link
            to="/auth"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-cyan-accent text-primary-foreground"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
