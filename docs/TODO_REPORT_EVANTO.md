# TODO REPORT — Envato Submission Readiness

This document lists every action item identified in the audit and conversation. Grouped by priority and category. Complete all items before Envato submission.

## High Priority (Blockers)

- Remove all console logging from production code
  - Search-and-remove `console.log`, `console.debug`, `console.warn`, `console.error` where not strictly necessary for error reporting.
  - Ensure `next.config.ts` removeConsole is enabled for production (already configured). Keep only `error` and `warn` if needed.
- Fix build and type-check pipeline
  - Ensure `pnpm` workspaces actually contain the Next.js apps or convert scripts to single-app layout.
  - Make `pnpm build` / `npm run build` succeed locally (no “No projects matched the filters”).
  - Run `tsc --noEmit` and resolve all TypeScript errors.
- Add LICENSE file
  - Provide `LICENSE.txt` (MIT or commercial licensing suitable for Envato).
  - Add Envato license notice where appropriate.
- Provide `.env.example`
  - Include all required variables with placeholders and comments:
    - `MONGODB_URI`
    - `JWT_SECRET` (no fallbacks in production)
    - `REDIS_URL`
    - `TCS_USERNAME`, `TCS_PASSWORD`, `TCS_COST_CENTER_CODE`
    - `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
    - AWS S3 credentials (key, secret, bucket, region)
    - SMTP config (host, port, user, pass, from)
  - Document which services are optional and defaults where safe.
- Remove fallback secrets in production
  - `lib/auth.ts` and `middleware.ts`: replace `process.env.JWT_SECRET || "fallback-secret"` with required env (throw if missing in prod).

## Medium Priority

- Security hardening
  - Add rate limiting for sensitive routes (`/api/auth/*`, `/api/checkout`, `/api/contact`, `/api/newsletter`, admin APIs).
  - Add security headers via `next.config.ts headers()` (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security where applicable).
  - Consider CSRF tokens or robust origin checks for form endpoints (register, reset-password, contact, reviews, etc.).
- Dependency hygiene and updates
  - Update outdated packages reported by `npm outdated`/`pnpm outdated` (eslint, tailwindcss, types, tsx, etc.).
  - Verify compatibility with Next.js 15.x and React 19.x during updates.
  - Re-run build and type-check after updates.
- Demo & preview
  - Provide a live demo URL OR clear local preview instructions.
  - Include demo credentials for admin and customer roles.
  - Add a preview seed or script to populate sample data (document existing seed routes if used).
- Packaging
  - Ensure distributable excludes `node_modules`, `.next`, `.env*`, logs, temporary uploads.
  - Provide Envato ZIP layout:
    - `/Documentation`
    - `/Source Code`
    - `/Preview or Demo`
    - `/Licensing`
  - Verify build succeeds (`pnpm build`/`npm run build`).

## Low Priority

- Documentation additions
  - Deployment guide (Vercel recommended; also generic Node host).
  - Customization guide (branding, colors, constants, SEO, image domains).
  - Support and contact information in README.
  - Changelog template and versioning notes.
  - Update migration tips for buyers.
- Asset licensing
  - Document licensing for all images, icons, fonts in `public/`.
  - Replace any non-royalty-free assets or include license sources/attribution.
- Performance and UX polish
  - Code-splitting and lazy-loading for larger sections.
  - Verify caching strategy (Redis) docs and toggles for buyers.
  - Review image domains in `next.config.ts` and optimize image sizes.

## Code Quality & Linting

- ESLint configuration
  - Raise critical rules from "warn" to "error" for production:
    - `@typescript-eslint/no-unused-vars`
    - `@typescript-eslint/no-explicit-any` (or selectively allow)
    - `react-hooks/exhaustive-deps`
  - Add Prettier integration if missing and document formatting commands.
- Unused imports and dead code cleanup across repo.
- Ensure strong typing for API handlers and utilities; avoid `any` where feasible.

## Environment & Config

- Environment validation
  - Add a startup validator (e.g., Zod) to fail fast on missing critical envs in production.
- Centralize and document configuration
  - Ensure constants under `lib/constants/` cover branding, currency, cities, and expose easy customization points.

## Security (API & Auth)

- NextAuth / JWT session
  - Ensure `JWT_SECRET` is required in production, no fallback.
  - Confirm session maxAge and token claims meet business needs.
- Sensitive integrations
  - TCS API: ensure credentials only from env; never log request/response bodies in production.
  - WhatsApp/AWS/SMTP: verify no secrets ever shipped to client; sanitize logs.
- Input validation
  - Retain/extend Zod validation on admin and public endpoints.

## Demo & Preview

- Add quickstart script/section
  - One-command start with clear prerequisites (Node, pnpm).
  - Document how to set env, seed data, login, and navigate admin.

## Packaging & File Organization

- Verify repository scripts
  - If monorepo: add actual `apps/` entries for `@dehlimirch/site` and `@dehlimirch/admin`, or simplify scripts to single app root.
  - Ensure `pnpm-lock.yaml` is included; clarify pnpm usage in docs.
- Include `/Documentation` folder with all markdown guides (setup, deployment, customization, SEO, shipping, components).

## Customization / Configurability

- Theming
  - Document Tailwind customization and CSS variables.
  - Provide examples for changing brand colors, logo, meta tags.
- SEO
  - Document how to customize SEO via `lib/seo.ts` and route metadata.

## Specific Code Hotspots To Address

- `app/(site)/page.tsx`
  - Remove `console.debug` calls printing product lists and data.
- `app/api/checkout/route.ts`
  - Remove debug logs; keep structured error logging.
  - Ensure no sensitive data is logged.
- `app/api/cart/route.ts`
  - Remove debug logs for user/session IDs; retain error logs.
- `lib/auth.ts` and `middleware.ts`
  - Require `JWT_SECRET` in production; remove fallback.

## Verification Checklist (Pre-Submission)

- Build passes locally and on CI (type-check, lint, build).
- All console logs removed or gated by env.
- `.env.example` complete; startup env validation added.
- LICENSE and asset licensing documentation included.
- Demo credentials and preview instructions available.
- Security headers and basic rate limiting added.
- Docs: Setup, Deployment, Customization, Support, Changelog.
- Packaging matches Envato structure and excludes non-distributables.

## Resolution

- Production console removal is configured in `next.config.ts` via `compiler.removeConsole` for production (excluding `error` and `warn`).
- Global SEO scaffolding is implemented: `app/robots.ts`, `app/sitemap.ts`, and `app/manifest.ts` exist and are wired.
- Global metadata and JSON‑LD are defined in `app/(site)/layout.tsx` (metadataBase, robots, OG/Twitter, icons; WebSite + Organization JSON‑LD).
- Fallback JWT secrets still present and require action: `lib/auth.ts` and `middleware.ts` use `process.env.JWT_SECRET || "fallback-secret"` (must be removed for production).
- No `LICENSE` or `.env.example` found yet in the repo; both remain pending.
- No `/api/og` route found; dynamic OG images remain pending. `apple-touch-icon.png` not found under `public/` and remains pending.

## Optional Enhancements

- Add automated tests for critical APIs (auth, checkout, orders).
- Add Sentry or similar for error monitoring (document opt-in).
- Provide Dockerfile and compose for local dev with Mongo/Redis.

---

Owner notes:

- Monorepo scripts currently reference `@dehlimirch/site` and `@dehlimirch/admin`. Either add those workspaces or refactor scripts to target the actual app path. Ensure buyers have a frictionless `pnpm install && pnpm dev && pnpm build` experience.
