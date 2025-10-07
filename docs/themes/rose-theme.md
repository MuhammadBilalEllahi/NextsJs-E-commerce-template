Title: Rose Theme – Architecture and Iterative Changes Log

Overview

- Rose theme is a color palette layered via html.theme-rose class.
- Light/dark handled by next-themes; color palette handled by custom ThemeProvider.
- CSS variables source: app/(site)/globals.css.

How it works

- next-themes adds class dark on html for dark mode.
- Custom ThemeProvider applies html.theme-rose to set brand colors (primary, accent, ring, chart tokens).
- Components consume tokens via Tailwind CSS variables: bg-background, text-foreground, bg-card, bg-muted, border-border, etc.

Where tokens are defined

- app/(site)/globals.css: :root, .dark, .theme-rose variable blocks.

Key files

- lib/providers/rootProvider.tsx → wraps app with next-themes ThemeProvider and custom ThemeProvider.
- lib/providers/themeProvider.tsx → manages color theme state and class.
- components/main_comp/navbar.tsx → light/dark toggle via next-themes and Palette button to cycle color themes.
- components/ui/chart.tsx → THEMES mapping extended with theme-rose selector.

Usage

- Click Palette button to cycle color themes until rose is active.
- Light/dark toggle remains independent.

Iteration Log

Iteration 1

- Added ThemeProvider (lib/providers/themeProvider.tsx) to manage color themes.
- Stored selection in localStorage (dm-color-theme) and applied html.theme-<name> class.

Iteration 2

- Wrapped providers with next-themes ThemeProvider in lib/providers/rootProvider.tsx.
- attribute="class", defaultTheme="system", enableSystem.

Iteration 3

- Updated navbar toggle to use useTheme from next-themes.
- Removed manual documentElement class toggling for dark mode.

Iteration 4

- Added Palette cycle button in components/main_comp/navbar.tsx using useThemeColor.
- Displays tooltip with current color theme name.

Iteration 5

- Defined .theme-rose palette in app/(site)/globals.css:
  --primary, --primary-foreground, --accent, --accent-foreground, --ring, chart tokens.

Iteration 6

- Extended components/ui/chart.tsx THEMES to include .theme-rose for per-theme chart colors.

Iteration 7

- Set html suppressHydrationWarning in app/(site)/layout.tsx to avoid flicker.
- Switched top-level wrappers to bg-background.

Iteration 8

- Converted hardcoded bg-white/text-black in navbar/header/footer to tokens (bg-background, text-foreground, border-border, hover:bg-muted).

Iteration 9

- Product surfaces/buttons moved to tokens (bg-card, text-foreground, bg-foreground text-background for inverted CTAs).

Iteration 10

- Reviews: replaced bg-gray-50 and text-gray-700 with bg-muted and text-foreground/80.

Iteration 11

- Account navigation: bg-card for sidebar, text-foreground links, hover:text-primary.

Iteration 12

- Admin layout: switched wrappers to bg-background; sidebar hover to hover:bg-muted for consistent theming.

Iteration 13

- Adjusted icon colors to text-foreground in navbar/header.

Iteration 14

- Ensured chart tooltips/legend derive from tokens, no direct hex usage.

Iteration 15

- Lint pass on edited files; verified no errors. Confirmed rose theme cycles correctly and persists.

Notes

- To customize rose palette, edit .theme-rose variables in app/(site)/globals.css.
- For any remaining component using gray/white/black utilities, swap to tokens.

App file audit (app/\*)

- app/(site)/layout.tsx — CHANGED (html suppressHydrationWarning; wrappers use bg-background)
- app/(admin)/admin/layout.tsx — CHANGED (wrappers bg-background; sidebar hover bg-muted)
- app/(site)/globals.css — CHANGED (.theme-rose variables; tokens base)
- app/(site)/page.tsx — NO CHANGE (inherited tokens)
- app/(site)/product/[slug]/page.tsx — NO CHANGE (component-level tokens cover)
- app/(site)/search/page.tsx — NO CHANGE (component-level tokens cover)
- app/(site)/cart/page.tsx — NO CHANGE (UI tokens inside components)
- app/(site)/checkout/page.tsx — NO CHANGE (forms/components already tokenized)
- app/(site)/about/page.tsx — NO CHANGE (content only)
- app/(site)/privacy-policy/page.tsx — NO CHANGE
- app/(site)/terms-of-service/page.tsx — NO CHANGE
- app/(site)/shipping-policy/page.tsx — NO CHANGE
- app/(site)/return-refund/page.tsx — NO CHANGE
- app/(site)/disclaimers/page.tsx — NO CHANGE
- app/(site)/branches/page.tsx — NO CHANGE
- app/(site)/blog/page.tsx — NO CHANGE
- app/(site)/blog/[slug]/page.tsx — NO CHANGE
- app/(site)/account/\* — NO CHANGE (uses components with tokens)
- app/(site)/unauthorized/page.tsx — NO CHANGE
- app/(site)/unsubscribe/page.tsx — NO CHANGE
- app/(site)/track-order/page.tsx — NO CHANGE

- app/(admin)/admin/page.tsx — NO CHANGE (charts/buttons already tokenized)
- app/(admin)/admin/access/page.tsx — WILL CHANGE (thead to bg-muted/50; neutral texts to muted-foreground)
- app/(admin)/admin/banner/page.tsx — WILL CHANGE (placeholders to bg-muted/text-muted-foreground; table head bg-muted/50)
- app/(admin)/admin/blogs/page.tsx — QUEUED (gray notes → tokens)
- app/(admin)/admin/branches/page.tsx — QUEUED (minor gray → tokens)
- app/(admin)/admin/brands/page.tsx — QUEUED
- app/(admin)/admin/careers/page.tsx — QUEUED
- app/(admin)/admin/cart/page.tsx — QUEUED
- app/(admin)/admin/categories/page.tsx — QUEUED (modal bg-white → bg-card)
- app/(admin)/admin/chat/page.tsx — QUEUED
- app/(admin)/admin/content/\* — QUEUED (preview bg-white → bg-card)
- app/(admin)/admin/customers/page.tsx — QUEUED
- app/(admin)/admin/job-applications/page.tsx — QUEUED
- app/(admin)/admin/marketing-campaigns/page.tsx — QUEUED
- app/(admin)/admin/offers/page.tsx — QUEUED
- app/(admin)/admin/orders/page.tsx — QUEUED
- app/(admin)/admin/payments/page.tsx — QUEUED
- app/(admin)/admin/promotions/page.tsx — QUEUED
- app/(admin)/admin/refunds/page.tsx — QUEUED
- app/(admin)/admin/shipping/page.tsx — QUEUED
- app/(admin)/admin/testimonials/page.tsx — QUEUED
- app/(admin)/admin/testpage/page.tsx — NO CHANGE (tooling page; cosmetic)
- app/(admin)/admin/tcs-orders/page.tsx — NO CHANGE (uses tokenized components)
- app/(admin)/admin/whatsapp-config/page.tsx — NO CHANGE (uses tokenized components)
