/* Composition helpers: place many flowers at once and grow foliage around them. */
import { createRng } from './random.mjs';
import { angleTo, g, place, polar, withPrecision } from './svg.mjs';
import { berries, blossom, bud, eucalyptus, leaf, loosePetal, rose, sprig } from './flora.mjs';

/** Renderer per kind, its canonical size, and the coordinate precision it needs. */
const KINDS = {
  rose: { fn: rose, base: 100, decimals: 0 },
  leaf: { fn: leaf, base: 100, decimals: 0 },
  sprig: { fn: sprig, base: 100, decimals: 0 },
  eucalyptus: { fn: eucalyptus, base: 100, decimals: 0 },
  berries: { fn: berries, base: 70, decimals: 1 },
  blossom: { fn: blossom, base: 10, decimals: 1 },
  bud: { fn: bud, base: 62, decimals: 0 },
  petal: { fn: loosePetal, base: 58, decimals: 1 },
};

const paletteKey = (p) => (typeof p === 'string' ? p : p?.id ?? 'default');

/**
 * Renders items `{ kind, x, y, size, rotate, flip, layer, opacity, ...params }`.
 * Lower `layer` draws first. `size` is the on-canvas size: radius for roses and
 * blossoms, length for leaves, sprigs, eucalyptus, berries and buds.
 *
 * With `reuse` (default) leaves and roses are drawn once per variant and placed
 * with `<use>`, which keeps big compositions small. Front-facing roses get a
 * random spin so repeated variants don't look identical.
 */
export function arrange(defs, items, { seed = 1, reuse = true, leafVariants = 10, roseVariants = 3 } = {}) {
  const rng = createRng(seed);
  return items
    .map((it, i) => ({ it, i, s: rng.int(1, 2 ** 30), spin: rng.range(0, 360), v: rng.next() }))
    .sort((a, b) => (a.it.layer ?? 0) - (b.it.layer ?? 0) || a.i - b.i)
    .map(({ it, s, spin, v }) => {
      const { kind, x, y, size, rotate = 0, flip, layer, opacity, scale: fixed, sx, sy, markup, ...params } = it;
      void layer;
      if (kind === 'raw') return g({ transform: place({ x, y, rotate, scale: fixed ?? 1, flip }), opacity }, markup);
      const k = KINDS[kind];
      if (!k) throw new Error(`Unknown kind "${kind}"`);
      const scale = fixed ?? (size ? size / k.base : 1);
      let extraSpin = 0;
      let body;
      if (reuse && kind === 'leaf') {
        const variant = Math.floor(v * leafVariants);
        body = defs.symbol(`leaf-${paletteKey(params.palette ?? 'sage')}-${variant}`, () =>
          withPrecision(0, () => leaf(defs, { palette: params.palette, seed: 1000 + variant * 7919, bend: (variant / leafVariants - 0.5) * 0.4, width: 0.38 + (variant % 3) * 0.05 })),
        );
      } else if (reuse && kind === 'rose') {
        const tilt = Math.round((params.tilt ?? 0) * 5) / 5;
        const variant = (params.seed ?? s) % roseVariants;
        if (tilt === 0) extraSpin = spin;
        body = defs.symbol(`rose-${paletteKey(params.palette ?? 'blush')}-${tilt}-${variant}`, () =>
          withPrecision(0, () => rose(defs, { ...params, tilt, seed: 5000 + variant * 104729 })),
        );
      } else {
        body = withPrecision(k.decimals, () => k.fn(defs, { seed: s, ...params }));
      }
      return g(
        {
          transform: place({
            x,
            y,
            rotate: rotate + extraSpin,
            scale,
            flip,
            sx: sx != null ? sx * scale : undefined,
            sy: sy != null ? sy * scale : undefined,
          }),
          opacity,
        },
        body,
      );
    })
    .join('');
}

/**
 * Leaves tucked behind every rose, pointing away from `origin`
 * (e.g. the corner a bouquet grows from).
 */
export function leavesAround(
  roses,
  { origin, seed = 1, perRose = [2, 3], spread = 70, palettes = ['sage', 'olive'], length = [0.95, 1.5], layer = -10, kinds = ['leaf'] } = {},
) {
  const rng = createRng(seed);
  const out = [];
  for (const r of roses) {
    const base = origin ? angleTo(origin, [r.x, r.y]) : rng.range(0, 360);
    const n = rng.int(perRose[0], perRose[1]);
    for (let i = 0; i < n; i++) {
      const a = base + rng.range(-spread, spread);
      const [x, y] = polar(r.size * rng.range(0.5, 0.8), a, r.x, r.y);
      const kind = rng.pick(kinds);
      out.push({
        kind,
        x,
        y,
        rotate: a,
        size: r.size * rng.range(length[0], length[1]) * (kind === 'leaf' ? 1 : 1.6),
        palette: rng.pick(palettes),
        bend: rng.range(-0.2, 0.2),
        layer,
      });
    }
  }
  return out;
}
