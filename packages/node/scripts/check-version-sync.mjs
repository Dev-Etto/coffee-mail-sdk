#!/usr/bin/env node
/**
 * Falha se SDK_VERSION (http-client.ts) ou COFFEEMAIL_VERSION (index.ts)
 * divergirem da versão publicada em package.json. Essas constantes não são
 * derivadas automaticamente do package.json em build time, então precisam
 * ser mantidas em sincronia manualmente — este check evita que a divergência
 * passe despercebida (SDK_VERSION vai no header User-Agent enviado à API).
 *
 * Uso:
 *   node scripts/check-version-sync.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');

const pkg = JSON.parse(
  readFileSync(resolve(PACKAGE_ROOT, 'package.json'), 'utf8')
);
const expectedVersion = pkg.version;

const checks = [
  {
    file: resolve(PACKAGE_ROOT, 'src/core/http-client.ts'),
    pattern: /const SDK_VERSION = "([^"]+)"/,
    constantName: 'SDK_VERSION',
  },
  {
    file: resolve(PACKAGE_ROOT, 'src/index.ts'),
    pattern: /export const COFFEEMAIL_VERSION = "([^"]+)"/,
    constantName: 'COFFEEMAIL_VERSION',
  },
];

let hasMismatch = false;

for (const { file, pattern, constantName } of checks) {
  const contents = readFileSync(file, 'utf8');
  const match = contents.match(pattern);
  if (!match) {
    console.error(`[check-version-sync] could not find ${constantName} in ${file}`);
    hasMismatch = true;
    continue;
  }
  const actualVersion = match[1];
  if (actualVersion !== expectedVersion) {
    console.error(
      `[check-version-sync] ${constantName} in ${file} is "${actualVersion}", ` +
        `but package.json version is "${expectedVersion}". Update the constant.`
    );
    hasMismatch = true;
  }
}

if (hasMismatch) {
  process.exit(1);
}

console.log(`[check-version-sync] OK — all version constants match ${expectedVersion}`);
