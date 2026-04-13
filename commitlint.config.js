/**
 * Enforces Conventional Commits. Keeps our git history consistent
 * with the e-syrians-api repo and makes `type:` prefixes searchable.
 *
 * Allowed types: feat, fix, refactor, chore, style, docs, test.
 * See CONTRIBUTING.md for examples.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "refactor", "chore", "style", "docs", "test"]],
    // Subject case is intentionally unrestricted — commit subjects frequently
    // reference code identifiers (passWithNoTests, useWatch, NEXTAUTH_SECRET,
    // etc.) whose casing is meaningful. First-character-lowercase is still
    // enforced at the GitHub ruleset layer via `commit_message_pattern`.
    "subject-case": [0],
  },
};
