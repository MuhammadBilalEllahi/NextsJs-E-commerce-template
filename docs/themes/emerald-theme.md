Title: Emerald Theme – Architecture and Iterative Changes Log

Overview

- Emerald theme is provided by html.theme-emerald class layering brand colors over base tokens.
- Works with next-themes for light/dark.

How it works

- next-themes manages dark class on html.
- Custom ThemeProvider applies theme-emerald class and persists selection.
- CSS variables set in app/(site)/globals.css under .theme-emerald.

Key files

- lib/providers/themeProvider.tsx, lib/providers/rootProvider.tsx
- app/(site)/globals.css (.theme-emerald block)
- components/main_comp/navbar.tsx (Palette cycle UI)
- components/ui/chart.tsx (THEMES includes .theme-emerald)

Iteration Log (1 → 15)

1. Introduced color ThemeProvider and state persistence.
2. Wrapped app with next-themes provider.
3. Navbar toggles switched to next-themes.
4. Added color theme cycle button; shows current theme.
5. Added .theme-emerald variables: primary, accent, ring, chart tokens.
6. Extended chart THEMES to support .theme-emerald.
7. Added suppressHydrationWarning and bg-background in layouts.
8. Replaced hardcoded colors in global nav/header/footer.
9. Updated product surfaces/buttons to tokens.
10. Reviews: bg-muted, text-foreground/80.
11. Account nav: bg-card and tokenized text/hover.
12. Admin layout: bg-background wrappers; hover:bg-muted.
13. Icon/text colors to text-foreground.
14. Chart uses tokens via CSS variables.
15. Lint clean; tested theme persistence and cycling.

Notes

- Adjust emerald shades by editing .theme-emerald in globals.css.

App file audit (app/\*)

- app/(site)/layout.tsx — CHANGED
- app/(admin)/admin/layout.tsx — CHANGED
- app/(site)/globals.css — CHANGED
- app/(site) remaining pages — NO CHANGE
- app/(admin) dashboard — NO CHANGE
- app/(admin)/admin/access/page.tsx — WILL CHANGE
- app/(admin)/admin/banner/page.tsx — WILL CHANGE
- Other admin pages — QUEUED (see rose-theme.md for full list)
