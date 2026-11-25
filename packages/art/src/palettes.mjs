/**
 * Colour palettes. Every flower takes either a palette name or a custom object
 * with the same keys, so a new client's colours are one object away.
 */

/** Rose tones from petal rim (lightest) to core (darkest). */
export const ROSE = {
  blush: { id: 'blush', rim: '#fff6f3', light: '#fcdfdc', mid: '#f5c2c3', dark: '#e9a0a8', deep: '#d27c8c', core: '#b55a6e' },
  pink: { id: 'pink', rim: '#ffeef0', light: '#f9c9cf', mid: '#f0a4b0', dark: '#e07f91', deep: '#c65d75', core: '#a3445e' },
  red: { id: 'red', rim: '#e7a0a3', light: '#c9606a', mid: '#a83748', dark: '#87203a', deep: '#66132b', core: '#4b0b1e' },
  ivory: { id: 'ivory', rim: '#ffffff', light: '#fff6f0', mid: '#f6e3d9', dark: '#ebcbc0', deep: '#dba9a2', core: '#c88a88' },
  peach: { id: 'peach', rim: '#fff7f0', light: '#fde4d6', mid: '#f8cbb6', dark: '#edab94', deep: '#da8b77', core: '#bf6c5e' },
};

/** Leaf tones. */
export const LEAF = {
  sage: { id: 'sage', hi: '#e2ead6', light: '#c6d5b0', mid: '#a7bc90', dark: '#84a06f', deep: '#637f52', vein: '#f0f4e8' },
  olive: { id: 'olive', hi: '#d6dfbd', light: '#afc28c', mid: '#8ca46b', dark: '#6b8350', deep: '#4f663b', vein: '#e6ecd6' },
  dusty: { id: 'dusty', hi: '#e4ece8', light: '#c8d7cf', mid: '#a7bbb1', dark: '#839b91', deep: '#637a71', vein: '#eef4f1' },
  mint: { id: 'mint', hi: '#e7f0e4', light: '#cfe0c8', mid: '#b2cba8', dark: '#91ad86', deep: '#6f8c66', vein: '#f4f8f1' },
};

/** Small berries (the reference card uses dusky navy berries). */
export const BERRY = {
  navy: { id: 'navy', hi: '#9aa6c6', light: '#6a789f', mid: '#45537b', dark: '#2c375a', deep: '#1c2340' },
  wine: { id: 'wine', hi: '#e3a2ad', light: '#b65a6c', mid: '#8e3048', dark: '#6b1d33', deep: '#4b1023' },
};

/** Gold for ornaments and frames. */
export const GOLD = {
  id: 'gold',
  hi: '#fff6dc',
  light: '#f2dca6',
  mid: '#dcbb7a',
  dark: '#b8914f',
  deep: '#8c6a32',
};

const resolve = (table, value, fallback) => (typeof value === 'string' ? table[value] ?? table[fallback] : value ?? table[fallback]);

export const resolveRose = (p) => resolve(ROSE, p, 'blush');
export const resolveLeaf = (p) => resolve(LEAF, p, 'sage');
export const resolveBerry = (p) => resolve(BERRY, p, 'navy');
