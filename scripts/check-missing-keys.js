/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages'); // adjust path if needed
const baseLocale = 'en';

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function flattenKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
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

fs.readdirSync(messagesDir)
  .filter(file => file.endsWith('.json') && file !== `${baseLocale}.json`)
  .forEach(file => {
    const locale = path.basename(file, '.json');
    const targetMessages = readJSON(path.join(messagesDir, file));
    const targetKeys = flattenKeys(targetMessages);
    const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));

    if (missingKeys.length > 0) {
      console.log(`\n🔴 Missing keys in ${locale}.json:`);
      missingKeys.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log(`\n✅ ${locale}.json has all keys.`);
    }
  });
