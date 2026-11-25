/*
 * Rose Garden compositions. Each export returns { width, height, viewBox?, defs, body }.
 * Built from @wedding/art primitives, so a new client can re-colour or re-arrange them.
 */
import {
  Defs,
  GOLD,
  arrange,
  circle,
  compassRose,
  createRng,
  crest,
  damaskTile,
  divider,
  ellipse,
  filigreeCorner,
  fmt,
  g,
  leavesAround,
  linear,
  path,
  polar,
  radial,
  rose,
  smoothClosed,
  smoothOpen,
  waxSeal,
  withPrecision,
} from '@wedding/art';

const withPrecision0 = (fn) => withPrecision(0, fn);
import { bride, couple, groom } from './people.mjs';

const ACCENT = '#c45c72';
const toRoses = (list) => list.map(([x, y, size, palette, tilt = 0, seed]) => ({ kind: 'rose', x, y, size, palette, tilt, seed, layer: size / 1000 }));

/* ------------------------------------------------------------------ */
/* Garlands & bouquets                                                 */
/* ------------------------------------------------------------------ */

export function garlandTop() {
  const defs = new Defs();
  const roses = toRoses([
    [70, 40, 130, 'blush', 0, 101],
    [255, 30, 92, 'red', 0.3, 102],
    [380, 98, 64, 'blush', 0.5, 103],
    [495, 24, 72, 'ivory', 0, 104],
    [625, 72, 100, 'blush', 0.2, 105],
    [770, 22, 74, 'red', 0.2, 106],
    [882, 96, 70, 'ivory', 0.35, 107],
    [1010, 36, 98, 'blush', 0, 108],
    [1150, 78, 120, 'red', 0.15, 109],
  ]);
  const items = [
    ...roses,
    ...leavesAround(roses, { origin: [600, -420], seed: 3, perRose: [3, 4], spread: 62 }),
    { kind: 'sprig', x: 170, y: 120, size: 190, rotate: 192, palette: 'sage', layer: -8 },
    { kind: 'sprig', x: 560, y: 120, size: 150, rotate: 168, palette: 'olive', layer: -8 },
    { kind: 'sprig', x: 960, y: 130, size: 170, rotate: 200, palette: 'sage', layer: -8 },
    { kind: 'eucalyptus', x: 330, y: 100, size: 180, rotate: 166, layer: -7 },
    { kind: 'eucalyptus', x: 820, y: 110, size: 160, rotate: 194, layer: -7 },
    { kind: 'berries', x: 300, y: 120, size: 95, rotate: 176, layer: -6 },
    { kind: 'berries', x: 700, y: 110, size: 85, rotate: 190, layer: -6 },
    { kind: 'berries', x: 1085, y: 140, size: 95, rotate: 160, layer: -6 },
    { kind: 'bud', x: 440, y: 160, size: 70, rotate: 192, palette: 'red', layer: -4 },
    { kind: 'bud', x: 930, y: 168, size: 62, rotate: 172, palette: 'blush', layer: -4 },
    { kind: 'blossom', x: 175, y: 70, size: 12, palette: 'ivory', layer: 5 },
    { kind: 'blossom', x: 560, y: 40, size: 11, palette: 'blush', layer: 5 },
    { kind: 'blossom', x: 950, y: 90, size: 12, palette: 'ivory', layer: 5 },
  ];
  return { width: 1200, height: 420, defs, body: arrange(defs, items, { seed: 11 }) };
}

export function garlandBottom() {
  const defs = new Defs();
  const roses = toRoses([
    [60, 470, 150, 'blush', 0.2, 201],
    [232, 500, 110, 'ivory', 0.3, 202],
    [330, 402, 80, 'red', 0.35, 203],
    [462, 490, 122, 'blush', 0.25, 204],
    [600, 420, 86, 'ivory', 0.3, 205],
    [732, 500, 126, 'red', 0.2, 206],
    [872, 430, 80, 'blush', 0.4, 207],
    [992, 500, 116, 'ivory', 0.2, 208],
    [1142, 452, 146, 'blush', 0.15, 209],
  ]);
  const items = [
    ...roses,
    ...leavesAround(roses, { origin: [600, 1000], seed: 4, perRose: [3, 4], spread: 62 }),
    { kind: 'sprig', x: 150, y: 380, size: 200, rotate: -14, palette: 'sage', layer: -8 },
    { kind: 'sprig', x: 525, y: 385, size: 170, rotate: 12, palette: 'olive', layer: -8 },
    { kind: 'sprig', x: 805, y: 385, size: 180, rotate: -8, palette: 'sage', layer: -8 },
    { kind: 'sprig', x: 1062, y: 360, size: 190, rotate: 22, palette: 'olive', layer: -8 },
    { kind: 'eucalyptus', x: 380, y: 330, size: 190, rotate: -20, layer: -7 },
    { kind: 'eucalyptus', x: 952, y: 350, size: 180, rotate: 16, layer: -7 },
    { kind: 'berries', x: 268, y: 362, size: 100, rotate: -10, layer: -6 },
    { kind: 'berries', x: 662, y: 342, size: 96, rotate: 6, layer: -6 },
    { kind: 'berries', x: 1052, y: 342, size: 100, rotate: 24, layer: -6 },
    { kind: 'bud', x: 420, y: 336, size: 72, rotate: -12, palette: 'red', layer: -4 },
    { kind: 'bud', x: 902, y: 336, size: 66, rotate: 14, palette: 'blush', layer: -4 },
    { kind: 'blossom', x: 300, y: 470, size: 12, palette: 'ivory', layer: 5 },
    { kind: 'blossom', x: 815, y: 470, size: 12, palette: 'ivory', layer: 5 },
  ];
  return { width: 1200, height: 520, defs, body: arrange(defs, items, { seed: 12 }) };
}

export function cornerBouquet() {
  const defs = new Defs();
  const roses = toRoses([
    [92, 86, 122, 'blush', 0, 301],
    [258, 56, 80, 'red', 0.2, 302],
    [70, 268, 82, 'ivory', 0.2, 303],
    [220, 202, 64, 'blush', 0.4, 304],
    [366, 98, 50, 'ivory', 0.3, 305],
    [104, 404, 52, 'red', 0.3, 306],
  ]);
  const items = [
    ...roses,
    ...leavesAround(roses, { origin: [-60, -60], seed: 5, perRose: [2, 4], spread: 70 }),
    { kind: 'sprig', x: 400, y: 60, size: 190, rotate: 78, palette: 'sage', layer: -8 },
    { kind: 'sprig', x: 52, y: 430, size: 190, rotate: 168, palette: 'olive', layer: -8 },
    { kind: 'eucalyptus', x: 290, y: 236, size: 170, rotate: 134, layer: -7 },
    { kind: 'berries', x: 384, y: 172, size: 86, rotate: 112, layer: -6 },
    { kind: 'berries', x: 168, y: 336, size: 86, rotate: 150, layer: -6 },
    { kind: 'bud', x: 470, y: 122, size: 64, rotate: 80, palette: 'red', layer: -4 },
    { kind: 'bud', x: 112, y: 506, size: 60, rotate: 172, palette: 'blush', layer: -4 },
    { kind: 'blossom', x: 300, y: 140, size: 11, palette: 'ivory', layer: 5 },
    { kind: 'blossom', x: 150, y: 300, size: 10, palette: 'blush', layer: 5 },
  ];
  // The viewBox includes a margin so no rose is clipped when the bouquet pops out of a frame.
  return { width: 720, height: 720, viewBox: '-120 -120 720 720', defs, body: arrange(defs, items, { seed: 13 }) };
}

/** Single rose with two leaves, for floating decorations. */
export function singleRose(palette, seed) {
  const defs = new Defs();
  const items = [
    { kind: 'leaf', x: 130, y: 136, size: 120, rotate: 120, palette: 'sage' },
    { kind: 'leaf', x: 126, y: 132, size: 104, rotate: -150, palette: 'olive' },
    { kind: 'rose', x: 130, y: 130, size: 96, palette, seed },
  ];
  return { width: 260, height: 260, defs, body: arrange(defs, items, { seed }) };
}

export function favicon() {
  const defs = new Defs();
  return { width: 64, height: 64, viewBox: '-104 -104 208 208', defs, body: withPrecision0(() => rose(defs, { palette: 'red', seed: 702 })) };
}

export function petal(palette, seed) {
  const defs = new Defs();
  return { width: 80, height: 80, defs, body: arrange(defs, [{ kind: 'petal', x: 40, y: 70, size: 62, palette, seed, rotate: 8 }]) };
}

/* ------------------------------------------------------------------ */
/* Diorama pieces                                                      */
/* ------------------------------------------------------------------ */

export function bush(side = 'left') {
  const defs = new Defs();
  const rng = createRng(side === 'left' ? 401 : 402);
  const W = 800;
  const H = 760;
  const cx = 400;
  const items = [];
  for (let i = 0; i < 78; i++) {
    const th = rng.range(-84, 84);
    const f = Math.sqrt(rng.range(0.08, 1));
    const [x, y] = [cx + Math.sin((th * Math.PI) / 180) * 360 * f, H - Math.cos((th * Math.PI) / 180) * 560 * f];
    items.push({
      kind: 'leaf',
      x,
      y,
      size: rng.range(70, 125),
      rotate: th + rng.range(-28, 28),
      palette: rng.pick(['sage', 'olive', 'sage', 'mint']),
      bend: rng.range(-0.2, 0.2),
      layer: -20 + f * 10,
    });
  }
  const palettes = ['blush', 'red', 'ivory', 'blush', 'red', 'ivory', 'blush', 'pink', 'ivory'];
  const spots = [
    [-50, 0.55], [-30, 0.8], [-8, 0.62], [12, 0.86], [30, 0.6], [50, 0.78], [66, 0.5], [-66, 0.66], [0, 0.38],
  ];
  spots.forEach(([th, f], i) => {
    const x = cx + Math.sin((th * Math.PI) / 180) * 360 * f;
    const y = H - Math.cos((th * Math.PI) / 180) * 540 * f;
    items.push({ kind: 'rose', x, y, size: rng.range(48, 78), palette: palettes[i], tilt: rng.range(0, 0.5), layer: 1 + i * 0.01 });
  });
  for (const th of [-70, -38, 24, 58]) {
    const [x, y] = [cx + Math.sin((th * Math.PI) / 180) * 380, H - Math.cos((th * Math.PI) / 180) * 590];
    items.push({ kind: 'bud', x, y, size: rng.range(50, 64), rotate: th, palette: rng.pick(['red', 'blush']), layer: -1 });
  }
  for (const th of [-56, 40]) {
    const [x, y] = [cx + Math.sin((th * Math.PI) / 180) * 300, H - Math.cos((th * Math.PI) / 180) * 470];
    items.push({ kind: 'eucalyptus', x, y, size: 170, rotate: th, layer: -2 });
  }
  for (let i = 0; i < 8; i++) {
    const th = rng.range(-70, 70);
    items.push({ kind: 'leaf', x: cx + Math.sin((th * Math.PI) / 180) * 200, y: H - rng.range(10, 120), size: rng.range(90, 130), rotate: th * 1.2, palette: 'olive', layer: 3 });
  }
  const body = arrange(defs, items, { seed: side === 'left' ? 21 : 22 });
  return { width: W, height: H, defs, body: side === 'right' ? g({ transform: `matrix(-1 0 0 1 ${W} 0)` }, body) : body };
}

export function foreground(side = 'left') {
  const defs = new Defs();
  const roses = toRoses(
    side === 'left'
      ? [
          [150, 610, 200, 'blush', 0.3, 501],
          [432, 684, 166, 'red', 0.35, 502],
          [330, 432, 126, 'ivory', 0.25, 503],
          [40, 362, 136, 'red', 0.15, 504],
          [622, 642, 116, 'blush', 0.4, 505],
          [212, 244, 82, 'blush', 0.3, 506],
        ]
      : [
          [150, 620, 196, 'red', 0.3, 511],
          [430, 676, 170, 'blush', 0.3, 512],
          [320, 440, 120, 'blush', 0.35, 513],
          [44, 370, 140, 'ivory', 0.2, 514],
          [620, 650, 112, 'ivory', 0.4, 515],
          [214, 250, 80, 'red', 0.3, 516],
        ],
  );
  const items = [
    ...roses,
    ...leavesAround(roses, { origin: [0, 980], seed: side === 'left' ? 6 : 7, perRose: [3, 4], spread: 75, length: [1, 1.5] }),
    { kind: 'sprig', x: 520, y: 430, size: 330, rotate: 32, palette: 'sage', layer: -8 },
    { kind: 'sprig', x: 118, y: 210, size: 260, rotate: 8, palette: 'olive', layer: -8 },
    { kind: 'eucalyptus', x: 700, y: 530, size: 290, rotate: 52, layer: -7 },
    { kind: 'berries', x: 560, y: 470, size: 140, rotate: 40, layer: -6 },
    { kind: 'berries', x: 262, y: 320, size: 128, rotate: 15, layer: -6 },
    { kind: 'bud', x: 760, y: 470, size: 110, rotate: 58, palette: side === 'left' ? 'red' : 'blush', layer: -4 },
  ];
  const body = arrange(defs, items, { seed: side === 'left' ? 31 : 32 });
  return { width: 1000, height: 720, defs, body: side === 'right' ? g({ transform: 'matrix(-1 0 0 1 1000 0)' }, body) : body };
}

/** Ornate garden arch with climbing roses. */
export function arch() {
  const defs = new Defs();
  const W = 900;
  const H = 1300;
  const cx = 450;
  const cy = 545;
  const stone = defs.add('stone', (id) => linear(id, [[0, '#ecdfd2'], [0.28, '#fffcf8'], [0.7, '#f7efe6'], [1, '#e0d0c1']], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  const band = defs.add('band', (id) => linear(id, [[0, '#fffdf9'], [1, '#f1e6db']]));
  const gold = defs.add('gold', (id) => linear(id, [[0, GOLD.light], [0.5, GOLD.mid], [1, GOLD.dark]], { units: 'userSpaceOnUse', x1: 0, y1: 0, x2: W, y2: H }));
  const column = (x) =>
    g({}, [
      path(`M${x - 38} 566L${x + 38} 566L${x + 38} 1200L${x - 38} 1200Z`, { fill: stone }),
      path(`M${x - 22} 580L${x - 22} 1188M${x - 7} 580L${x - 7} 1188M${x + 7} 580L${x + 7} 1188M${x + 22} 580L${x + 22} 1188`, { stroke: '#dccbbb', 'stroke-width': 2, opacity: 0.7 }),
      path(`M${x - 38} 600L${x + 38} 600M${x - 38} 1170L${x + 38} 1170`, { stroke: gold, 'stroke-width': 2 }),
      // capital
      path(`M${x - 58} 520L${x + 58} 520L${x + 46} 566L${x - 46} 566Z`, { fill: band, stroke: gold, 'stroke-width': 2.2 }),
      path(`M${x - 62} 512L${x + 62} 512L${x + 62} 522L${x - 62} 522Z`, { fill: gold }),
      path(`M${x - 52} 540L${x + 52} 540`, { stroke: gold, 'stroke-width': 1.6 }),
      path(smoothOpen([[x - 48, 524], [x - 64, 536], [x - 56, 552], [x - 44, 546], [x - 48, 538]]), { fill: 'none', stroke: gold, 'stroke-width': 2.6 }),
      path(smoothOpen([[x + 48, 524], [x + 64, 536], [x + 56, 552], [x + 44, 546], [x + 48, 538]]), { fill: 'none', stroke: gold, 'stroke-width': 2.6 }),
      `<path d="M${x} 528l8 10-8 10-8-10z" fill="${ACCENT}" stroke="${GOLD.dark}"/>`,
      // base
      path(`M${x - 46} 1200L${x + 46} 1200L${x + 54} 1228L${x - 54} 1228Z`, { fill: band, stroke: gold, 'stroke-width': 1.8 }),
      path(`M${x - 64} 1228L${x + 64} 1228L${x + 64} 1264L${x - 64} 1264Z`, { fill: stone, stroke: gold, 'stroke-width': 1.4 }),
    ]);
  const ro = 338;
  const ri = 262;
  const arc = (r) => `M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const voussoirs = [];
  for (let a = -80; a <= 80; a += 10) voussoirs.push(`M${polar(ri + 14, a, cx, cy).map(fmt).join(' ')}L${polar(ro - 4, a, cx, cy).map(fmt).join(' ')}`);
  const gems = [];
  for (let a = -85; a <= 85; a += 10) {
    const [x, y] = polar(300, a, cx, cy);
    gems.push(`<path d="M${fmt(x)} ${fmt(y - 6)}l6 6-6 6-6-6z" fill="${a % 20 === 5 || a % 20 === -15 ? ACCENT : GOLD.mid}" stroke="${GOLD.dark}" stroke-width="0.8" transform="rotate(${fmt(a)} ${fmt(x)} ${fmt(y)})"/>`);
  }
  // scalloped "rose window" lace along the inner edge
  let lace = '';
  for (let a = -90; a < 90; a += 9) {
    const p0 = polar(ri, a, cx, cy);
    const p1 = polar(ri, a + 9, cx, cy);
    const mid = polar(ri - 22, a + 4.5, cx, cy);
    lace += `M${fmt(p0[0])} ${fmt(p0[1])}Q${fmt(mid[0])} ${fmt(mid[1])} ${fmt(p1[0])} ${fmt(p1[1])}`;
  }
  const pendants = [];
  for (let a = -72; a <= 72; a += 18) {
    const [x, y] = polar(ri - 18, a, cx, cy);
    pendants.push(path(`M${fmt(x)} ${fmt(y)}L${fmt(x)} ${fmt(y + 26)}`, { stroke: gold, 'stroke-width': 1.2 }), `<path d="M${fmt(x)} ${fmt(y + 26)}l4 7-4 7-4-7z" fill="${GOLD.mid}"/>`, circle(x, y + 44, 2.2, { fill: '#fff7f2', stroke: GOLD.mid, 'stroke-width': 0.8 }));
  }
  const structure = g({}, [
    column(150),
    column(750),
    path(`${arc(ro)}L${cx + ri} ${cy}A${ri} ${ri} 0 0 0 ${cx - ri} ${cy}Z`, { fill: band }),
    path(voussoirs.join(''), { stroke: '#e6d8ca', 'stroke-width': 2 }),
    path(arc(ro), { fill: 'none', stroke: gold, 'stroke-width': 5 }),
    path(arc(ro - 10), { fill: 'none', stroke: gold, 'stroke-width': 1.4 }),
    path(arc(ri + 10), { fill: 'none', stroke: gold, 'stroke-width': 1.4 }),
    path(arc(ri), { fill: 'none', stroke: gold, 'stroke-width': 3.6 }),
    ...gems,
    path(lace, { fill: 'none', stroke: gold, 'stroke-width': 1.6 }),
    path(arc(ri - 24), { fill: 'none', stroke: gold, 'stroke-width': 0.8, opacity: 0.6, 'stroke-dasharray': '2 6' }),
    ...pendants,
    // keystone crest
    path(`M${cx - 42} ${cy - ro - 22}L${cx + 42} ${cy - ro - 22}L${cx + 28} ${cy - ri + 14}L${cx - 28} ${cy - ri + 14}Z`, { fill: band, stroke: gold, 'stroke-width': 3 }),
    circle(cx, cy - 300, 30, { fill: '#fffaf4', stroke: gold, 'stroke-width': 3 }),
    circle(cx, cy - 300, 24, { fill: 'none', stroke: gold, 'stroke-width': 1 }),
    g({ transform: `translate(${cx} ${cy - 300}) scale(0.21)` }, withPrecision0(() => rose(defs, { palette: 'red', seed: 61 }))),
    path(`M${cx - 30} ${cy - ro - 30}L${cx - 18} ${cy - ro - 56}L${cx - 6} ${cy - ro - 40}L${cx} ${cy - ro - 64}L${cx + 6} ${cy - ro - 40}L${cx + 18} ${cy - ro - 56}L${cx + 30} ${cy - ro - 30}Z`, {
      fill: gold,
      stroke: GOLD.deep,
      'stroke-width': 1,
    }),
    circle(cx, cy - ro - 68, 4, { fill: ACCENT }),
  ]);

  const along = (a, r = 300) => polar(r, a, cx, cy);
  const topRoses = [
    [-92, 78, 'blush'], [-79, 90, 'red'], [-64, 70, 'ivory'], [-50, 62, 'blush'], [-38, 50, 'red'], [-27, 40, 'ivory'],
    [44, 46, 'ivory'], [58, 62, 'blush'], [72, 54, 'red'],
  ].map(([a, size, palette], i) => {
    const [x, y] = along(a, 300 + (i % 2 ? 14 : -10));
    return { kind: 'rose', x, y, size, palette, tilt: (i % 3) * 0.2, seed: 600 + i, layer: size / 1000 };
  });
  const baseRoses = toRoses([
    [112, 1196, 72, 'red', 0.3, 621],
    [192, 1226, 88, 'blush', 0.3, 622],
    [58, 1244, 62, 'ivory', 0.3, 623],
    [258, 1252, 56, 'ivory', 0.4, 624],
    [760, 1230, 68, 'blush', 0.3, 625],
    [832, 1244, 56, 'red', 0.3, 626],
  ]);
  const vine = [];
  const vrng = createRng(71);
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const x = 782 + Math.sin(t * 7) * 18;
    const y = 590 + t * 520;
    vine.push({ kind: 'leaf', x, y, size: vrng.range(36, 54), rotate: (i % 2 ? 70 : -110) + vrng.range(-20, 20), palette: vrng.pick(['sage', 'olive']), layer: -1 });
    if (i % 5 === 2) vine.push({ kind: 'rose', x: x + 4, y, size: 26, palette: i % 2 ? 'blush' : 'red', layer: 0.02 });
    if (i % 5 === 4) vine.push({ kind: 'blossom', x: x - 8, y: y + 10, size: 8, palette: 'ivory', layer: 0.03 });
  }
  const trails = [];
  for (let i = 0; i < 6; i++) {
    const [x, y] = along(-70 + i * 9, 280);
    trails.push({ kind: 'sprig', x, y, size: 80 + i * 6, rotate: 180 + (i % 2 ? 12 : -12), palette: 'sage', layer: -2, leaves: 5 });
  }
  const flowers = arrange(
    defs,
    [
      ...topRoses,
      ...leavesAround(topRoses, { origin: [cx, cy], seed: 8, perRose: [2, 4], spread: 80 }),
      ...trails,
      { kind: 'berries', ...pos(along(-86, 350)), size: 80, rotate: -80, layer: -3 },
      { kind: 'berries', ...pos(along(-46, 352)), size: 70, rotate: -40, layer: -3 },
      { kind: 'eucalyptus', ...pos(along(-70, 340)), size: 150, rotate: -60, layer: -4 },
      { kind: 'bud', ...pos(along(-18, 318)), size: 50, rotate: 20, palette: 'red', layer: -2 },
      { kind: 'bud', ...pos(along(84, 330)), size: 48, rotate: 120, palette: 'blush', layer: -2 },
      ...baseRoses,
      ...leavesAround(baseRoses, { origin: [450, 1500], seed: 9, perRose: [3, 4], spread: 70 }),
      { kind: 'sprig', x: 150, y: 1180, size: 200, rotate: -8, palette: 'olive', layer: -6 },
      { kind: 'sprig', x: 760, y: 1190, size: 170, rotate: 12, palette: 'sage', layer: -6 },
      ...vine,
    ],
    { seed: 41 },
  );
  return { width: W + 120, height: H, viewBox: `-60 0 ${W + 120} ${H}`, defs, body: structure + flowers };
}

const pos = ([x, y]) => ({ x, y });

function castle(x, y) {
  const tower = (tx, w, h, roof) =>
    `M${tx - w / 2} ${y}L${tx - w / 2} ${y - h}L${tx + w / 2} ${y - h}L${tx + w / 2} ${y}Z` +
    `M${tx - w / 2 - 6} ${y - h}L${tx} ${y - h - roof}L${tx + w / 2 + 6} ${y - h}Z`;
  return [
    path(`M${x - 70} ${y}L${x - 70} ${y - 64}L${x + 70} ${y - 64}L${x + 70} ${y}Z`),
    path(tower(x, 34, 130, 70)),
    path(tower(x - 86, 26, 104, 52)),
    path(tower(x + 86, 26, 104, 52)),
    path(tower(x - 44, 20, 86, 40)),
    path(tower(x + 44, 20, 86, 40)),
    path(`M${x} ${y - 200}L${x} ${y - 222}L${x + 14} ${y - 216}L${x} ${y - 212}`),
  ].join('');
}

export function gardenBackdrop() {
  const defs = new Defs();
  const W = 1600;
  const H = 820;
  const rng = createRng(91);
  const far = defs.add('far', (id) => linear(id, [[0, '#e7eee1'], [1, '#d6e1cc']]));
  const mid = defs.add('mid', (id) => linear(id, [[0, '#d3dfc7'], [1, '#c1d2b1']]));
  const hedge = defs.add('hedge', (id) => linear(id, [[0, '#b2c79f'], [1, '#93ac80']]));
  const lawn = defs.add('lawn', (id) => linear(id, [[0, '#d5e1c5'], [1, '#c0d2ac']]));
  const walk = defs.add('walk', (id) => linear(id, [[0, '#f3ebe2'], [1, '#fbf6f0']]));
  const trees = [];
  for (let x = -20; x < W + 40; x += rng.range(46, 70)) {
    const y = 585 + Math.sin(x / 140) * 10;
    const pink = rng.chance(0.18);
    const col = pink ? rng.pick(['#f1d4d8', '#ecc5cc']) : rng.pick(['#c6d6b7', '#bccfac', '#b3c8a3']);
    trees.push(circle(x, y - rng.range(0, 24), rng.range(26, 44), { fill: col }), circle(x + rng.range(-20, 20), y + 8, rng.range(22, 34), { fill: col }));
  }
  const hedges = [];
  const hedgeShape = (x0, x1, y) => {
    const pts = [];
    for (let x = x0; x <= x1; x += 40) pts.push([x, y - rng.range(18, 34)]);
    return `M${x0} ${y + 30}` + smoothOpen([[x0, y], ...pts, [x1, y]]).replace(/^M[^C]*/, `L${x0} ${y}`) + `L${x1} ${y + 30}Z`;
  };
  hedges.push(path(hedgeShape(-20, 560, 660), { fill: hedge }), path(hedgeShape(1040, 1620, 660), { fill: hedge }));
  const dots = [];
  for (let i = 0; i < 90; i++) {
    const left = rng.chance(0.5);
    const x = left ? rng.range(0, 540) : rng.range(1060, 1600);
    const y = rng.range(632, 676);
    dots.push(circle(x, y, rng.range(3, 6), { fill: rng.pick(['#f6c9cf', '#e9a1ad', '#b54a5e', '#fff5f2', '#f6c9cf']) }));
  }
  const lawnFlowers = [];
  for (let i = 0; i < 60; i++) {
    lawnFlowers.push(circle(rng.range(0, W), rng.range(720, 815), rng.range(1.5, 3), { fill: rng.pick(['#fff8f5', '#f5c8cf', '#f9e3e6']), opacity: 0.9 }));
  }
  const body = [
    g({ fill: '#ece4e6', opacity: 0.95 }, castle(1180, 520)),
    g({ fill: '#efe6e8', opacity: 0.8 }, castle(330, 535).replace(/(\d+)/g, (m) => m)),
    path('M0 520C180 470 360 488 540 505C720 450 920 455 1100 490C1280 460 1460 470 1600 500L1600 820L0 820Z', { fill: far }),
    ...trees,
    path('M0 604C220 566 420 578 640 598C860 570 1060 560 1280 594C1420 580 1520 584 1600 596L1600 820L0 820Z', { fill: mid }),
    ...hedges,
    ...dots,
    path('M0 680C400 660 1200 660 1600 680L1600 820L0 820Z', { fill: lawn }),
    path('M700 820L776 676L824 676L900 820Z', { fill: walk }),
    path('M776 676L700 820M824 676L900 820', { stroke: '#e5d6c7', 'stroke-width': 2 }),
    ...lawnFlowers,
  ].join('');
  return { width: W, height: H, defs, body };
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export function coupleArt() {
  const defs = new Defs();
  return { width: 500, height: 883, viewBox: '150 92 500 883', defs, body: couple(defs) };
}
export function groomArt() {
  const defs = new Defs();
  return { width: 230, height: 876, viewBox: '148 94 230 876', defs, body: groom(defs) };
}
export function brideArt() {
  const defs = new Defs();
  return { width: 410, height: 860, viewBox: '278 116 410 860', defs, body: bride(defs) };
}

/* ------------------------------------------------------------------ */
/* Ornaments & UI art                                                  */
/* ------------------------------------------------------------------ */

export function ornament(name) {
  const defs = new Defs();
  switch (name) {
    case 'filigree':
      return { width: 200, height: 200, defs, body: filigreeCorner(defs, { accent: ACCENT }) };
    case 'divider':
      return { width: 480, height: 60, defs, body: divider(defs, { accent: ACCENT }) };
    case 'crest':
      return { width: 240, height: 170, defs, body: crest(defs, { palette: 'blush' }) };
    case 'seal':
      return { width: 220, height: 220, defs, body: waxSeal(defs) };
    case 'compass':
      return { width: 200, height: 200, defs, body: compassRose(defs, { accent: ACCENT }) };
    case 'damask':
      return { width: 160, height: 160, defs, body: damaskTile({ color: '#c9a35f' }) };
    default:
      throw new Error(name);
  }
}

/** Large faint "rose window" sigil that turns slowly behind the arch. */
export function sigil() {
  const defs = new Defs();
  const S = 600;
  const c = 300;
  const gold = defs.add('sg', (id) => linear(id, [[0, GOLD.light], [0.5, GOLD.mid], [1, GOLD.dark]], { units: 'userSpaceOnUse', x1: 0, y1: 0, x2: S, y2: S }));
  const st = (w, extra = {}) => ({ fill: 'none', stroke: gold, 'stroke-width': w, ...extra });
  const P = (r, a) => polar(r, a, c, c).map(fmt).join(' ');
  let ticks = '';
  for (let i = 0; i < 120; i++) ticks += `M${P(286, i * 3)}L${P(i % 5 === 0 ? 268 : 278, i * 3)}`;
  let star = '';
  for (let i = 0; i < 8; i++) star += `M${P(76, i * 45)}L${P(168, i * 45 + 22.5)}L${P(76, i * 45 + 45)}`;
  let petals = '';
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5;
    petals += `M${P(168, a)}Q${P(226, a + 11.25)} ${P(168, a + 22.5)}`;
  }
  const parts = [
    circle(c, c, 294, st(2.2)),
    circle(c, c, 286, st(0.8)),
    path(ticks, st(1)),
    circle(c, c, 244, st(1.2, { 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' })),
    path(petals, st(1.3)),
    circle(c, c, 168, st(1)),
    path(star, st(1.1)),
    circle(c, c, 76, st(1.4)),
    circle(c, c, 64, st(0.7)),
  ];
  for (let i = 0; i < 12; i++) {
    const [x, y] = polar(206, i * 30, c, c);
    parts.push(circle(x, y, 22, st(0.9)));
  }
  for (let i = 0; i < 8; i++) {
    const [x, y] = polar(244, i * 45 + 22.5, c, c);
    parts.push(`<path d="M${fmt(x)} ${fmt(y - 8)}l8 8-8 8-8-8z" fill="${GOLD.mid}"/>`);
  }
  return { width: S, height: S, defs, body: parts.join('') };
}

/** Thin gold arch used inside portrait cards. */
export function cardArch() {
  const defs = new Defs();
  const s = defs.add('ca', (id) => linear(id, [[0, GOLD.light], [0.5, GOLD.mid], [1, GOLD.dark]], { units: 'userSpaceOnUse', x1: 0, y1: 0, x2: 300, y2: 460 }));
  const sparkle = (x, y, r) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${GOLD.mid}"/>`;
  const body = [
    path('M18 460L18 150A132 132 0 0 1 282 150L282 460', { fill: 'none', stroke: s, 'stroke-width': 2.4 }),
    path('M28 460L28 152A122 122 0 0 1 272 152L272 460', { fill: 'none', stroke: s, 'stroke-width': 1 }),
    path('M150 18l7 10-7 10-7-10z', { fill: GOLD.mid }),
    circle(150, 48, 3, { fill: ACCENT }),
    sparkle(70, 80, 6),
    sparkle(236, 96, 5),
    sparkle(110, 46, 3.5),
    sparkle(200, 52, 4),
    circle(52, 130, 2, { fill: GOLD.mid }),
    circle(250, 140, 2, { fill: GOLD.mid }),
  ].join('');
  return { width: 300, height: 460, defs, body };
}

/** Illustrated "fantasy map" of the venue grounds. */
export function venueMap() {
  const defs = new Defs();
  const W = 640;
  const H = 440;
  const rng = createRng(77);
  const parchment = defs.add('parch', (id) => radial(id, [[0, '#fffaf4'], [0.75, '#fbf2e8'], [1, '#f1e2d2']]));
  const blob = (x, y, r, n = 9) => {
    const pts = [];
    for (let i = 0; i < n; i++) pts.push(polar(r * rng.range(0.75, 1.15), (i / n) * 360, x, y));
    return smoothClosed(pts);
  };
  const tree = (x, y, s = 1) =>
    g({ transform: `translate(${fmt(x)} ${fmt(y)}) scale(${s})` }, [
      ellipse(0, 10, 9, 3, { fill: '#8aa07a', opacity: 0.3 }),
      circle(-5, 0, 8, { fill: '#a9bf98' }),
      circle(5, -2, 9, { fill: '#b9cca8' }),
      circle(0, -8, 8, { fill: '#c6d6b6' }),
    ]);
  const trees = [];
  for (let i = 0; i < 26; i++) {
    const x = rng.range(30, 610);
    const y = rng.range(40, 410);
    if (Math.hypot(x - 430, y - 160) < 70 || Math.abs(y - (300 + Math.sin(x / 90) * 30)) < 30) continue;
    trees.push(tree(x, y, rng.range(0.8, 1.2)));
  }
  const route = 'M44 410C110 380 160 360 196 318C232 276 250 246 300 232C356 216 382 196 418 176';
  const body = [
    path('M14 14H626V426H14Z', { fill: parchment }),
    path(blob(150, 120, 100), { fill: '#e4ecd9' }),
    path(blob(500, 320, 120), { fill: '#e4ecd9' }),
    path(blob(520, 90, 70), { fill: '#eaf0e0' }),
    path(blob(430, 160, 62), { fill: '#f5e4e2' }),
    path('M-10 300C120 262 210 340 330 300C450 262 520 352 650 326', { fill: 'none', stroke: '#cfe0e3', 'stroke-width': 26, 'stroke-linecap': 'round' }),
    path('M-10 300C120 262 210 340 330 300C450 262 520 352 650 326', { fill: 'none', stroke: '#e6f0f1', 'stroke-width': 9, 'stroke-linecap': 'round' }),
    path('M276 286L286 316M296 280L306 310', { stroke: '#c9a35f', 'stroke-width': 3, 'stroke-linecap': 'round' }),
    path(route, { fill: 'none', stroke: '#efe1d3', 'stroke-width': 14, 'stroke-linecap': 'round' }),
    path(route, { fill: 'none', stroke: ACCENT, 'stroke-width': 3.4, 'stroke-dasharray': '1 9', 'stroke-linecap': 'round' }),
    ...trees,
    // pavilion
    ellipse(430, 196, 46, 12, { fill: '#e8d9c8' }),
    path('M398 196V160M414 196V158M446 196V158M462 196V160', { stroke: '#fffaf3', 'stroke-width': 6 }),
    path('M398 196V160M414 196V158M446 196V158M462 196V160', { stroke: '#d9c6b2', 'stroke-width': 1 }),
    path('M388 162C392 134 410 120 430 118C450 120 468 134 472 162Z', { fill: '#dcbb7a', stroke: '#b8914f', 'stroke-width': 1.5 }),
    path('M430 118V106', { stroke: '#b8914f', 'stroke-width': 2 }),
    circle(430, 104, 3, { fill: ACCENT }),
    // pin
    path('M430 92C420 78 412 70 412 58A18 18 0 1 1 448 58C448 70 440 78 430 92Z', { fill: '#a63f58', stroke: '#7e1a2e', 'stroke-width': 1 }),
    circle(430, 58, 8, { fill: '#fff7f3' }),
    g({ transform: 'translate(430 58) scale(0.07)' }, rose(defs, { palette: 'red', seed: 79 })),
    circle(44, 410, 7, { fill: '#fff', stroke: ACCENT, 'stroke-width': 3 }),
    g({ transform: 'translate(522 290) scale(0.5)' }, compassRose(defs, { accent: ACCENT })),
    path('M24 24H616V416H24Z', { fill: 'none', stroke: '#c9a35f', 'stroke-width': 1.2 }),
    path('M14 14H626V426H14Z', { fill: 'none', stroke: '#c9a35f', 'stroke-width': 2.4 }),
  ].join('');
  return { width: W, height: H, defs, body };
}
