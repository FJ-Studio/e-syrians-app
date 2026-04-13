#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Blocks debug statements from sneaking into commits.
 *
 * Runs against the staged versions of *.ts / *.tsx / *.js / *.mjs files
 * (so renaming or deleting files doesn't trigger false positives) and
 * flags:
 *   - console.log(...) — use console.warn / console.error for real logs
 *   - debugger
 *   - describe.only / it.only / test.only — focused tests silently skip
 *     the rest of the suite in CI
 *
 * Runs via the Husky pre-commit hook. Bypass only with --no-verify when
 * you know what you're doing.
 */
const { execSync } = require("child_process");

const patterns = [
  { name: "console.log", regex: /\bconsole\s*\.\s*log\s*\(/ },
  // Match `debugger` as a bare statement (own line or after a `;`) to avoid
  // tripping on the word inside strings, comments, or identifiers.
  { name: "debugger", regex: /(?:^|;)\s*debugger\s*;?\s*$/ },
  {
    name: ".only(...) test focus",
    regex: /\b(describe|it|test)\s*\.\s*only\s*\(/,
  },
];

// `git diff --cached -U0` shows only the added/modified lines in the
// staged diff. We only fail on lines that start with `+` (additions)
// and skip any line that also contains `eslint-disable` so intentional
// usage can still be committed.
let diff;
try {
  diff = execSync('git diff --cached -U0 --diff-filter=AM -- "*.ts" "*.tsx" "*.js" "*.mjs" "*.cjs"', {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (err) {
  console.error("Failed to read staged diff:", err.message);
  process.exit(1);
}

if (!diff.trim()) {
  process.exit(0);
}

let currentFile = null;
let skipCurrentFile = false;
const violations = [];

// Build/tooling scripts legitimately use console.log for user-facing output
// and aren't shipped to production, so they're exempt from this check.
const isExemptFile = (file) => file.startsWith("scripts/");

for (const line of diff.split("\n")) {
  if (line.startsWith("+++ b/")) {
    currentFile = line.slice(6);
    skipCurrentFile = isExemptFile(currentFile);
    continue;
  }
  if (skipCurrentFile) {
    continue;
  }
  if (!line.startsWith("+") || line.startsWith("+++")) {
    continue;
  }
  const added = line.slice(1);
  if (added.includes("eslint-disable")) {
    continue;
  }
  for (const { name, regex } of patterns) {
    if (regex.test(added)) {
      violations.push({ file: currentFile, name, text: added.trim() });
    }
  }
}

if (violations.length > 0) {
  console.error("\n🔴 Debug statements found in staged changes:\n");
  for (const v of violations) {
    console.error(`  ${v.file}`);
    console.error(`    ${v.name}: ${v.text}`);
  }
  console.error("\nRemove these before committing, or use `--no-verify` if you know what you are doing.");
  process.exit(1);
}
