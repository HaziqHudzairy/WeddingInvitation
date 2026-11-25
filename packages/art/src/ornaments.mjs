/*
 * Gold "fantasy" ornaments: filigree corners, dividers, crests, wax seals,
 * compass roses and a damask tile. Each returns a body string drawn inside a
 * fixed box (documented per function); wrap it with svgDocument().
 */
import { createRng } from './random.mjs';
import { GOLD, resolveRose } from './palettes.mjs';
import { rose } from './flora.mjs';
import { circle, ellipse, fmt, g, linear, path, polar, pt, radial, smoothClosed, smoothOpen, spiral } from './svg.mjs';

function goldStroke(defs, w, h, gold = GOLD, id = 'gold-s') {
  return defs.add(id, (gid) =>
    linear(gid, [[0, gold.light], [0.3, gold.mid], [0.5, gold.hi], [0.7, gold.mid], [1, gold.dark]], {
      units: 'userSpaceOnUse',
      x1: 0,
      y1: 0,
      x2: w,
      y2: h,
    }),
  );
}

function goldFill(defs, gold = GOLD, id = 'gold-f') {
  return defs.add(id, (gid) => linear(gid, [[0, gold.hi], [0.35, gold.light], [0.7, gold.mid], [1, gold.dark]], { x1: 0, y1: 0, x2: 1, y2: 1 }));
}

const stroke = (paint, width, extra = {}) => ({ fill: 'none', stroke: paint, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra });

/** Small gold leaf, base at (0,0) pointing up, length 1 (scale it). */
const goldLeaf = (fill, len = 14, w = 5) =>
  path(`M0 0C${fmt(-w)} ${fmt(-len * 0.3)} ${fmt(-w * 0.6)} ${fmt(-len * 0.8)} 0 ${fmt(-len)}C${fmt(w * 0.6)} ${fmt(-len * 0.8)} ${fmt(w)} ${fmt(-len * 0.3)} 0 0Z`, { fill });

/** Diamond centred on (x, y). */
const diamond = (x, y, r, attrs) => path(`M${fmt(x)} ${fmt(y - r)}L${fmt(x + r)} ${fmt(y)}L${fmt(x)} ${fmt(y + r)}L${fmt(x - r)} ${fmt(y)}Z`, attrs);

/**
 * Filigree for the top-left corner of a frame, in a 200×200 box.
 * Mirror it with CSS (scaleX(-1) / scaleY(-1)) for the other corners.
 */
export function filigreeCorner(defs, { gold = GOLD, accent = '#c45c72' } = {}) {
  const s = goldStroke(defs, 200, 200, gold, 'fil-s');
  const f = goldFill(defs, gold, 'fil-f');
  const edge = [
    path('M9 9L196 9', stroke(s, 2.6)),
    circle(198, 9, 2.8, { fill: f }),
    path('M19 19L152 19', stroke(s, 1.1)),
    circle(156, 19, 2, { fill: f }),
    // main scroll
    path(`M30 33C48 52 78 50 98 36C110 27 126 24 136 32${smoothOpen(spiral(128, 40, 11.3, 2.2, 45, 400)).replace(/^M[^C]*/, '')}`, stroke(s, 2.2)),
    // under-scroll
    path(`M52 46C58 62 76 70 90 62${smoothOpen(spiral(84, 58, 7.2, 1.5, 55, 360)).replace(/^M[^C]*/, '')}`, stroke(s, 1.4)),
    // leaves on the scroll
    g({ transform: 'translate(70 46) rotate(150)' }, goldLeaf(f, 15, 5)),
    g({ transform: 'translate(104 31) rotate(40)' }, goldLeaf(f, 13, 4.5)),
    g({ transform: 'translate(146 26) rotate(80)' }, goldLeaf(f, 11, 4)),
    circle(116, 46, 2.2, { fill: f }),
    circle(168, 19, 1.4, { fill: f }),
    circle(176, 19, 1, { fill: f }),
  ].join('');

  const centre = [
    diamond(22, 22, 13, { fill: f, stroke: gold.deep, 'stroke-width': 0.8 }),
    diamond(22, 22, 6, { fill: accent }),
    // rosette on the diagonal
    ...[0, 60, 120, 180, 240, 300].map((a) => g({ transform: `translate(44 44) rotate(${a})` }, ellipse(0, -6, 3.2, 5.6, { fill: f, stroke: gold.deep, 'stroke-width': 0.5 }))),
    circle(44, 44, 3.6, { fill: accent }),
    circle(43, 43, 1.1, { fill: '#fff', opacity: 0.7 }),
    path('M56 56L70 70', stroke(s, 1.4)),
    diamond(74, 74, 4, { fill: f }),
  ].join('');

  return g({}, [edge, g({ transform: 'matrix(0 1 1 0 0 0)' }, edge), centre]);
}

/** Horizontal divider in a 480×60 box, centred on (240, 30). */
export function divider(defs, { gold = GOLD, accent = '#c45c72' } = {}) {
  const s = goldStroke(defs, 480, 60, gold, 'div-s');
  const f = goldFill(defs, gold, 'div-f');
  const half = [
    path('M168 28.6L42 30L168 31.4Z', { fill: f }),
    circle(36, 30, 2.6, { fill: f }),
    circle(26, 30, 1.6, { fill: f }),
    path(`M224 30C212 14 190 12 180 24${smoothOpen(spiral(186, 30, 8.5, 1.8, -45, -380)).replace(/^M[^C]*/, '')}`, stroke(s, 1.8)),
    path(`M224 30C212 46 190 48 180 36${smoothOpen(spiral(186, 30, 8.5, 1.8, -135, 380)).replace(/^M[^C]*/, '')}`, stroke(s, 1.8)),
    g({ transform: 'translate(204 18) rotate(-60)' }, goldLeaf(f, 12, 4)),
    g({ transform: 'translate(204 42) rotate(-120)' }, goldLeaf(f, 12, 4)),
    circle(214, 30, 2.4, { fill: f }),
  ].join('');
  return g({}, [
    half,
    g({ transform: 'matrix(-1 0 0 1 480 0)' }, half),
    diamond(240, 30, 12, { fill: f, stroke: gold.deep, 'stroke-width': 0.8 }),
    diamond(240, 30, 5.5, { fill: accent }),
    circle(240, 14, 2, { fill: f }),
    circle(240, 46, 2, { fill: f }),
  ]);
}

/**
 * Crest / emblem in a 240×170 box: a medallion with a rose, laurel wings and a small crown.
 */
export function crest(defs, { gold = GOLD, palette = 'blush', seed = 7, medallion = '#fffaf4' } = {}) {
  const s = goldStroke(defs, 240, 170, gold, 'crest-s');
  const f = goldFill(defs, gold, 'crest-f');
  const rng = createRng(seed);
  const laurel = [];
  // left branch: from (112,150) sweeping up-left around the medallion
  const branch = [[112, 150], [80, 140], [58, 112], [54, 80], [66, 52]];
  laurel.push(path(smoothOpen(branch), stroke(s, 1.8)));
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + i * 0.13;
    const idx = Math.min(branch.length - 2, Math.floor(t * (branch.length - 1)));
    const u = t * (branch.length - 1) - idx;
    const p = [branch[idx][0] + (branch[idx + 1][0] - branch[idx][0]) * u, branch[idx][1] + (branch[idx + 1][1] - branch[idx][1]) * u];
    const dir = (Math.atan2(branch[idx + 1][0] - branch[idx][0], -(branch[idx + 1][1] - branch[idx][1])) * 180) / Math.PI;
    laurel.push(g({ transform: `translate(${pt(p)}) rotate(${fmt(dir - 55 + rng.range(-6, 6))})` }, goldLeaf(f, 17, 5.5)));
    laurel.push(g({ transform: `translate(${pt(p)}) rotate(${fmt(dir + 40 + rng.range(-6, 6))})` }, goldLeaf(f, 13, 4.5)));
  }
  const left = laurel.join('');
  const P = resolveRose(palette);
  const ring = defs.add('crest-ring', (id) => radial(id, [[0, '#ffffff'], [0.8, medallion], [1, P.light]]));
  return g({}, [
    left,
    g({ transform: 'matrix(-1 0 0 1 240 0)' }, left),
    circle(120, 92, 44, { fill: ring, stroke: s, 'stroke-width': 3 }),
    circle(120, 92, 37, { fill: 'none', stroke: s, 'stroke-width': 1 }),
    g({ transform: 'translate(120 92) scale(0.3)' }, rose(defs, { palette, seed: seed + 3 })),
    // crown
    path('M100 40L106 24L114 34L120 16L126 34L134 24L140 40Z', { fill: f, stroke: gold.deep, 'stroke-width': 0.8, 'stroke-linejoin': 'round' }),
    circle(106, 22, 2.6, { fill: f }),
    circle(120, 14, 3, { fill: P.deep }),
    circle(134, 22, 2.6, { fill: f }),
    path('M98 44L142 44', stroke(s, 2)),
    diamond(120, 146, 7, { fill: f, stroke: gold.deep, 'stroke-width': 0.6 }),
    diamond(120, 146, 3, { fill: P.deep }),
  ]);
}

/** Wax seal in a 220×220 box, centred on (110,110). Leave the middle free for a monogram. */
export function waxSeal(defs, { color = { light: '#b13a52', mid: '#8e2238', dark: '#6a1428', deep: '#4c0c1c' }, seed = 3 } = {}) {
  const rng = createRng(seed);
  const pts = [];
  const bumps = 26;
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * 360;
    const r = 92 + rng.range(-4, 4) + (rng.chance(0.15) ? rng.range(4, 9) : 0);
    pts.push(polar(r, a, 110, 110));
  }
  const body = defs.add('seal-body', (id) => radial(id, [[0, color.light], [0.55, color.mid], [0.9, color.dark], [1, color.deep]], { cx: 0.42, cy: 0.38, r: 0.68 }));
  const centre = defs.add('seal-centre', (id) => radial(id, [[0, color.mid], [1, color.dark]], { cx: 0.45, cy: 0.4, r: 0.7 }));
  const leaves = [];
  for (let i = 0; i < 24; i++) {
    const a = i * 15;
    const [x, y] = polar(76, a, 110, 110);
    leaves.push(g({ transform: `translate(${fmt(x)} ${fmt(y)}) rotate(${fmt(a + 70)})` }, goldLeaf(color.deep, 11, 3.6)));
  }
  return g({}, [
    path(smoothClosed(pts), { fill: color.deep, opacity: 0.35, transform: 'translate(3 5)' }),
    path(smoothClosed(pts), { fill: body }),
    g({ opacity: 0.55 }, leaves),
    circle(110, 110, 64, { fill: 'none', stroke: color.deep, 'stroke-width': 5, opacity: 0.7 }),
    circle(109, 109, 64, { fill: 'none', stroke: color.light, 'stroke-width': 1.4, opacity: 0.8 }),
    circle(110, 110, 58, { fill: centre }),
    ellipse(80, 72, 30, 13, { fill: '#fff', opacity: 0.16, transform: 'rotate(-35 80 72)' }),
  ]);
}

/** Compass rose in a 200×200 box. */
export function compassRose(defs, { gold = GOLD, accent = '#c45c72', accentDark = '#8e2c45' } = {}) {
  const s = goldStroke(defs, 200, 200, gold, 'comp-s');
  const cx = 100;
  const cy = 100;
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = i * 5;
    const long = i % 2 === 0;
    ticks.push(`M${pt(polar(80, a, cx, cy))}L${pt(polar(long ? 74 : 77, a, cx, cy))}`);
  }
  const point = (a, len, w, light, dark) =>
    [
      path(`M${pt(polar(len, a, cx, cy))}L${pt(polar(w, a - 90, cx, cy))}L${cx} ${cy}Z`, { fill: light }),
      path(`M${pt(polar(len, a, cx, cy))}L${pt(polar(w, a + 90, cx, cy))}L${cx} ${cy}Z`, { fill: dark }),
    ].join('');
  const body = g({ transform: 'translate(100 112) scale(0.86) translate(-100 -100)' }, [
    circle(cx, cy, 88, stroke(s, 1.6)),
    circle(cx, cy, 80, stroke(s, 0.8)),
    path(ticks.join(''), stroke(s, 0.8)),
    circle(cx, cy, 46, stroke(s, 0.8, { 'stroke-dasharray': '2 4' })),
    ...[45, 135, 225, 315].map((a) => point(a, 54, 9, accent, accentDark)),
    ...[0, 90, 180, 270].map((a) => point(a, 84, 12, gold.light, gold.dark)),
    circle(cx, cy, 7, { fill: gold.mid, stroke: gold.deep, 'stroke-width': 0.8 }),
    circle(cx, cy, 2.6, { fill: accentDark }),
  ]);
  // a small "N" above the ring
  return g({}, [body, path('M94 26V10L106 26V10', stroke(gold.deep, 2.2))]);
}

/** Seamless damask tile, 160×160, single colour line work. */
export function damaskTile({ color = '#c9a35f', width = 1.2 } = {}) {
  const motif = (x, y) =>
    g({ transform: `translate(${x} ${y})` }, [
      circle(0, 0, 5, stroke(color, width)),
      circle(0, 0, 11, stroke(color, width * 0.8, { 'stroke-dasharray': '1.5 3' })),
      ...[0, 90, 180, 270].map((a) =>
        g({ transform: `rotate(${a})` }, [
          path('M0 -12C-8 -18 -8 -28 0 -34C8 -28 8 -18 0 -12Z', stroke(color, width)),
          path('M0 -34L0 -40', stroke(color, width)),
          circle(0, -43, 1.8, { fill: color }),
        ]),
      ),
      ...[45, 135, 225, 315].map((a) =>
        g({ transform: `rotate(${a})` }, [
          path('M0 -14C-5 -18 -12 -18 -14 -24', stroke(color, width * 0.9)),
          path('M0 -14C5 -18 12 -18 14 -24', stroke(color, width * 0.9)),
          circle(0, -20, 1.4, { fill: color }),
        ]),
      ),
    ]);
  const ogee = path('M80 0C80 26 120 28 120 54C120 70 100 74 80 80C60 74 40 70 40 54C40 28 80 26 80 0ZM80 160C80 134 120 132 120 106C120 90 100 86 80 80C60 86 40 90 40 106C40 132 80 134 80 160Z', stroke(color, width * 0.7, { opacity: 0.8 }));
  return g({}, [ogee, motif(80, 80), motif(0, 0), motif(160, 0), motif(0, 160), motif(160, 160)]);
}
