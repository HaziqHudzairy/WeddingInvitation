/* Small helpers for writing compact SVG markup by hand. */

export const DEG = Math.PI / 180;

let DECIMALS = 1;

/** Runs `fn` with a different number of decimals for generated coordinates. */
export function withPrecision(decimals, fn) {
  const prev = DECIMALS;
  DECIMALS = decimals;
  try {
    return fn();
  } finally {
    DECIMALS = prev;
  }
}

/** Number → short string (1 decimal by default). */
export function fmt(n) {
  const m = 10 ** DECIMALS;
  const v = Math.round(n * m) / m;
  return Object.is(v, -0) ? '0' : String(v);
}
/** Number → short string (3 decimals), for scales. */
export function fmt3(n) {
  const v = Math.round(n * 1000) / 1000;
  return Object.is(v, -0) ? '0' : String(v);
}
export const pt = (p) => `${fmt(p[0])} ${fmt(p[1])}`;

/** Polar → cartesian. 0° points up, angles grow clockwise (screen space). */
export function polar(r, deg, cx = 0, cy = 0) {
  return [cx + r * Math.sin(deg * DEG), cy - r * Math.cos(deg * DEG)];
}

/** Direction (same convention as polar) from a to b. */
export function angleTo(a, b) {
  return Math.atan2(b[0] - a[0], -(b[1] - a[1])) / DEG;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];

/** Closed Catmull-Rom spline through points, as cubic Béziers. */
export function smoothClosed(points, k = 1) {
  const n = points.length;
  let d = `M${pt(points[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return `${d}Z`;
}

/** Open Catmull-Rom spline through points. */
export function smoothOpen(points, k = 1) {
  let d = `M${pt(points[0])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

/** Evaluate a cubic Bézier. */
export function cubicAt(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

/** Points along a spiral (used for scrolls and rose centres). */
export function spiral(cx, cy, r0, r1, a0, sweep, steps = 28) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(polar(lerp(r0, r1, t), a0 + sweep * t, cx, cy));
  }
  return pts;
}

const escapeAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function attrs(o = {}) {
  let s = '';
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null || v === false) continue;
    s += ` ${k}="${escapeAttr(v)}"`;
  }
  return s;
}

export function tag(name, a = {}, children) {
  const body = Array.isArray(children) ? children.join('') : children;
  return body == null || body === '' ? `<${name}${attrs(a)}/>` : `<${name}${attrs(a)}>${body}</${name}>`;
}

export const g = (a, children) => tag('g', a, Array.isArray(children) ? children.join('') : children ?? '');
export const path = (d, a = {}) => tag('path', { d, ...a });
export const circle = (cx, cy, r, a = {}) => tag('circle', { cx: fmt(cx), cy: fmt(cy), r: fmt(r), ...a });
export const ellipse = (cx, cy, rx, ry, a = {}) => tag('ellipse', { cx: fmt(cx), cy: fmt(cy), rx: fmt(rx), ry: fmt(ry), ...a });

/** Registry of <defs> (gradients, filters…) used by one document. */
export class Defs {
  constructor() {
    this.items = new Map();
    this.counter = 0;
  }
  has(id) {
    return this.items.has(id);
  }
  /** Unique id inside this document. */
  uid(prefix = 'u') {
    this.counter += 1;
    return `${prefix}${this.counter.toString(36)}`;
  }
  /** Stores a shape once and returns a function that emits `<use>` copies of it. */
  shape(d, prefix = 'p') {
    const id = this.uid(prefix);
    this.items.set(id, `<path id="${id}" d="${d}"/>`);
    return (a = {}) => tag('use', { href: `#${id}`, ...a });
  }
  /** Stores a whole drawing once under `key` and returns a `<use>` of it. */
  symbol(key, make, a = {}) {
    const id = `s-${key}`.replace(/[^\w-]/g, '_');
    if (!this.items.has(id)) {
      const markup = make();
      this.items.set(id, `<g id="${id}">${markup}</g>`);
    }
    return tag('use', { href: `#${id}`, ...a });
  }
  /** Registers markup once (markup may be a function of the id) and returns `url(#id)`. */
  add(id, markup) {
    if (!this.items.has(id)) this.items.set(id, typeof markup === 'function' ? markup(id) : markup);
    return `url(#${id})`;
  }
  toString() {
    return [...this.items.values()].join('');
  }
}

const stops = (list) =>
  list.map(([offset, color, opacity]) => tag('stop', { offset, 'stop-color': color, 'stop-opacity': opacity })).join('');

/** Linear gradient. Defaults: objectBoundingBox, top → bottom. */
export function linear(id, list, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, units, transform } = {}) {
  return tag('linearGradient', { id, x1, y1, x2, y2, gradientUnits: units, gradientTransform: transform }, stops(list));
}

export function radial(id, list, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy, units, transform } = {}) {
  return tag('radialGradient', { id, cx, cy, r, fx, fy, gradientUnits: units, gradientTransform: transform }, stops(list));
}

/** Wraps a body into a standalone SVG document. */
export function svgDocument({ width, height, viewBox, defs, body, title }) {
  const vb = viewBox ?? `0 0 ${width} ${height}`;
  const d = defs ? defs.toString() : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${fmt(width)}" height="${fmt(height)}">` +
    (title ? `<title>${escapeAttr(title)}</title>` : '') +
    (d ? `<defs>${d}</defs>` : '') +
    body +
    '</svg>\n'
  );
}

/** translate / rotate / scale(x[,y]) transform string. */
export function place({ x = 0, y = 0, rotate = 0, scale = 1, sx, sy, flip = false } = {}) {
  const parts = [];
  if (x || y) parts.push(`translate(${fmt(x)} ${fmt(y)})`);
  if (rotate) parts.push(`rotate(${fmt(rotate)})`);
  const X = (sx ?? scale) * (flip ? -1 : 1);
  const Y = sy ?? scale;
  if (X !== 1 || Y !== 1) parts.push(X === Y ? `scale(${fmt3(X)})` : `scale(${fmt3(X)} ${fmt3(Y)})`);
  return parts.join(' ') || undefined;
}
