import { useThemeColor } from "@/lib/providers/themeProvider";
import { Moon, Palette } from "lucide-react";
import { Sun, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { AuthButton } from "@/components/auth/auth-button";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants/site";

export function AdminNavbar({ collapsed }: { collapsed: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { theme: colorTheme, cycleTheme } = useThemeColor();
  const {
    theme: nextTheme,
    setTheme: setNextTheme,
    resolvedTheme,
  } = useTheme();
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setNextTheme(next);
  };
  useEffect(() => {
    const current = (resolvedTheme as "light" | "dark") || "light";
    setTheme(current);
  }, [resolvedTheme]);

  return (
    <nav className="sticky top-0 bg-secondary flex justify-between p-3 py-2  border-b mb-2">
      <div>
        <h1 className="text-2xl text-primary font-bold">
          {!collapsed ? "" : `${SITE_NAME} Admin`}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={cycleTheme}
          title={`Theme: ${colorTheme}`}
          aria-label="Cycle color theme"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Palette className="h-4 w-4" />
        </button>

        <Bell className="h-4 w-4 text-red-600" />
        <AuthButton variant="outline" size="sm" />
      </div>
    </nav>
  );
}
