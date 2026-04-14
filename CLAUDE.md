# CLAUDE.md — E-Syrians App (Frontend)

## Project Overview

E-Syrians is a community platform for Syrian citizens. This is the **Next.js 16 frontend** that talks to a Laravel 12 backend API. Core features: user registration/authentication, peer-to-peer identity verification, demographic polls with audience targeting, violation reporting, census data collection, and statistics dashboards.

Tech stack: Next.js 16, React 19, TypeScript, NextAuth v5 (beta.25), next-intl, HeroUI v2, Tailwind CSS v4, react-hook-form, Zod, Recharts, Sonner (toasts), Framer Motion.

Production URL: https://www.e-syrians.com

## Directory Structure

```
src/
├── app/
│   ├── [locale]/          # All pages wrapped in locale segment
│   │   ├── layout.tsx     # Root layout (providers, header, footer, census form)
│   │   ├── page.tsx       # Homepage
│   │   ├── account/       # Protected — dashboard, polls, settings, verifications
│   │   ├── auth/          # signin, forgot-password, reset-password
│   │   ├── census/        # Public census pages, verification view (/v/[uuid])
│   │   ├── polls/         # Public poll list and detail (/polls/[id])
│   │   ├── violations/    # Public violations list
│   │   ├── faq/
│   │   ├── terms/
│   │   ├── privacy-policy/
│   │   └── verify-email/
│   ├── api/               # Next.js API routes (proxy to Laravel)
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── account/       # Authenticated proxy routes
│   │   ├── census/        # Registration & stats
│   │   └── polls/         # Vote, react, voters
│   ├── actions.ts         # Server actions
│   ├── globals.css
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── account/           # Auth forms, dashboard, profile, settings
│   ├── census/            # Census form (rendered globally), charts, stats
│   ├── charts/            # Recharts wrappers
│   ├── home/              # Homepage components
│   ├── hooks/             # Custom hooks
│   │   ├── localization/  # Enum-to-label mapping hooks (14 files)
│   │   └── use-poll-table.ts
│   ├── pages/             # Static page components
│   ├── polls/             # Poll cards, voting UI, voters modal
│   ├── shared/            # Header, footer, nav, language switcher, contexts
│   └── violations/        # Violation components
├── i18n/
│   ├── routing.ts         # Locale config, navigation wrappers
│   └── request.ts         # Server-side message loading
├── lib/
│   ├── api-route.ts       # API proxy helpers (core infrastructure)
│   ├── api/requests.ts    # Server-side data fetching (safeFetch pattern)
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # App constants (locales, census limits)
│   ├── fonts/             # Font configuration
│   ├── extract-errors.ts  # Error response normalizer
│   ├── recaptcha.ts       # Client & server reCAPTCHA utilities
│   ├── capitalize.ts
│   ├── in-audience.ts
│   ├── is-verified.ts
│   ├── revalidate.ts
│   ├── sort-object.ts
│   ├── str-array.ts
│   └── years-months.ts
├── middleware.ts           # Auth protection + i18n middleware
messages/
├── ar.json                # Arabic translations
├── en.json                # English translations
└── ku.json                # Kurdish translations
auth.ts                    # NextAuth configuration (root level)
```

## Authentication (NextAuth v5)

Configured in `auth.ts` at the project root. Two providers: Credentials (email/password) and Google OAuth.

**Flow:** Client calls NextAuth → `authorize()` calls Laravel `POST /users/login` → receives `{ data: { user, token } }` → stores full user object + Sanctum token in JWT as `token.esUser`.

**Session structure:** `session.user` is typed as `AdapterUser & ESUser`. The `accessToken` field holds the Laravel Sanctum bearer token.

**Token expiry:** 7 days (`MAX_AGE`). The JWT callback checks `token.iat` against current time and clears `esUser` if expired.

**Client-side session update:** The JWT callback handles `trigger === "update"` to merge partial updates into `token.esUser`. Used for syncing verification status changes without re-login: `await updateSession({ verified_at: newValue })`.

**Important:** Always use optional chaining when accessing session data in components that render globally (outside `/account`): `session.data?.user?.uuid`, not `session.data?.user.uuid`.

## API Proxy Pattern

All client-to-backend communication goes through Next.js API routes that proxy to Laravel. This keeps the Laravel API URL and Sanctum tokens server-side.

### Proxy Helpers (`src/lib/api-route.ts`)

Five helpers, from high-level to low-level:

**`proxyJsonPost({ endpoint, requireRecaptcha?, transformBody?, onSuccess? })`** — Authenticated POST with JSON body. Most common for account actions.

**`proxyPublicJsonPost({ endpoint, bodySchema? })`** — Unauthenticated POST with reCAPTCHA. Used for login, registration, forgot-password.

**`proxyFormDataPost({ endpoint, requireRecaptcha?, requireAuth?, forwardHeaders? })`** — Authenticated POST with FormData. Used for file uploads (avatar), poll creation.

**`proxyGet({ endpoint, forwardParams? })`** — Authenticated GET with query param forwarding. Used for paginated lists.

**Low-level wrappers:** `withApiRoute()`, `withFormDataApiRoute()`, `withAuthGet()` — for routes needing custom logic.

### Typical API Route File

```typescript
// src/app/api/polls/vote/route.ts
import { proxyJsonPost } from "@/lib/api-route";
export const POST = proxyJsonPost({ endpoint: "/polls/vote" });
```

Most routes are 2-5 lines using proxy helpers. Only use low-level wrappers when you need custom response handling (e.g., `onSuccess` callback to update session).

### Server-Side Data Fetching (`src/lib/api/requests.ts`)

For server components and pages, use `safeFetch<T>()` which wraps fetch in try-catch and returns `ApiResponse<T> | null`. Existing functions: `getPoll`, `getPolls`, `getFirstRegistrants`, `getUser`, `verifyEmail`.

## Error Handling

### Backend Error Format

All Laravel responses follow: `{ success: boolean, messages: string[], data: any }`. Error messages are **raw string keys** (e.g., `"poll_has_expired"`), never translated.

### Frontend Error Flow

1. **`extractErrors()`** (`src/lib/extract-errors.ts`) — Normalizes error responses (array or object-of-arrays) into a flat `string[]`.

2. **`useServerError()`** hook (`src/components/hooks/localization/server-errors.tsx`) — Maps backend error keys to localized strings via `useTranslations("server_errors")`. If a key doesn't match any known mapping, it returns the raw string as-is (no generic fallback).

3. **Toast display** — Errors are shown via Sonner's `toast.error()`.

### Typical Error Handling in Components

```typescript
const response = await fetch("/api/polls/vote", { method: "POST", body: JSON.stringify(data) });
if (!response.ok) {
  const errorData = await response.json();
  const msg = errorData?.messages?.[0];
  toast.error(msg ? getServerError(msg) : t("error"));
}
```

## Localization

Three languages: Arabic (`ar`, default, RTL), English (`en`, LTR), Kurdish (`ku`, LTR).

### Setup

- **Routing:** `src/i18n/routing.ts` — defines locales, default locale (`ar`), `localePrefix: 'always'`, exports `Link`, `redirect`, `usePathname`, `useRouter` from next-intl.
- **Messages:** `messages/{ar,en,ku}.json` — flat JSON with nested keys.
- **Middleware:** `src/middleware.ts` integrates next-intl with auth checks.

### Usage

In components: `const t = useTranslations("namespace.path")`, then `t("key")`.

### Localization Hooks (`src/components/hooks/localization/`)

14 hooks that map backend enum values to localized labels. Each returns an object of `{ value: label }` pairs:

`useGender`, `useProvinces`, `useReligiousAffiliation`, `useEthnicity`, `useCountries`, `useEducation`, `useHealth`, `useIncome`, `useLanguages`, `usePollResultsReveal`, `useCannotVote`, `useInitiatives`, `useVerificationCancelationReason`, `useServerError`

## Provider Stack

Root layout wraps everything in this order (see `src/app/[locale]/layout.tsx`):

```
<SessionProvider>           # NextAuth session
  <NextIntlClientProvider>  # Translations
    <Providers>             # src/components/shared/contexts/providers.tsx
      <HeroUIProvider>      # UI components
        <EsyrianProvider>   # App context (census form state, stats)
          {children}
        </EsyrianProvider>
      </HeroUIProvider>
      <Toaster />           # Sonner toast notifications
    </Providers>
  </NextIntlClientProvider>
</SessionProvider>
```

**EsyrianProvider** (`src/components/shared/contexts/es.tsx`) — manages census form open/close state, census stats, and auto-syncs user language preference on locale change. Access via `useEsyrian()` hook.

**Important:** `CensusForm` and `EsyrianProvider` render on **every page** (not just authenticated routes). Always guard session access with optional chaining.

## Middleware

`src/middleware.ts` combines NextAuth's `auth()` wrapper with next-intl's locale middleware:

- `/api/auth/*` — passes through (NextAuth handlers)
- `/auth/*` when logged in → redirects to `/account`
- `/account/*` when not logged in → redirects to `/auth/signin?redirect=...`
- Everything else — runs intl middleware for locale detection/prefixing

Route matcher excludes `api`, `_next`, and static files.

## Key Types (`src/lib/types/`)

- **`account.ts`** — `ESUser` type with 60+ fields (profile, census, social links, verification, tokens)
- **`polls.ts`** — `Poll`, `PollOption`, `PollVoter`, `PollVotersResponse`, `CreatePollFields`, `PollAudience`
- **`census.ts`** — `CensusStats` and related types
- **`violations.ts`** — Violation types
- **`misc.ts`** — `ApiResponse<T>` generic wrapper
- **`locale.ts`** — Locale type derived from `LOCALES` constant
- **`charts.ts`** — Chart data types

## UI Components

**HeroUI v2** — primary component library. Used for: Avatar, AvatarGroup, Button, Input, Select, Modal, Spinner, DatePicker, NumberInput, Slider, Alert, Tabs, etc.

**Icons:** `@iconify/react` for the `<Icon>` component, with icon data imported statically from `@iconify-icons/heroicons` (and other `@iconify-icons/*` collections as needed). Example: `import plusIcon from "@iconify-icons/heroicons/plus"` then `<Icon icon={plusIcon} className="size-5" />`. Static imports avoid the runtime fetch to `api.iconify.design` which would be blocked by our CSP's `connect-src`.

**Forms:** `react-hook-form` with `Controller` pattern for HeroUI components. Zod for schema validation on public routes (via `proxyPublicJsonPost`'s `bodySchema`).

**Toasts:** Sonner — `toast.success()`, `toast.error()`. Positioned bottom-left.

## reCAPTCHA

Google reCAPTCHA v3. Two utilities in `src/lib/recaptcha.ts`:

- **Client-side:** `generateToken(action)` — calls `grecaptcha.execute()`, used before form submission.
- **Server-side:** `recaptchaIsValid(token)` — verifies token with Google API using `RECAPTCHA_SECRET_KEY`.

API proxy helpers have `requireRecaptcha` option (defaults to `false` in `withApiRoute`/`withFormDataApiRoute`, `true` in `proxyPublicJsonPost`).

## Environment Variables

Key variables (set in `.env.local`):

- `API_URL` — Laravel backend URL (server-side only)
- `NEXT_PUBLIC_RECAPTCHA` — reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` — reCAPTCHA secret (server-side only)
- `NEXT_PUBLIC_DOMAIN_NAME` — Display domain name
- `NEXT_PUBLIC_DOMAIN_URL` — Public frontend URL
- `AUTH_SECRET` — NextAuth secret
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials

## Key Conventions

1. **All pages under `[locale]` segment** — every page URL is prefixed with locale (`/ar/`, `/en/`, `/ku/`)
2. **Default locale is Arabic (`ar`)** — RTL layout when `locale === "ar"`
3. **API routes are thin proxies** — use proxy helpers, keep custom logic minimal
4. **Backend sends raw error keys** — frontend localizes via `useServerError()` hook
5. **Optional chaining on session** — always `session.data?.user?.field` in globally-rendered components
6. **Forms use Controller pattern** — `react-hook-form` Controller wrapping HeroUI inputs
7. **Server components for data fetching** — use `safeFetch` from `src/lib/api/requests.ts` in page components
8. **Client components marked with `"use client"`** — any component using hooks, state, or browser APIs
9. **Navigation uses next-intl wrappers** — import `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/routing`, not from `next/navigation`
10. **Translation check script** — run `npm run check-translations` to find missing keys across locale files

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run check-translations  # Find missing translation keys
```
