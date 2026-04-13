# Security Policy

## Supported Versions

We actively maintain the `main` branch. Security fixes are only backported to the latest released version.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

e-Syrians handles identity verification data and personally identifiable information. If you discover a vulnerability, please report it privately so we can investigate and fix it before details are made public.

### How to report

Email **fj@fj.studio** with:

- A clear description of the vulnerability
- Steps to reproduce (proof-of-concept if possible)
- The affected component (web app, API, or both)
- Your assessment of the impact
- Any suggested remediation

You can also use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) feature if you prefer.

### What to expect

- **Acknowledgment** within 72 hours
- **Initial assessment** within 7 days (severity, scope, affected versions)
- **Fix and coordinated disclosure** — we'll work with you on a disclosure timeline. For critical issues, we aim to ship a fix within 30 days

### Scope

In scope:

- The web app in this repository
- Authentication flows (session handling, 2FA, OAuth)
- Authorization bypasses (e.g., viewing polls you shouldn't, voting as another user)
- Sensitive data exposure (PII, tokens, session data)
- XSS, CSRF, and similar client-side vulnerabilities

Out of scope:

- Vulnerabilities in third-party dependencies with published CVEs (report those upstream; we'll pick up the fix via Dependabot)
- Theoretical attacks without a practical proof-of-concept
- Issues that require physical access to an unlocked device
- The e-Syrians API — report those at the [API repository](https://github.com/FJ-Studio/e-syrians-api)

Thank you for helping keep e-Syrians users safe.
