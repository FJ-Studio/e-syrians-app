/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Translation key sync check.
 *
 * Compares every locale file in ./messages against the base locale (en.json)
 * and fails with a non-zero exit code if:
 *   - a locale is missing keys that exist in the base,
 *   - a locale has extra keys that don't exist in the base (stale / typos).
 *
 * Run via: `npm run check-translations`.
 */
const fs = require("fs");
const path = require("path");

const messagesDir = path.join(__dirname, "../messages");
const baseLocale = "en";

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function flattenKeys(obj, prefix = "") {
  return Object.keys(obj).reduce((keys, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(...flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
    return keys;
  }, []);
}

const baseFile = path.join(messagesDir, `${baseLocale}.json`);
const baseMessages = readJSON(baseFile);
const baseKeys = flattenKeys(baseMessages);
const baseSet = new Set(baseKeys);

let hasMismatch = false;

fs.readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json") && file !== `${baseLocale}.json`)
  .forEach((file) => {
    const locale = path.basename(file, ".json");
    const targetMessages = readJSON(path.join(messagesDir, file));
    const targetKeys = flattenKeys(targetMessages);
    const targetSet = new Set(targetKeys);

    const missingKeys = baseKeys.filter((key) => !targetSet.has(key));
    const extraKeys = targetKeys.filter((key) => !baseSet.has(key));

    if (missingKeys.length > 0) {
      hasMismatch = true;
      console.error(`\n🔴 Missing keys in ${locale}.json (present in ${baseLocale}.json):`);
      missingKeys.forEach((key) => console.error(`  - ${key}`));
    }

    if (extraKeys.length > 0) {
      hasMismatch = true;
      console.error(`\n🟠 Extra keys in ${locale}.json (not in ${baseLocale}.json):`);
      extraKeys.forEach((key) => console.error(`  - ${key}`));
    }

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`✅ ${locale}.json is in sync with ${baseLocale}.json`);
    }
  });

if (hasMismatch) {
  console.error("\nTranslation files are out of sync. Fix the keys listed above.");
  process.exit(1);
}
