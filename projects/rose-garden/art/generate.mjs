#!/usr/bin/env node
/**
 * Generates every illustration for the Rose Garden theme into src/assets/art.
 *
 *   npm run art -- rose-garden          (from the repo root)
 *   node art/generate.mjs [filter]      (from this project; optional name filter)
 *
 * Everything is seeded, so the output only changes when the code changes.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgDocument } from '@wedding/art';
import * as scenes from './scenes.mjs';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'art');
mkdirSync(out, { recursive: true });

const jobs = {
  'garland-top': () => scenes.garlandTop(),
  'garland-bottom': () => scenes.garlandBottom(),
  'corner-bouquet': () => scenes.cornerBouquet(),
  'rose-blush': () => scenes.singleRose('blush', 701),
  'rose-red': () => scenes.singleRose('red', 702),
  'rose-ivory': () => scenes.singleRose('ivory', 703),
  'petal-blush': () => scenes.petal('blush', 711),
  'petal-pink': () => scenes.petal('pink', 712),
  'petal-ivory': () => scenes.petal('ivory', 713),
  'petal-red': () => scenes.petal('red', 714),
  'bush-left': () => scenes.bush('left'),
  'bush-right': () => scenes.bush('right'),
  'foreground-left': () => scenes.foreground('left'),
  'foreground-right': () => scenes.foreground('right'),
  arch: () => scenes.arch(),
  garden: () => scenes.gardenBackdrop(),
  couple: () => scenes.coupleArt(),
  groom: () => scenes.groomArt(),
  bride: () => scenes.brideArt(),
  'filigree-corner': () => scenes.ornament('filigree'),
  divider: () => scenes.ornament('divider'),
  crest: () => scenes.ornament('crest'),
  seal: () => scenes.ornament('seal'),
  compass: () => scenes.ornament('compass'),
  damask: () => scenes.ornament('damask'),
  'card-arch': () => scenes.cardArch(),
  sigil: () => scenes.sigil(),
  map: () => scenes.venueMap(),
};

const filter = process.argv[2];
if (!filter) {
  // remove scratch sheets from earlier experiments
  for (const f of readdirSync(out)) if (f.startsWith('sheet-')) rmSync(join(out, f));
}

let total = 0;
for (const [name, make] of Object.entries(jobs)) {
  if (filter && !name.includes(filter)) continue;
  const { width, height, viewBox, defs, body } = make();
  const svg = svgDocument({ width, height, viewBox, defs, body });
  writeFileSync(join(out, `${name}.svg`), svg);
  total += svg.length;
  console.log(`${name.padEnd(18)} ${(svg.length / 1024).toFixed(1).padStart(7)} KB`);
}
console.log(`${'total'.padEnd(18)} ${(total / 1024).toFixed(1).padStart(7)} KB`);

if (!filter || 'favicon'.includes(filter)) {
  const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
  mkdirSync(pub, { recursive: true });
  const { width, height, viewBox, defs, body } = scenes.favicon();
  writeFileSync(join(pub, 'favicon.svg'), svgDocument({ width, height, viewBox, defs, body }));
  console.log('favicon.svg        (public/)');
}
