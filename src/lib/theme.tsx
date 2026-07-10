import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
type Palette = "purple" | "cyan" | "green";
const ThemeCtx = createContext<{
  theme: Theme;
  toggle: () => void;
  palette: Palette;
  setPalette: (p: Palette) => void;
}>({
  theme: "dark",
  toggle: () => {},
  palette: "purple",
  setPalette: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [palette, setPalette] = useState<Palette>("purple");

  useEffect(() => {
    const storedTheme = (typeof window !== "undefined" &&
      localStorage.getItem("hs-theme")) as Theme | null;
    if (storedTheme) setTheme(storedTheme);
    const storedPalette = (typeof window !== "undefined" &&
      localStorage.getItem("hs-palette")) as Palette | null;
    if (storedPalette) setPalette(storedPalette);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove(
      "light",
      "dark",
      "theme-purple",
      "theme-cyan",
      "theme-green",
    );
    document.documentElement.classList.add(theme);
    document.documentElement.classList.add(`theme-${palette}`);
    localStorage.setItem("hs-theme", theme);
    localStorage.setItem("hs-palette", palette);
  }, [theme, palette]);

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        palette,
        setPalette,
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
