/*
 * Parametric flowers and foliage. Each function draws one element in a canonical
 * coordinate space (documented per function) and returns an SVG string. Gradients
 * and repeated shapes are registered once per document through the shared `Defs`.
 */
import { createRng } from './random.mjs';
import { resolveBerry, resolveLeaf, resolveRose } from './palettes.mjs';
import { circle, cubicAt, ellipse, fmt, fmt3, g, lerp, linear, path, polar, pt, radial, smoothClosed, smoothOpen } from './svg.mjs';

/* ------------------------------------------------------------------ */
/* Rose                                                                */
/* ------------------------------------------------------------------ */

function roseGradients(defs, P) {
  const id = `rose-${P.id}`;
  const lin = (suffix, list) => defs.add(`${id}-${suffix}`, (gid) => linear(gid, list));
  return {
    outer: lin('o', [[0, P.rim], [0.09, P.light], [0.42, P.mid], [1, P.dark]]),
    mid: lin('m', [[0, P.rim], [0.08, P.light], [0.38, P.mid], [1, P.deep]]),
    inner: lin('i', [[0, P.light], [0.3, P.mid], [0.72, P.dark], [1, P.deep]]),
    cupLight: lin('cl', [[0, P.rim], [0.28, P.light], [1, P.dark]]),
    cupDark: lin('cd', [[0, P.light], [0.4, P.dark], [1, P.core]]),
    front: lin('f', [[0, P.rim], [0.14, P.light], [0.6, P.mid], [1, P.dark]]),
    core: defs.add(`${id}-c`, (gid) => radial(gid, [[0, P.core], [0.65, P.deep], [1, P.dark]])),
    well: defs.add(`${id}-w`, (gid) => radial(gid, [[0, P.core, 0.5], [0.55, P.deep, 0.22], [1, P.deep, 0]])),
  };
}

/**
 * One petal as a fan around the flower centre, pointing up (canonical).
 * Returns the outline, a rim highlight stroke and a "rolled edge" band.
 */
function petalGeom(rng, { width, r0, r1, wave = 0.05, pinch = 0.32, steps = 10 }) {
  const half = width / 2;
  const phase = rng.range(0, Math.PI * 2);
  const freq = rng.range(1.6, 3.2);
  const radiusAt = (t) => {
    const prof = Math.pow(Math.max(0, Math.sin(Math.PI * t)), pinch);
    const wav = 1 + wave * Math.sin(phase + t * Math.PI * freq);
    return r0 + (r1 - r0) * prof * wav;
  };
  const at = (t, dr = 0) => polar(radiusAt(t) + dr, -half + width * t);

  const outline = [];
  for (let i = 0; i <= steps; i++) outline.push(at(i / steps));
  const base = [polar(r0 * 0.3, half * 0.4), polar(r0 * 0.3, -half * 0.4)];
  const d = smoothClosed([...outline, ...base]);

  const rimPts = [];
  for (let i = 0; i <= 7; i++) rimPts.push(at(0.13 + (0.74 * i) / 7, -1.6));

  const c0 = rng.range(0.18, 0.34);
  const c1 = rng.range(0.62, 0.82);
  const thick = (r1 - r0) * rng.range(0.07, 0.12);
  const outer = [];
  const inner = [];
  for (let i = 0; i <= 6; i++) {
    const u = i / 6;
    const t = lerp(c0, c1, u);
    outer.push(at(t, -0.6));
    inner.push(polar(radiusAt(t) - 0.6 - thick * Math.sin(Math.PI * u), -half + width * t));
  }
  const curl = `${smoothOpen(outer)}${smoothOpen(inner.reverse()).replace(/^M/, 'L')}Z`;
  return { d, rim: smoothOpen(rimPts), curl };
}

/** Front "cup" petal for 3/4 views: rim along the top at y≈0, body hanging down to y=h. */
function cupPetal(rng, w, h) {
  const j = () => rng.range(-0.05, 0.05) * h;
  const rim = [
    [-w, h * 0.14],
    [-w * 0.55, -h * 0.05 + j()],
    [0, -h * 0.1 + j()],
    [w * 0.55, -h * 0.05 + j()],
    [w, h * 0.14],
  ];
  const d = smoothClosed([...rim, [w * 0.8, h * 0.62], [0, h], [-w * 0.8, h * 0.62]]);
  const rimLine = smoothOpen(rim.slice(0, 5).map(([x, y]) => [x * 0.94, y + 1.6]));
  const band = rim.slice(1, 4);
  const thick = h * rng.range(0.07, 0.11);
  const curl = `${smoothOpen(band.map(([x, y]) => [x, y + 0.6]))}${smoothOpen(
    [...band].reverse().map(([x, y], i) => [x * 0.9, y + 0.6 + (i === 1 ? thick : thick * 0.25)]),
  ).replace(/^M/, 'L')}Z`;
  return { d, rim: rimLine, curl };
}

function crescentPath(w, h, sag = 0.42) {
  const k = 4 / 3;
  return (
    `M${fmt(-w)} 0C${fmt(-w)} ${fmt(-h * k)} ${fmt(w)} ${fmt(-h * k)} ${fmt(w)} 0` +
    `C${fmt(w * 0.72)} ${fmt(-h * sag * k)} ${fmt(-w * 0.72)} ${fmt(-h * sag * k)} ${fmt(-w)} 0Z`
  );
}

function crescentRim(w, h) {
  return `M${fmt(-w * 0.78)} ${fmt(-h * 0.6)}C${fmt(-w * 0.45)} ${fmt(-h * 1.0)} ${fmt(w * 0.45)} ${fmt(-h * 1.0)} ${fmt(w * 0.78)} ${fmt(-h * 0.6)}`;
}

/**
 * Garden rose, front view. Canonical: centred on (0,0), radius 100.
 * `tilt` (0..1) turns it into a 3/4 view with a cupped front.
 */
export function rose(defs, { palette = 'blush', seed = 1, tilt = 0, cup = 6 } = {}) {
  const P = resolveRose(palette);
  const rng = createRng(seed);
  const G = roseGradients(defs, P);
  const shadow = P.core;
  const parts = [];
  const rot0 = rng.range(0, 360);

  const ring = ({ n, r0, r1, width, fill, offset, curl = 0, shade = 0.16 }) => {
    for (let i = 0; i < n; i++) {
      const a = offset + (i * 360) / n + rng.range(-8, 8);
      const geo = petalGeom(rng, {
        width: width * rng.range(0.92, 1.08),
        r0,
        r1: r1 * rng.range(0.9, 1.02),
        wave: rng.range(0.02, 0.07),
      });
      const use = defs.shape(geo.d);
      const kids = [];
      if (shade) kids.push(use({ fill: shadow, opacity: shade, transform: 'scale(1.06)' }));
      kids.push(use({ fill, stroke: P.deep, 'stroke-width': 0.8, 'stroke-opacity': 0.28 }));
      if (curl && rng.chance(curl)) kids.push(path(geo.curl, { fill: P.rim, opacity: 0.82 }));
      kids.push(path(geo.rim, { fill: 'none', stroke: P.rim, 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: 0.75 }));
      parts.push(g({ transform: `rotate(${fmt(a)})` }, kids));
    }
  };

  const n1 = rng.chance(0.5) ? 5 : 6;
  ring({ n: n1, r0: 24, r1: 100, width: (360 / n1) * 1.48, fill: G.outer, offset: rot0, curl: 0.55, shade: 0 });
  ring({ n: 5, r0: 18, r1: 82, width: 98, fill: G.mid, offset: rot0 + 36, curl: 0.4 });
  ring({ n: 5, r0: 12, r1: 65, width: 96, fill: G.inner, offset: rot0 + 8, curl: 0.3 });
  parts.push(circle(0, 0, 60, { fill: G.well }));

  // Heart of the rose: a few cupped petals around a dark well with a light-rimmed spiral.
  const spin = rot0 + rng.range(0, 360);
  for (let k = 0; k < 3; k++) {
    const w = 40 - k * 6;
    const h = 30 - k * 5;
    const d = crescentPath(w, h, 0.25);
    parts.push(
      g({ transform: `rotate(${fmt(spin + k * 120 + rng.range(-12, 12))}) translate(0 ${fmt(h * 0.62)})` }, [
        path(d, { fill: shadow, opacity: 0.18, transform: 'translate(0 -3) scale(1.05)' }),
        path(d, { fill: G.cupLight }),
        path(crescentRim(w, h), { fill: 'none', stroke: P.rim, 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.8 }),
      ]),
    );
  }
  const heartR = 25;
  parts.push(circle(0, 0, heartR, { fill: G.core }));
  const turns = 2.4;
  const total = turns * 360;
  const rAt = (th) => 2 + (heartR - 3) * (th / total);
  for (let a = 0, k = 0; a < total - 40; a += 140, k++) {
    const b = Math.min(total, a + 230);
    const outer = [];
    const inner = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const th = a + (b - a) * u;
      const r = rAt(th);
      outer.push(polar(r, spin + th));
      inner.push(polar(Math.max(0.6, r - ((heartR / turns) * 0.5 * Math.sin(Math.PI * u) + 0.3)), spin + th));
    }
    const fill = a > total * 0.45 ? G.cupLight : G.cupDark;
    parts.push(
      path(`${smoothOpen(outer)}${smoothOpen(inner.reverse()).replace(/^M/, 'L')}Z`, { fill }),
      path(smoothOpen(outer.slice(1, 8)), { fill: 'none', stroke: P.rim, 'stroke-width': 0.9, opacity: 0.6 + k * 0.05 }),
    );
  }

  if (tilt <= 0) return parts.join('');

  // 3/4 view: squash the open face and add a scalloped lip of front petals over its lower part.
  const sy = 1 - tilt * 0.42;
  const lipY = 100 * sy * 0.4;
  const fronts = [];
  const specs = [
    { x: -60, y: lipY + 4, rot: -40, w: 40, h: 44 },
    { x: 60, y: lipY + 4, rot: 40, w: 40, h: 44 },
    { x: -22, y: lipY, rot: -10, w: 44, h: 48 },
    { x: 24, y: lipY + 2, rot: 12, w: 44, h: 48 },
  ];
  for (const s of specs) {
    const geo = cupPetal(rng, s.w * rng.range(0.92, 1.08), s.h * rng.range(0.92, 1.08));
    const use = defs.shape(geo.d);
    fronts.push(
      g({ transform: `translate(${fmt(s.x + rng.range(-4, 4))} ${fmt(s.y)}) rotate(${fmt(s.rot + rng.range(-5, 5))})` }, [
        use({ fill: shadow, opacity: 0.16, transform: 'translate(0 -3) scale(1.04)' }),
        use({ fill: G.front }),
        rng.chance(0.65) ? path(geo.curl, { fill: P.rim, opacity: 0.85 }) : '',
        path(geo.rim, { fill: 'none', stroke: P.rim, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.85 }),
      ]),
    );
  }
  return g({ transform: `scale(1 ${fmt3(sy)})` }, parts) + fronts.join('');
}

/* ------------------------------------------------------------------ */
/* Leaves                                                              */
/* ------------------------------------------------------------------ */

/**
 * A single leaf with a creased, two-tone blade. Canonical: base at (0,0), tip at (0,-100).
 */
export function leaf(defs, { palette = 'sage', seed = 1, width = 0.42, bend = 0.12, veins = 4 } = {}) {
  const P = resolveLeaf(palette);
  const rng = createRng(seed);
  const L = 100;
  const W = (L * width) / 2;
  const bt = bend * L;
  const gA = defs.add(`leaf-${P.id}-a`, (id) => linear(id, [[0, P.deep], [1, P.mid]], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  const gB = defs.add(`leaf-${P.id}-b`, (id) => linear(id, [[0, P.mid], [0.65, P.light], [1, P.hi]], { x1: 0, y1: 0, x2: 1, y2: 0 }));
  const wl = W * rng.range(0.88, 1.12);
  const wr = W * rng.range(0.88, 1.12);
  const tip = [bt, -L];
  const r1 = [bt * 0.1, -L * 0.33];
  const r2 = [bt * 0.55, -L * 0.66];
  const lc1 = `${fmt(-wl * 0.95)} ${fmt(-L * 0.1)}`;
  const lc2 = `${fmt(-wl * 1.12 + bt * 0.35)} ${fmt(-L * 0.62)}`;
  const rc1 = `${fmt(wr * 0.95)} ${fmt(-L * 0.1)}`;
  const rc2 = `${fmt(wr * 1.12 + bt * 0.35)} ${fmt(-L * 0.62)}`;
  const left = `M0 0C${lc1} ${lc2} ${pt(tip)}C${pt(r2)} ${pt(r1)} 0 0Z`;
  const right = `M0 0C${rc1} ${rc2} ${pt(tip)}C${pt(r2)} ${pt(r1)} 0 0Z`;
  const outline = `M0 0C${lc1} ${lc2} ${pt(tip)}C${rc2} ${rc1} 0 0Z`;
  const rib = `M0 0C${pt(r1)} ${pt(r2)} ${pt(tip)}`;
  let veinD = '';
  for (let i = 0; i < veins; i++) {
    const t = 0.18 + (i * 0.6) / Math.max(1, veins - 1);
    const m = cubicAt([0, 0], r1, r2, tip, t);
    const span = Math.sin(Math.PI * Math.min(0.92, t * 0.85 + 0.1));
    veinD += `M${pt(m)}Q${fmt(m[0] - wl * 0.35 * span)} ${fmt(m[1] - 2)} ${fmt(m[0] - wl * 0.8 * span)} ${fmt(m[1] - L * 0.1)}`;
    veinD += `M${pt(m)}Q${fmt(m[0] + wr * 0.35 * span)} ${fmt(m[1] - 2)} ${fmt(m[0] + wr * 0.8 * span)} ${fmt(m[1] - L * 0.1)}`;
  }
  return [
    path(`M0 0L${fmt(-bt * 0.03)} ${fmt(L * 0.1)}`, { fill: 'none', stroke: P.deep, 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
    path(left, { fill: gA }),
    path(right, { fill: gB }),
    path(veinD, { fill: 'none', stroke: P.vein, 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.45 }),
    path(rib, { fill: 'none', stroke: P.vein, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.75 }),
    path(outline, { fill: 'none', stroke: P.deep, 'stroke-width': 0.9, opacity: 0.35 }),
  ].join('');
}

/**
 * A stem with alternating leaves. Canonical: base (0,0), tip near (bend*100, -100).
 */
export function sprig(defs, { palette = 'sage', seed = 1, leaves = 7, bend = 0.25, leafSize = 0.42, stem = 2.4 } = {}) {
  const P = resolveLeaf(palette);
  const rng = createRng(seed);
  const L = 100;
  const bx = bend * L;
  const p0 = [0, 0];
  const c1 = [bx * 0.1, -L * 0.35];
  const c2 = [bx * 0.7, -L * 0.7];
  const p3 = [bx, -L];
  const out = [path(`M0 0C${pt(c1)} ${pt(c2)} ${pt(p3)}`, { fill: 'none', stroke: P.deep, 'stroke-width': stem, 'stroke-linecap': 'round' })];
  for (let i = 0; i < leaves; i++) {
    const isTip = i === leaves - 1;
    const t = isTip ? 1 : 0.16 + (i / Math.max(1, leaves - 1)) * 0.8;
    const m = cubicAt(p0, c1, c2, p3, t);
    const m2 = cubicAt(p0, c1, c2, p3, Math.max(0, t - 0.02));
    const dir = (Math.atan2(m[0] - m2[0], -(m[1] - m2[1])) * 180) / Math.PI;
    const side = i % 2 === 0 ? -1 : 1;
    const ang = isTip ? dir : dir + side * rng.range(36, 58);
    const size = leafSize * L * (isTip ? 0.9 : lerp(1.05, 0.7, t)) * rng.range(0.85, 1.1);
    out.push(
      g(
        { transform: `translate(${pt(m)}) rotate(${fmt(ang)}) scale(${fmt3(size / 100)})` },
        leaf(defs, { palette: P, seed: rng.int(1, 1e9), bend: side * rng.range(0.04, 0.18), width: rng.range(0.38, 0.5) }),
      ),
    );
  }
  return out.join('');
}

/**
 * Silver-dollar eucalyptus stem. Canonical: base (0,0), tip near (bend*100, -100).
 */
export function eucalyptus(defs, { palette = 'dusty', seed = 1, count = 9, bend = 0.3 } = {}) {
  const P = resolveLeaf(palette);
  const rng = createRng(seed);
  const L = 100;
  const bx = bend * L;
  const p0 = [0, 0];
  const c1 = [bx * 0.05, -L * 0.4];
  const c2 = [bx * 0.6, -L * 0.75];
  const p3 = [bx, -L];
  const fill = defs.add(`euc-${P.id}`, (id) => radial(id, [[0, P.hi], [0.45, P.light], [1, P.dark]], { cx: 0.38, cy: 0.32, r: 0.8 }));
  const out = [path(`M0 0C${pt(c1)} ${pt(c2)} ${pt(p3)}`, { fill: 'none', stroke: P.deep, 'stroke-width': 1.8, 'stroke-linecap': 'round' })];
  for (let i = 0; i < count; i++) {
    const t = 0.1 + (i / Math.max(1, count - 1)) * 0.9;
    const m = cubicAt(p0, c1, c2, p3, t);
    const m2 = cubicAt(p0, c1, c2, p3, Math.max(0, t - 0.02));
    const dir = (Math.atan2(m[0] - m2[0], -(m[1] - m2[1])) * 180) / Math.PI;
    const side = i % 2 ? 1 : -1;
    const r = lerp(13, 7, t) * rng.range(0.85, 1.15);
    const c = polar(r * 0.95, dir + side * rng.range(60, 95), m[0], m[1]);
    out.push(
      ellipse(c[0], c[1], r, r * 0.9, { fill, stroke: P.deep, 'stroke-width': 0.6, 'stroke-opacity': 0.4, transform: `rotate(${fmt(dir)} ${pt(c)})` }),
      path(`M${pt(m)}L${pt(c)}`, { stroke: P.vein, 'stroke-width': 0.8, opacity: 0.6, 'stroke-linecap': 'round' }),
    );
  }
  return out.join('');
}

/**
 * Cluster of small round berries on thin stems. Canonical: base (0,0), up to about (0,-75).
 */
export function berries(defs, { palette = 'navy', seed = 1, count = 7, spread = 1, stemColor = '#6f7e5e' } = {}) {
  const P = resolveBerry(palette);
  const rng = createRng(seed);
  const fill = defs.add(`berry-${P.id}`, (id) => radial(id, [[0, P.light], [0.55, P.mid], [1, P.deep]], { cx: 0.36, cy: 0.32, r: 0.75 }));
  const main = [[0, 0], [rng.range(-4, 4), -32], [rng.range(-7, 7), -62]];
  const stems = [path(smoothOpen(main), { fill: 'none', stroke: stemColor, 'stroke-width': 1.6, 'stroke-linecap': 'round' })];
  const dots = [];
  const addBerry = ([x, y], dir) => {
    const r = rng.range(4.2, 6.4);
    dots.push(
      circle(x, y, r, { fill }),
      circle(x - r * 0.35, y - r * 0.38, r * 0.3, { fill: '#fff', opacity: 0.55 }),
      circle(...polar(r * 0.62, dir, x, y), r * 0.2, { fill: P.deep }),
    );
  };
  for (let i = 0; i < count; i++) {
    const t = rng.range(0.35, 0.98);
    const base = [lerp(main[0][0], main[2][0], t), -62 * t];
    const ang = rng.range(-75, 75);
    const end = polar(rng.range(10, 24) * spread, ang, base[0], base[1]);
    stems.push(
      path(`M${pt(base)}Q${fmt((base[0] + end[0]) / 2 + rng.range(-3, 3))} ${fmt((base[1] + end[1]) / 2)} ${pt(end)}`, {
        fill: 'none',
        stroke: stemColor,
        'stroke-width': 1.1,
        'stroke-linecap': 'round',
      }),
    );
    addBerry(end, ang);
  }
  addBerry(main[2], 0);
  return [...stems, ...dots].join('');
}

/** Tiny five-petal filler flower. Canonical radius 10. */
export function blossom(defs, { palette = 'ivory', seed = 1, petals = 5 } = {}) {
  const P = resolveRose(palette);
  const rng = createRng(seed);
  const fill = defs.add(`blossom-${P.id}`, (id) => radial(id, [[0, P.mid], [0.5, P.light], [1, P.rim]], { cx: 0.5, cy: 0.95, r: 0.95 }));
  const rot = rng.range(0, 72);
  const out = [];
  for (let i = 0; i < petals; i++) {
    out.push(
      g(
        { transform: `rotate(${fmt(rot + (i * 360) / petals)})` },
        path('M0 0C-5 -2 -6.2 -9 0 -10.5C6.2 -9 5 -2 0 0Z', { fill, stroke: P.deep, 'stroke-width': 0.45, 'stroke-opacity': 0.45 }),
      ),
    );
  }
  out.push(circle(0, 0, 2.3, { fill: P.core }), circle(-0.6, -0.7, 0.8, { fill: '#fff', opacity: 0.6 }));
  return out.join('');
}

/** Closed rosebud with sepals. Canonical: receptacle at (0,0), tip at (0,-62), stem to (0,45). */
export function bud(defs, { palette = 'red', leafPalette = 'sage', seed = 1, open = 0.3, stem = true } = {}) {
  const P = resolveRose(palette);
  const LP = resolveLeaf(leafPalette);
  const rng = createRng(seed);
  const gBody = defs.add(`bud-${P.id}`, (id) => linear(id, [[0, P.light], [0.45, P.mid], [1, P.deep]], { x1: 0.15, y1: 0, x2: 0.85, y2: 1 }));
  const gWrap = defs.add(`bud-${P.id}-w`, (id) => linear(id, [[0, P.rim], [0.45, P.light], [1, P.dark]], { x1: 0, y1: 0, x2: 1, y2: 1 }));
  const gSepal = defs.add(`sepal-${LP.id}`, (id) => linear(id, [[0, LP.light], [1, LP.deep]]));
  const w = 17 + open * 9;
  const body = `M0 -62C${fmt(w * 0.9)} -54 ${fmt(w * 1.1)} -24 ${fmt(w * 0.55)} -6C${fmt(w * 0.3)} 0 ${fmt(-w * 0.3)} 0 ${fmt(-w * 0.55)} -6C${fmt(-w * 1.1)} -24 ${fmt(-w * 0.9)} -54 0 -62Z`;
  const wrapL = `M${fmt(-w * 0.78)} -14C${fmt(-w * 0.95)} -40 ${fmt(-w * 0.2)} -62 ${fmt(w * 0.48)} -55C${fmt(w * 0.02)} -47 ${fmt(-w * 0.38)} -34 ${fmt(-w * 0.78)} -14Z`;
  const wrapR = `M${fmt(w * 0.82)} -12C${fmt(w * 0.98)} -32 ${fmt(w * 0.55)} -50 ${fmt(w * 0.1)} -58C${fmt(w * 0.5)} -44 ${fmt(w * 0.68)} -30 ${fmt(w * 0.82)} -12Z`;
  const sepal = (ang, len, curve) =>
    g({ transform: `rotate(${fmt(ang)})` }, path(`M-3 0C-5 ${fmt(-len * 0.4)} -2 ${fmt(-len * 0.8)} ${fmt(curve)} ${fmt(-len)}C2 ${fmt(-len * 0.78)} 5 ${fmt(-len * 0.4)} 3 0Z`, { fill: gSepal }));
  const out = [];
  if (stem) out.push(path(`M0 3Q${fmt(rng.range(-4, 4))} 24 ${fmt(rng.range(-3, 3))} 45`, { fill: 'none', stroke: LP.deep, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  out.push(
    path(body, { fill: gBody }),
    path(wrapR, { fill: P.deep, opacity: 0.45 }),
    path(wrapL, { fill: gWrap }),
    sepal(-34 + rng.range(-6, 6), 30 + rng.range(-4, 6), -6),
    sepal(30 + rng.range(-6, 6), 28 + rng.range(-4, 6), 6),
    sepal(rng.range(-8, 8), 22, 2),
    ellipse(0, 2, 6.5, 5.5, { fill: LP.mid }),
  );
  return out.join('');
}

/** A loose falling petal. Canonical: base (0,0), tip (0,-58). */
export function loosePetal(defs, { palette = 'blush', seed = 1 } = {}) {
  const P = resolveRose(palette);
  const rng = createRng(seed);
  const fill = defs.add(`lpetal-${P.id}`, (id) => linear(id, [[0, P.rim], [0.4, P.light], [1, P.dark]], { x1: 0.3, y1: 0, x2: 0.7, y2: 1 }));
  const w = rng.range(26, 34);
  const d = `M0 0C${fmt(-w)} -8 ${fmt(-w * 1.1)} -46 ${fmt(-w * 0.2)} -58C${fmt(-w * 0.05)} -60 ${fmt(w * 0.1)} -60 ${fmt(w * 0.25)} -57C${fmt(w * 1.05)} -44 ${fmt(w * 0.95)} -8 0 0Z`;
  return [
    path(d, { fill }),
    path(`M${fmt(-w * 0.7)} -40C${fmt(-w * 0.5)} -54 ${fmt(w * 0.4)} -58 ${fmt(w * 0.75)} -42`, { fill: 'none', stroke: P.rim, 'stroke-width': 1.6, opacity: 0.8, 'stroke-linecap': 'round' }),
    path('M0 -4C-2 -20 -1 -38 2 -50', { fill: 'none', stroke: P.deep, 'stroke-width': 1, opacity: 0.3 }),
  ].join('');
}
