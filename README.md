# e-Syrians Web App

The Next.js web app for e-Syrians, a community platform and census tool for Syrian citizens. It consumes the [e-Syrians API](https://github.com/FJ-Studio/e-syrians-api) and provides user-facing interfaces for authentication, peer-to-peer identity verification, demographic polling, violation reporting, and census statistics.

## Tech Stack

Built with Next.js 16 (App Router) and React 19, using next-auth v5 for session management, next-intl for multilingual support (Arabic, English, Kurdish), HeroUI for the component library, Tailwind CSS v4 for styling, react-hook-form for forms, and Zod for schema validation. Tests are written with Vitest.

## Features

**Authentication** — Email/password sign-in, Google OAuth, two-factor authentication with recovery codes, password reset, and email verification flows.

**Identity Verification** — Peer-to-peer verification UX where users review and vouch for each other's identity.

**Polling** — Create polls with demographic audience targeting (age, country, hometown, ethnicity, religious affiliation, gender, or an allow-list of specific voters), vote on polls, react with upvotes/downvotes, and view aggregate results.

**Violation Reporting** — Submit violation reports with file attachments, categorize them, and track status.

**Census Dashboard** — Browse platform-wide demographic statistics with interactive charts.

**Internationalization** — Full Arabic, English, and Kurdish (Kurmanji) support with right-to-left layout for Arabic.

## Getting Started

### Prerequisites

- Node.js 22+ and npm
- A running instance of the [e-Syrians API](https://github.com/FJ-Studio/e-syrians-api) (local or staging)

### Installation

```bash
git clone git@github.com:FJ-Studio/e-syrians-app.git
cd e-syrians-app
npm install
cp .env.example .env.local
```

Edit `.env.local` and set at minimum the API base URL and the next-auth secret.

### Running the Development Server

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npm run types
```

### Translation Sync Check

```bash
npm run check-translations
```

This script flags any key that exists in `messages/en.json` but is missing from `ar.json` or `ku.json`, and vice versa.

## Code Quality

This project enforces strict code quality through automated tooling. All checks run on every commit via Husky pre-commit hooks, and again in CI on every pull request.

**ESLint** — Next.js config plus TypeScript-aware rules. `no-console` is treated as an error (warn/error are allowed). Run `npm run lint` to auto-fix, `npm run lint:check` to verify.

**Prettier** — Formatting with the import-organizer and Tailwind class-sorter plugins. Run `npm run format` to write, `npm run format:check` to verify.

**TypeScript** — Strict mode. Run `npm run types` to type-check without emitting.

**Vitest** — Test runner. Run `npm test`.

**Translation Sync** — Run `npm run check-translations`. Fails CI if any locale drifts from the English base.

**Conventional Commits** — Commit messages must follow the format `type: description` where type is one of: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`, `test`.

**Debug-Statement Blacklist** — A pre-commit script blocks `console.log`, `debugger`, and `.only(` from being committed.

Husky registers the hooks automatically on `npm install` via the `prepare` script. No extra setup is needed.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before getting started. The guide covers the development setup, code quality standards, commit conventions, and pull request process. By participating you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).
