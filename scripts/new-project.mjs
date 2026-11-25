#!/usr/bin/env node
/**
 * Start a new client invitation by copying an existing project.
 *
 *   npm run new -- aina-and-farhan
 *   npm run new -- aina-and-farhan --from rose-garden
 *
 * Afterwards run `npm install` once so the workspace links the new project,
 * then edit projects/<slug>/src/wedding.config.ts.
 */
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fromFlag = args.indexOf('--from');
const from = fromFlag >= 0 ? args[fromFlag + 1] : 'rose-garden';
const fromValueIndex = fromFlag >= 0 ? fromFlag + 1 : -1;
const slug = args.find((a, i) => !a.startsWith('--') && i !== fromValueIndex);

if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('Usage: npm run new -- <slug> [--from <existing-project>]\nThe slug may contain lowercase letters, digits and dashes.');
  process.exit(1);
}

const src = join(root, 'projects', from);
const dest = join(root, 'projects', slug);
if (!existsSync(src)) {
  console.error(`Template project "${from}" does not exist.`);
  process.exit(1);
}
if (existsSync(dest)) {
  console.error(`projects/${slug} already exists.`);
  process.exit(1);
}

const skip = new Set(['node_modules', 'dist', '.vite']);
cpSync(src, dest, {
  recursive: true,
  filter: (file) => {
    const parts = relative(src, file).split(sep);
    return !parts.some((p) => skip.has(p) || (p.startsWith('.env') && p !== '.env.example'));
  },
});

const pkgPath = join(dest, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = `@projects/${slug}`;
pkg.version = '0.1.0';
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const configPath = join(dest, 'src', 'wedding.config.ts');
if (existsSync(configPath)) {
  const text = readFileSync(configPath, 'utf8').replace(/(\bid:\s*')[^']*(')/, `$1${slug}$2`);
  writeFileSync(configPath, text);
}

console.log(`Created projects/${slug} from projects/${from}.

Next steps:
  1. npm install                      (links the new workspace)
  2. edit projects/${slug}/src/wedding.config.ts
  3. npm run dev -- ${slug}
`);
