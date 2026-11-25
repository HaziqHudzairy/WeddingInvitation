import type { CSSProperties } from 'react';

/** React style object that also accepts CSS custom properties (`--foo`). */
export type CSSVars = CSSProperties & { [key: `--${string}`]: string | number | undefined };

/** Tiny className joiner. */
export function cx(...parts: Array<string | false | null | undefined | 0>): string {
  return parts.filter(Boolean).join(' ');
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/** Deterministic pseudo random generator (mulberry32). Useful for stable decorative layouts. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
