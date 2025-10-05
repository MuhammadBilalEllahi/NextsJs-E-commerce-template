# TODO_AUDIT

Comprehensive task list distilled from the full SEO enhancement and review conversation. Use this as a working backlog for final polish and ThemeForest submission readiness.

## Completed (in repo)

- SEO helpers in `lib/seo.ts` (absoluteUrl, canonical, defaults, JSON‑LD builders: WebSite, Organization, Product, BlogPosting, BreadcrumbList, FAQPage, CollectionPage)
- Core routes/files: `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`
- Global metadata in `app/(site)/layout.tsx` (metadataBase, robots, alternates, OG/Twitter, icons)
- Global JSON‑LD: WebSite + Organization (with `sameAs` placeholders)
- Accessibility: Added skip‑to‑content link, `main#id="main"`
- Home page: added `metadata` with canonical/OG
- Product detail: `generateMetadata`, Product + Breadcrumb JSON‑LD
- Blog list/detail: canonical + `generateMetadata`; BlogPosting + Breadcrumb JSON‑LD
- Category page: CollectionPage + Breadcrumb JSON‑LD
- FAQs: FAQPage JSON‑LD scaffold + Breadcrumb JSON‑LD
- SEO_AUDIT.md: full audit, checklists, scoring table, iterations section started (Iteration 1)

## High‑Priority TODOs (before submission)

1. Provide assets

   - Add real OG images per key pages (home, product, category, blog)
   - Add `public/apple-touch-icon.png` (180×180) referenced in metadata

2. Environment and constants

   - Set `NEXT_PUBLIC_SITE_URL` in all environments (prod, preview)
   - Review currency usage for SEO (e.g., Product JSON‑LD Offer.currency):
     - TODO: centralize default currency (search for `currency`, `DEFAULT_CURRENCY`, `formatCurrency`) and standardize if not present

3. Dynamic OG Images

   - Implement `/api/og` endpoint to generate OG images for products/blog posts
   - Wire per‑page OG image URL in `generateMetadata()` for products/blogs

4. Images & CWV

   - Migrate prominent images (hero, product thumbnails, blog covers) to `next/image`
   - Add `sizes` and width/height to prevent CLS; use `priority` on LCP image
   - Consider preloading critical fonts and LCP image (via `<link rel="preload">` or Next metadata)

5. FAQ JSON‑LD

   - Parse Q/A pairs from `contentPage.content` (HTML) into structured data
   - Ensure no invented content; extract real headings/answers only

6. i18n & hreflang (optional but recommended)

   - Add Next.js i18n config when locales are available
   - Set `metadata.alternates.languages` and/or hreflang via sitemap/metadata

7. Analytics & discoverability

   - Integrate GA4 via `next/script` (env‑gated)
   - Verify site with Google Search Console; submit sitemap
   - Consider Google Merchant Center (if e‑commerce feed planned)

8. Accessibility & ARIA
   - Audit forms, buttons, and nav for descriptive labels/roles
   - Ensure color contrast across light/dark themes
   - Retain visible focus indicators for keyboard users

## Medium‑Priority TODOs

- Add meta `keywords` (optional) and author metadata (can aid ThemeForest checks)
- Consider Article schema variants if used beyond BlogPosting
- Add pagination handling in sitemap when paging is stable and indexable
- Canonical policy for filtered/sorted category views (avoid duplicate content)

## Nice‑to‑Have Enhancements

- Social profile enrichment in Organization JSON‑LD (fill actual profiles)
- Rich `Review` nodes if rendering user reviews (with author/date)
- Programmatic SEO expansions: broader collections, brand pages in sitemap

## Validation tasks

- Run build/lint/typecheck before release:
  - `pnpm install`
  - `pnpm -w lint` (or `npm run lint`)
  - `pnpm -w build` (or `npm run build`)
  - Record any warnings/errors related to SEO (invalid metadata keys, etc.)

## Iteration & Coverage Plan

- Continue repository inspection iterations in `SEO_AUDIT.md > Iterations` until all files are cataloged (≤10 iterations)
- For each uninspected directory: `app/(admin)/**`, `components/**`, `app/api/**`, `models/**`, `lib/**` — record pass/fail of SEO‑relevant checks and any actions

## Risks / Notes

- Do not hardcode secrets or guessed values; prefer env vars and constants
- Do not invent FAQ content; extract from CMS/content pages only
- Ensure disallow rules in `robots.ts` match final protected paths

## ThemeForest Submission Notes

- With the above TODOs completed, expected Lighthouse SEO 95–100
- Pricing tier recommendation: Advanced ($39–59) reflecting admin + ecommerce + strong SEO

## Resolution

- Verified SEO helpers in `lib/seo.ts` (canonical builder, JSON‑LD builders) are present and exported.
- Verified core SEO routes exist and export correctly: `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`.
- Verified global metadata configured in `app/(site)/layout.tsx` including `metadataBase`, robots, alternates, Open Graph, Twitter, and icons.
- Verified global JSON‑LD injection (WebSite + Organization) in `app/(site)/layout.tsx` via `<script type="application/ld+json">`.
- Verified `next.config.ts` enables production console removal with `compiler.removeConsole` (keeps `error` and `warn`).
- Verified sitemap composes static, product, category, and blog URLs using `getSiteUrl()` and `absoluteUrl()`.
- Verified `robots.ts` disallows sensitive paths (`/api/`, `/admin`, `/account`, build artifacts) and references the sitemap/host from `NEXT_PUBLIC_SITE_URL`.
