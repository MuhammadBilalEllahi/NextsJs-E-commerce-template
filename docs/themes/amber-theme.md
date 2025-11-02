Title: Amber Theme – Architecture and Iterative Changes Log

Overview

- Amber theme is activated via html.theme-amber class and defines brand colors.
- Independent from light/dark (managed by next-themes).

How it works

- ThemeProvider sets/removes theme-amber class on html and stores choice.
- CSS variables in app/(site)/globals.css under .theme-amber override --primary, --accent, --ring, chart tokens.

Key files

- lib/providers/themeProvider.tsx
- lib/providers/rootProvider.tsx
- app/(site)/globals.css (.theme-amber block)
- components/main_comp/navbar.tsx
- components/ui/chart.tsx

Iteration Log (1–15)

1. Added ThemeProvider for color themes.
2. Integrated next-themes for dark/light.
3. Navbar toggle wired to next-themes.
4. Palette button cycles to amber among others.
5. Added .theme-amber variables in globals.css.
6. Chart THEMES includes .theme-amber selector.
7. suppressHydrationWarning on html and bg-background in layouts.
8. Tokenized navbar/header/footer colors.
9. Product surfaces/buttons use tokens.
10. Reviews adjusted to bg-muted/text-foreground.
11. Account navigation tokenized.
12. Admin layout hover and background tokenization.
13. Icons use text-foreground consistently.
14. Chart tooltips/legends rely on CSS vars.
15. Verified no lints; amber selection persists.

Notes

- Tune amber via .theme-amber in globals.css.

App file audit (app/\*)

- app/(site)/layout.tsx — CHANGED
- app/(admin)/admin/layout.tsx — CHANGED
- app/(site)/globals.css — CHANGED
- app/(site) remaining pages — NO CHANGE
- app/(admin) dashboard — NO CHANGE
- app/(admin)/admin/access/page.tsx — WILL CHANGE
- app/(admin)/admin/banner/page.tsx — WILL CHANGE
- Other admin pages — QUEUED (see rose-theme.md for full list)
