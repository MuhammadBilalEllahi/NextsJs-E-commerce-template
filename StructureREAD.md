Dehli Mirch – Repository Structure and Architecture Guide

Overview
This is a Next.js 15 app-router monorepo for an e-commerce site with an admin panel. It uses MongoDB via Mongoose, Redis for caching, NextAuth (credentials) for auth, Tailwind v4 for styling, and a rich set of API routes for storefront and admin operations.

Tech Stack

- Next.js 15 (App Router)
- React 19
- NextAuth (credentials, JWT sessions)
- MongoDB + Mongoose 8
- Redis (ioredis)
- Zod for validation
- Tailwind CSS 4, Radix UI, lucide-react
- AWS S3 SDK for media

Key Conventions

- All page routes live under `app/` using route segments with `page.tsx`.
- API routes live under `app/api/**/route.ts`.
- Admin UI is under `app/admin/**` and gated by middleware and server session checks.
- Models are registered in `models/index.ts` and imported once by the Mongo connection (`database/mongodb.ts`) to avoid model recompilation.
- Caching keys and TTLs are centralized in `lib/cacheConstants.ts` and accessed via the `database/redisClient.ts` wrapper.
- Use absolute imports with `@/` alias.

Top-level Layout

- `app/`: customer-facing pages
- `app/admin/`: admin dashboard pages
- `app/api/`: public/customer/admin API endpoints
- `components/`: UI/feature components grouped by feature
- `database/`: Mongo and Redis clients + server-side data utilities
- `lib/`: utilities, providers, constants, API client helpers
- `middlewares/`: legacy/alternative middleware (see note below)
- `models/`: Mongoose models and related constants/schemas
- `public/`: static assets
- `types/`: ambient types and extensions

Routing (App Router)

- `app/page.tsx`: home page; other site pages under `app/<segment>/page.tsx` (e.g., `app/shop/page.tsx`, `app/cart/page.tsx`).
- Dynamic routes use bracketed segments, e.g., `app/product/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`.
- Admin pages: `app/admin/**/page.tsx` for each surface (orders, products, categories, etc.).

API Routes

- Location: `app/api/**/route.ts`
- Auth integration: server routes often call `getServerSession(authOptions)` to gate access.
- Database access: always `await dbConnect()` before accessing models.
- Validation: Zod where applicable (e.g., refunds).
- Pagination pattern: `page`, `limit` search params; compute `skip`; return `pagination` meta.

Representative Endpoints

- Admin analytics: `app/api/admin/analytics/route.ts`
  - Aggregates order KPIs (revenue, status, top products, low stock, trends, payment split, shipping split, category sales, refunds). Requires admin session.
- User orders: `app/api/user/orders/route.ts`
  - Returns authenticated user’s orders with populated product/variant info and pagination.
- Refunds: `app/api/refunds/route.ts`
  - GET paginated refunds for user. POST creates refund request with Zod validation and policy checks (refund window via `GlobalSettings`).
- Many admin CRUD endpoints exist under `app/api/admin/*` for products, brands, categories, content pages, shipping methods, wishlist, tcs orders, etc.

Authentication

- Config: `lib/auth.ts`
  - Credentials provider against `User` model with `bcrypt` hash compare (`passwordHash`), JWT strategy sessions.
  - JWT callback enriches `token.role` and `token.id`; session callback mirrors these onto `session.user`.
  - `pages.signIn` is `/account/login`. Secret from `process.env.JWT_SECRET` (fallback present; set env in production).
- Route binding: `app/api/auth/[...nextauth]/route.ts` exports NextAuth handler.
- Admin gating:
  - Edge middleware `middleware.ts`: if path starts with `/admin`, it fetches NextAuth JWT via `getToken` and checks `role === "admin"`; otherwise redirects to `/account/login` or `/` with error.
  - Many admin API routes also verify server session and role server-side for defense in depth.

Middleware

- Active: root `middleware.ts` (Next.js matcher excludes `api`, `_next/static`, `_next/image`, `favicon.ico`).
- Legacy/example: `middlewares/middleware.ts` performs a simpler cookie check. Keep root one as the source of truth; the `middlewares/` version is not wired by default.

Database Layer

- Mongo connection: `database/mongodb.ts`
  - Caches `mongoose` connection in global to avoid re-connects; imports `"@/models"` which registers schemas once.
- Redis client: `database/redisClient.ts`
  - Singleton `ioredis` wrapper with helpers for string/hash/list keys, ttl/expire, pub/sub, and a `disconnect` method.
- Server data utilities: `database/data-service.ts`
  - Provides read APIs for storefront: banners, branches, global settings with Redis cache; product queries (top selling, featured, new arrivals, specials, grocery); categories and brands; product-by-slug with variant ordering; reviews; content pages and footer nav; trending products. Uses `lib/cacheConstants.ts` keys and TTLs.

Models

- All schemas are imported and (re)exported in `models/index.ts` so a single import registers them globally.
- Notable models: `User`, `Product`, `Variant`, `Category`, `Brand`, `Order`, `Cart`, `Wishlist`, `Refund`, `FAQ`, `Banner`, `ContentPage`, `GlobalSettings`, `Notification`, `Counter`, plus relationship helpers (`BrandProducts`, `CategoryProducts`).
- Constants: `models/constants.ts` (e.g., `ORDER_STATUS`).
- Note: `models/AnalyticsLog.ts` is removed per git status; analytics rely on order aggregations instead.

Caching

- Central keys/TTLs in `lib/cacheConstants.ts` (e.g., `CACHE_BANNER_KEY`, `CACHE_CATEGORIES_KEY`, `CACHE_EXPIRE_TIME`, cart keys with durations).
- Accessed via `RedisClient` in server data utilities and can be used in API routes if needed.

UI and Components

- `components/ui/`: shared UI primitives (buttons, inputs, etc.).
- `components/home/`, `components/product/`, `components/cart/`, `components/shop/`, etc.: feature-scoped UI for pages in `app/`.
- `components/admin/`: admin-specific modals, tables, and CRUD surfaces aligned with `app/admin/*`.
- Other feature folders: `branches`, `contact`, `faq`, `reviews`, `wishlist`, `search` align with their routes.

Providers

- `lib/providers/providers-shell.tsx` wraps children in `RootProviders` (defined in `lib/providers/rootProvider`). Use this wrapper when a page/layout needs provider composition.

Lib Utilities

- `lib/utils/utils.ts`: `cn` helper (clsx + tailwind-merge).
- Additional helpers under `lib/utils/` (e.g., `csv.ts`, image uploader in `lib/utils/imageUploader` per convention note), constants in `lib/constants/*`.
- `lib/api/**`: client-side fetch helpers grouped by page/feature to keep UI files lean (see `StructureREAD.md` original note). Admin and storefront separated.

Next.js Configuration

- `next.config.ts`: sets `images` domains and remote patterns for S3-hosted assets.
- `eslint.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`: lint and styling setup.
- Scripts in `package.json`: `dev` (turbopack), `build`, `start`, `lint`, and `init-schemas`.

Types

- `types/next-auth.d.ts`: augments NextAuth session types (role/id on `session.user`).
- `types/types.ts`: shared custom types.

Assets

- `public/`: images, svg, placeholders used throughout the storefront and admin.

Data Flow (Typical Request)

1. Page or component triggers data fetch via a `lib/api/*` helper or directly hits `app/api/*`.
2. API route/server action calls `dbConnect()` and optionally checks session/role.
3. Query via Mongoose models; optionally use `RedisClient` for cache-aside reads.
4. Shape/format data for the UI; return JSON.
5. UI displays data using feature components and UI primitives.

Auth Flow

- Login via `/api/auth/[...nextauth]` using credentials; session stored as JWT.
- Middleware enforces `role === "admin"` on `/admin` paths; server routes also check `getServerSession` for authorization.

Adding a New Feature (Checklist)

- UI: add `app/<feature>/page.tsx`, components under `components/<feature>/`.
- API: add `app/api/<feature>/route.ts`; validate with Zod when mutating.
- Data: extend Mongoose models under `models/` if needed; ensure `models/index.ts` imports it.
- Caching: define keys in `lib/cacheConstants.ts` and use `RedisClient` where appropriate.
- Auth: gate admin routes with session checks; update middleware rules only if paths change.
- Types: extend `types/*` and NextAuth types when adding user/session fields.

Environment Variables

- `MONGODB_URI` (required)
- `REDIS_URL`
- `JWT_SECRET` (required in production; middleware has a fallback but do not rely on it)
- AWS S3 credentials if image uploads are used

Operational Notes

- Always call `await dbConnect()` in server code before any model access.
- When paginating, return `{ page, limit, total, pages }` metadata.
- Prefer `lean()` queries for read endpoints to reduce overhead.
- Normalize email (lowercase) in aggregations when deduplicating.
- For products with variants, many queries compute available variants first and sort by availability.

Known Pitfalls

- Duplicate middleware file in `middlewares/middleware.ts` is not active; the root `middleware.ts` is authoritative.
- Avoid model re-registration by importing from `models/index.ts` only after connecting once in the app lifecycle.
- Don’t rely on fallback JWT secret in production.
- Removed `AnalyticsLog` model; analytics use order aggregations only.

Quick Map of Important Files

- Middleware: `middleware.ts`
- Auth config: `lib/auth.ts`; NextAuth route: `app/api/auth/[...nextauth]/route.ts`
- Mongo: `database/mongodb.ts`; Redis: `database/redisClient.ts`
- Cache keys: `lib/cacheConstants.ts`
- Data utilities: `database/data-service.ts`
- Models registry: `models/index.ts`; constants: `models/constants.ts`
- Example APIs: `app/api/admin/analytics/route.ts`, `app/api/user/orders/route.ts`, `app/api/refunds/route.ts`
- UI primitives: `components/ui/*`

Directory Cheat Sheet

- app/ (customer pages)
- app/admin/ (admin pages)
- app/api/ (public+customer+admin APIs)
- components/admin/[page] (admin components: edit/view/create modal, tables)
- components/[page] (customer components aligned with `app/`)
- components/ui/ (reusable UI primitives)
- database/ (Mongo/Redis clients and server data services)
- lib/api/\*\* (fetch helpers to keep UI lean)
- lib/constants/ (site constants)
- lib/providers/ (app/root providers)
- lib/utils/ (helpers; use `imageUploader` for media)
- middlewares/ (legacy/example middleware)
- models/ (schemas)
- models/constants (database-relevant constants)
