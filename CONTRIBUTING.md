# Contributing to e-Syrians Web App

Thank you for your interest in contributing! This guide will help you get set up and ensure your contributions meet the project's standards.

## Getting Started

### Prerequisites

- Node.js 22+ and npm
- A running instance of the [e-Syrians API](https://github.com/FJ-Studio/e-syrians-api) (local, staging, or your own fork)

### Setup

1. Fork the repository and clone your fork:

```bash
git clone git@github.com:YOUR_USERNAME/e-syrians-app.git
cd e-syrians-app
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and fill it in:

```bash
cp .env.example .env.local
```

At minimum you'll need `NEXTAUTH_SECRET`, the API base URL, and a Google OAuth client if you plan to test social sign-in.

4. Run the dev server:

```bash
npm run dev
```

5. Verify everything works:

```bash
npm run lint:check
npm run format:check
npm run types
npm test
npm run check-translations
```

When you run `npm install`, Husky automatically registers the pre-commit and commit-msg hooks via the `prepare` script. Every commit you make will be checked for code quality before it goes through.

## Code Quality Standards

This project enforces strict code quality through automated tooling. All checks run automatically on every commit via Husky, and again in CI on every pull request.

### Formatting — Prettier

Prettier enforces formatting with the import-organizer and Tailwind class-sorter plugins. To format your code:

```bash
npm run format
```

To check without modifying files:

```bash
npm run format:check
```

### Linting — ESLint

ESLint runs the Next.js core-web-vitals ruleset, TypeScript-aware rules, and project-specific overrides. `no-console` is treated as an error (`console.warn` and `console.error` are allowed).

```bash
npm run lint
```

To check without modifying files:

```bash
npm run lint:check
```

### Type Checking — TypeScript

TypeScript runs in strict mode. All new code must type-check:

```bash
npm run types
```

### Tests — Vitest

All new features and bug fixes should include tests. Run the test suite with:

```bash
npm test
```

### Translation Keys

All UI copy lives in `messages/{en,ar,ku}.json`. English (`en.json`) is the base. Every key added to the base must also be translated in the other locales. The check script runs on every commit and in CI:

```bash
npm run check-translations
```

If you're adding new UI copy and don't speak Arabic or Kurdish, it's fine to use a placeholder English string in `ar.json` and `ku.json` for the initial PR — flag it in the PR description so a native speaker can follow up. What's not acceptable is a missing key.

### What the Pre-Commit Hook Checks

Every commit is automatically checked for:

- **ESLint + Prettier** via lint-staged (only on files you changed)
- **TypeScript** (`tsc --noEmit`)
- **Translation sync** (`check-translations`)
- **Debug-statement blacklist** — blocks `console.log`, `debugger`, and `.only(` in test files

The commit-msg hook checks:

- **Commitlint** — your commit message must follow Conventional Commits

If any check fails, your commit will be rejected with an explanation of what to fix.

## Commit Message Convention

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type: short description
```

Allowed types: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`, `test`

Examples:

```
feat: add two-factor authentication setup flow
fix: prevent double-submit on vote button
refactor: extract poll audience failure mapping to helper
docs: update README with new env variables
test: add coverage for create-poll form submission
```

## Pull Request Process

1. Create a feature branch from `develop`:

```bash
git checkout -b feat/your-feature develop
```

2. Make your changes with well-structured commits.

3. Make sure all checks pass locally:

```bash
npm run lint:check
npm run format:check
npm run types
npm test
npm run check-translations
npm run build
```

4. Push your branch and open a pull request against `develop`.

5. Fill out the PR template — describe what changed, why, and how to test it. Include screenshots for UI changes.

6. Wait for CI to pass and a maintainer to review.

## Working with Translations

The app is translated into Arabic (`ar`), English (`en`), and Kurdish Kurmanji (`ku`). We use [Crowdin](https://crowdin.com) for translation management (see `crowdin.yml`). If you're adding a new feature with user-facing copy, follow this order:

1. Add the English strings to `messages/en.json` first — this is the canonical source.
2. Run `npm run check-translations` — it will list the missing keys in the other locales.
3. Add translations to `ar.json` and `ku.json` (or use English placeholders if you don't speak those languages, flagged in the PR description).
4. Commit.

## Questions?

If you're unsure about anything, open an issue and ask. We'd rather help you contribute than have you get stuck.
