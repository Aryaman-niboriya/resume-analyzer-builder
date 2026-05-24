import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors group"
    >
      {theme === "light" ? (
        <Sun className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
      )}
      <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
