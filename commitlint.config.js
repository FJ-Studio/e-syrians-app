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
    // Matches the e-syrians-api repo convention (lowercase subject, no
    // trailing period). The body line limit defaults to 100 characters.
    "subject-case": [2, "always", "lower-case"],
  },
};
