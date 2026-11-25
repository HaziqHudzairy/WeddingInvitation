/*
 * Anonymous bride & groom, hand-drawn as SVG paths (faceless, storybook style).
 * Coordinates live in one shared 700×1000 space so the two figures can be drawn
 * alone (profile cards) or together (hero scene).
 */
import { arrange, circle, ellipse, fmt, g, linear, path, radial, smoothOpen } from '@wedding/art';

export const PEOPLE_COLORS = {
  skin: '#f3d0b9',
  skinLight: '#f9e0cf',
  skinShade: '#e2b199',
  blush: '#ef9f9c',
  hair: '#3a2621',
  hairHi: '#6a4a3e',
  suit: '#34405a',
  suitShade: '#232c3f',
  suitHi: '#4a5875',
  lapel: '#2a3447',
  lapelHi: '#6f7da0',
  shirt: '#fbf8f5',
  shirtShade: '#e2d7d1',
  tie: '#8a1f36',
  tieHi: '#b0425a',
  shoe: '#1d2029',
  shoeHi: '#6b7182',
  dress: '#fffdfb',
  dressMid: '#f8efea',
  dressShade: '#ead8d0',
  dressDeep: '#d9c0b7',
  lace: '#e6d0c7',
  sash: '#f2c4c9',
  sashDeep: '#d99aa6',
  gold: '#c9a35f',
};

const C = PEOPLE_COLORS;

function gradients(defs) {
  return {
    suit: defs.add('suit', (id) => linear(id, [[0, C.suitShade], [0.28, C.suit], [0.55, C.suitHi], [0.82, C.suit], [1, C.suitShade]], { x1: 0, y1: 0, x2: 1, y2: 0 })),
    sleeve: defs.add('sleeve', (id) => linear(id, [[0, C.suitShade], [0.45, C.suit], [1, C.suitHi]], { x1: 0, y1: 0, x2: 1, y2: 0 })),
    trouser: defs.add('trouser', (id) => linear(id, [[0, C.suitShade], [0.4, C.suit], [0.7, C.suitHi], [1, C.suitShade]], { x1: 0, y1: 0, x2: 1, y2: 0 })),
    tie: defs.add('tie', (id) => linear(id, [[0, C.tieHi], [1, C.tie]], { x1: 0, y1: 0, x2: 1, y2: 1 })),
    skin: defs.add('skin', (id) => radial(id, [[0, C.skinLight], [0.62, C.skin], [1, C.skinShade]], { cx: 0.4, cy: 0.36, r: 0.72 })),
    hair: defs.add('hair', (id) => linear(id, [[0, C.hairHi], [0.45, C.hair], [1, '#2a1b17']], { x1: 0.2, y1: 0, x2: 0.8, y2: 1 })),
    dress: defs.add('dress', (id) =>
      linear(id, [[0, C.dressShade], [0.22, C.dressMid], [0.45, '#ffffff'], [0.7, C.dressMid], [1, C.dressDeep]], { x1: 0, y1: 0, x2: 1, y2: 0 }),
    ),
    bodice: defs.add('bodice', (id) => linear(id, [[0, C.dressShade], [0.4, '#ffffff'], [1, C.dressShade]], { x1: 0, y1: 0, x2: 1, y2: 0 })),
    veil: defs.add('veil', (id) => linear(id, [[0, '#ffffff', 0.85], [0.5, '#ffffff', 0.55], [1, '#fdf6f4', 0.35]], { x1: 0, y1: 0, x2: 0.3, y2: 1 })),
    sash: defs.add('sash', (id) => linear(id, [[0, C.sash], [1, C.sashDeep]])),
    shadow: defs.add('ground', (id) => radial(id, [[0, '#5b3a44', 0.3], [1, '#5b3a44', 0]])),
  };
}

/* ------------------------------------------------------------------ */
/* Groom                                                               */
/* ------------------------------------------------------------------ */

export function groom(defs) {
  const G = gradients(defs);
  const legs = [
    path('M204 540C206 680 211 820 214 930L253 930C255 820 257 680 258 544Z', { fill: G.trouser }),
    path('M266 544L324 540C318 680 313 820 310 930L272 930C270 820 268 680 266 544Z', { fill: G.trouser }),
    path('M234 560L233 925M294 560L291 925', { fill: 'none', stroke: C.suitHi, 'stroke-width': 1.5, opacity: 0.45 }),
  ];
  const shoes = [
    path('M212 924L254 924C257 936 256 950 248 954L200 954C192 954 190 946 197 940C203 935 208 930 212 924Z', { fill: C.shoe }),
    path('M270 924L312 924C318 932 326 938 332 942C338 947 335 954 326 954L276 954C268 954 267 940 270 924Z', { fill: C.shoe }),
    path('M203 945C214 940 228 940 240 942M282 942C294 940 310 940 322 945', { fill: 'none', stroke: C.shoeHi, 'stroke-width': 2, opacity: 0.6, 'stroke-linecap': 'round' }),
  ];
  const jacket = [
    path(
      'M241 230C226 236 200 242 186 250C174 258 170 276 171 298C173 350 186 400 198 432C196 470 192 510 190 552C230 562 296 562 334 552C332 510 328 470 326 432C338 400 351 350 353 298C354 276 350 258 338 250C324 242 298 236 283 230Z',
      { fill: G.suit },
    ),
    path('M262 432L238 558L286 558Z', { fill: C.suitShade }),
    path('M238 558L262 432L286 558', { fill: 'none', stroke: C.suitHi, 'stroke-width': 1.2, opacity: 0.5 }),
    path('M204 486L240 484M286 484L320 486', { fill: 'none', stroke: C.suitShade, 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
  ];
  const shirt = [
    path('M243 232L281 232L266 404L258 404Z', { fill: C.shirt }),
    path('M272 236L266 404', { stroke: C.shirtShade, 'stroke-width': 3, opacity: 0.8 }),
    path('M256 248L268 248L266 260L258 260Z', { fill: C.tie }),
    path('M258 260L266 260L273 372L262 390L251 372Z', { fill: G.tie }),
    path('M253 334L271 334', { stroke: C.gold, 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
    path('M244 229L261 250L246 256L238 236Z', { fill: C.shirt, stroke: C.shirtShade, 'stroke-width': 0.8 }),
    path('M280 229L263 250L278 256L286 236Z', { fill: C.shirt, stroke: C.shirtShade, 'stroke-width': 0.8 }),
  ];
  const lapels = [
    path('M243 232L260 404L262 426C256 400 240 350 214 292L227 283L223 268C227 256 233 244 243 232Z', { fill: C.lapel }),
    path('M281 232L264 404L262 426C268 400 284 350 310 292L297 283L301 268C297 256 291 244 281 232Z', { fill: C.lapel }),
    path('M262 426C256 400 240 350 214 292L227 283M262 426C268 400 284 350 310 292L297 283', {
      fill: 'none',
      stroke: C.lapelHi,
      'stroke-width': 1.2,
      opacity: 0.7,
      'stroke-linejoin': 'round',
    }),
    circle(262, 434, 3.8, { fill: C.suitShade, stroke: C.lapelHi, 'stroke-width': 0.8 }),
    path('M290 320L320 316', { stroke: C.suitShade, 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
    path('M294 318L299 306L304 314L309 304L314 315Z', { fill: '#f4c6cc' }),
  ];
  const boutonniere = arrange(defs, [
    { kind: 'leaf', x: 300, y: 292, size: 16, rotate: -140, palette: 'sage' },
    { kind: 'leaf', x: 301, y: 292, size: 14, rotate: 165, palette: 'olive' },
    { kind: 'blossom', x: 294, y: 296, size: 4, palette: 'ivory' },
    { kind: 'rose', x: 303, y: 287, size: 9, palette: 'red', seed: 77 },
  ], { seed: 5 });
  const arms = [
    path('M186 250C170 258 162 284 162 318C161 380 162 450 166 512L196 514C197 450 199 390 201 330C202 296 200 266 186 250Z', { fill: G.sleeve }),
    path('M168 404C176 408 186 408 196 402', { fill: 'none', stroke: C.suitShade, 'stroke-width': 1.6, opacity: 0.6 }),
    path('M166 512L196 514L196 522L166 520Z', { fill: C.shirt }),
    path('M167 520C163 536 166 554 178 558C190 561 198 550 197 534L196 522Z', { fill: G.skin }),
    path('M338 250C354 258 362 284 362 318C363 380 362 450 358 512L328 514C327 450 325 390 323 330C322 296 324 266 338 250Z', { fill: G.sleeve }),
    path('M356 404C348 408 338 408 328 402', { fill: 'none', stroke: C.suitShade, 'stroke-width': 1.6, opacity: 0.6 }),
    path('M358 512L328 514L328 522L358 520Z', { fill: C.shirt }),
    path('M357 520C361 536 358 554 346 558C334 561 326 550 327 534L328 522Z', { fill: G.skin }),
  ];
  const neck = [
    path('M249 196L276 196L279 236L246 236Z', { fill: G.skin }),
    path('M249 202C256 214 270 216 277 206L278 220C268 228 256 226 248 218Z', { fill: C.skinShade, opacity: 0.85 }),
  ];
  const head = g({ transform: 'rotate(6 262 214)' }, [
    ellipse(229, 170, 6.5, 11, { fill: C.skinShade }),
    path('M228 160C228 128 245 117 263 117C282 117 297 130 297 158C297 184 287 204 267 210C258 213 249 211 242 205C232 196 228 180 228 160Z', { fill: G.skin }),
    path('M288 146C296 166 292 194 268 209C284 203 297 186 297 160C297 154 293 148 288 146Z', { fill: C.skinShade, opacity: 0.55 }),
    path('M224 168C218 140 226 114 250 104C272 95 296 102 304 120C309 132 306 145 300 152C296 142 288 134 277 132C264 130 252 134 243 142C236 148 233 156 232 170C230 174 226 174 224 168Z', { fill: G.hair }),
    path('M228 150L237 148L235 174L229 171Z', { fill: C.hair }),
    path('M248 110C264 103 286 106 297 120C285 113 268 112 252 118Z', { fill: C.hairHi, opacity: 0.7 }),
    path('M262 106C258 118 252 128 246 138', { fill: 'none', stroke: C.hairHi, 'stroke-width': 1.5, opacity: 0.5 }),
  ]);
  return [
    ellipse(262, 952, 98, 11, { fill: G.shadow }),
    ...legs,
    ...shoes,
    ...jacket,
    ...shirt,
    ...lapels,
    boutonniere,
    ...arms,
    ...neck,
    head,
  ].join('');
}

/* ------------------------------------------------------------------ */
/* Bride                                                               */
/* ------------------------------------------------------------------ */

function skirtPath() {
  const hem = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const x = 290 + (664 - 290) * t;
    const base = 944 + (948 - 944) * t + Math.sin(t * Math.PI) * 20;
    hem.push([x, base + (i % 2 ? -5 : 4)]);
  }
  return (
    'M414 404C398 470 360 560 334 660C312 744 296 840 290 944' +
    smoothOpen(hem).replace(/^M[^C]*/, '') +
    'C646 896 620 820 596 740C566 626 512 496 482 404Z'
  );
}

function skirtFolds() {
  const out = [];
  for (let i = 0; i < 6; i++) {
    const xt = 424 + i * 10;
    const xb = 318 + i * 64;
    const w = 7 + i * 1.5;
    const yb = 950 + Math.sin(((xb - 290) / 374) * Math.PI) * 18;
    out.push(
      path(`M${xt} 412C${fmt(xt - (xt - xb) * 0.25)} 560 ${fmt(xb + 8)} 760 ${fmt(xb)} ${fmt(yb)}L${fmt(xb + w * 2)} ${fmt(yb)}C${fmt(xb + w * 2.2)} 760 ${fmt(xt + 4 - (xt - xb) * 0.2)} 560 ${xt + 2} 412Z`, {
        fill: C.dressShade,
        opacity: 0.55,
      }),
      path(`M${xt + 6} 414C${fmt(xt + 6 - (xt - xb) * 0.22)} 560 ${fmt(xb + w * 3)} 760 ${fmt(xb + w * 3.2)} ${fmt(yb - 4)}`, {
        fill: 'none',
        stroke: '#ffffff',
        'stroke-width': 3,
        opacity: 0.7,
        'stroke-linecap': 'round',
      }),
    );
  }
  return out.join('');
}

function bouquet(defs) {
  return arrange(
    defs,
    [
      { kind: 'eucalyptus', x: 432, y: 432, size: 58, rotate: 205, palette: 'dusty', layer: -3 },
      { kind: 'eucalyptus', x: 466, y: 430, size: 50, rotate: 160, palette: 'dusty', layer: -3 },
      { kind: 'leaf', x: 418, y: 420, size: 34, rotate: -110, palette: 'sage', layer: -2 },
      { kind: 'leaf', x: 480, y: 416, size: 32, rotate: 105, palette: 'olive', layer: -2 },
      { kind: 'leaf', x: 446, y: 398, size: 30, rotate: -10, palette: 'sage', layer: -2 },
      { kind: 'leaf', x: 436, y: 440, size: 30, rotate: 200, palette: 'olive', layer: -2 },
      { kind: 'berries', x: 474, y: 438, size: 30, rotate: 150, layer: -1 },
      { kind: 'rose', x: 428, y: 410, size: 14, palette: 'blush', seed: 31 },
      { kind: 'rose', x: 470, y: 408, size: 13, palette: 'ivory', seed: 32 },
      { kind: 'rose', x: 438, y: 430, size: 12, palette: 'ivory', seed: 33, tilt: 0.4 },
      { kind: 'rose', x: 462, y: 431, size: 12, palette: 'blush', seed: 34, tilt: 0.4 },
      { kind: 'rose', x: 449, y: 414, size: 16, palette: 'red', seed: 35 },
      { kind: 'bud', x: 452, y: 394, size: 15, palette: 'red', rotate: 8, stem: false },
      { kind: 'blossom', x: 420, y: 428, size: 4.5, palette: 'ivory' },
      { kind: 'blossom', x: 478, y: 424, size: 4, palette: 'blush' },
    ],
    { seed: 9 },
  );
}

export function bride(defs) {
  const G = gradients(defs);
  const veil = [
    path('M484 188C514 228 548 380 586 540C616 668 640 820 676 962L548 968C548 820 520 640 494 470C482 380 474 262 484 188Z', { fill: G.veil }),
    path('M486 190C516 230 550 382 588 542C618 670 642 822 678 962', { fill: 'none', stroke: '#ffffff', 'stroke-width': 2.2, opacity: 0.9 }),
    path('M496 240C516 330 540 460 560 600', { fill: 'none', stroke: '#ffffff', 'stroke-width': 1.4, opacity: 0.5 }),
  ];
  const skirt = [
    path(skirtPath(), { fill: G.dress }),
    skirtFolds(),
    path('M414 404C398 470 360 560 334 660C312 744 296 840 290 944', { fill: 'none', stroke: C.dressDeep, 'stroke-width': 1.2, opacity: 0.6 }),
  ];
  // sparse lace flowers on the upper skirt
  const lace = [];
  const spots = [
    [418, 470], [452, 456], [474, 488], [402, 540], [440, 520], [488, 548], [380, 610], [424, 600], [470, 620], [516, 640],
    [360, 700], [410, 690], [462, 710], [530, 730], [350, 800], [420, 790], [500, 820], [560, 830],
  ];
  for (const [x, y] of spots) {
    lace.push(
      g({ transform: `translate(${x} ${y})`, opacity: 0.75 }, [
        circle(0, 0, 1.8, { fill: C.lace }),
        ...[0, 72, 144, 216, 288].map((a) => g({ transform: `rotate(${a})` }, ellipse(0, -4, 1.6, 2.8, { fill: 'none', stroke: C.lace, 'stroke-width': 0.9 }))),
      ]),
    );
  }
  const upper = [
    path('M392 270C402 252 424 246 448 246C472 246 494 252 504 270C508 282 504 292 498 296L398 296C392 292 388 282 392 270Z', { fill: G.skin }),
    path('M416 266C426 270 434 270 441 267M455 267C462 270 470 270 480 266', { fill: 'none', stroke: C.skinShade, 'stroke-width': 1.4, opacity: 0.6, 'stroke-linecap': 'round' }),
    // arms (holding the bouquet at the waist)
    path('M390 276C382 300 378 330 380 354C382 372 400 394 426 414L438 402C418 386 404 366 402 350C401 328 404 302 408 286Z', { fill: G.skin }),
    path('M506 276C514 300 518 330 516 354C514 372 496 394 470 414L458 402C478 386 492 366 494 350C495 328 492 302 488 286Z', { fill: G.skin }),
    path('M384 354C390 362 398 364 404 360M512 354C506 362 498 364 492 360', { fill: 'none', stroke: C.skinShade, 'stroke-width': 1.3, opacity: 0.55 }),
    // bodice with sweetheart neckline
    path('M398 282C410 270 436 274 448 288C460 274 486 270 498 282L492 332C486 362 478 390 478 404L418 404C418 390 410 362 404 332Z', { fill: G.bodice }),
    path('M398 282C410 270 436 274 448 288C460 274 486 270 498 282', { fill: 'none', stroke: C.lace, 'stroke-width': 2.2, 'stroke-dasharray': '1 3.2', 'stroke-linecap': 'round' }),
    path('M448 292L448 398M424 300C428 340 432 370 434 398M472 300C468 340 464 370 462 398', { fill: 'none', stroke: C.dressShade, 'stroke-width': 1.4, opacity: 0.7 }),
    // off-shoulder lace sleeves
    path('M386 276C383 290 383 302 387 310L404 306C402 296 402 286 405 278Z', { fill: C.dressMid, stroke: C.lace, 'stroke-width': 0.8 }),
    path('M510 276C513 290 513 302 509 310L492 306C494 296 494 286 491 278Z', { fill: C.dressMid, stroke: C.lace, 'stroke-width': 0.8 }),
    // sash
    path('M416 398L480 398L482 414L414 414Z', { fill: G.sash }),
    path('M418 401L478 401', { stroke: '#fff', 'stroke-width': 1, opacity: 0.5 }),
  ];
  const neck = [
    path('M437 222L459 222L461 252L435 252Z', { fill: G.skin }),
    path('M437 226C444 236 454 236 460 228L461 240C454 246 444 246 436 238Z', { fill: C.skinShade, opacity: 0.8 }),
  ];
  const head = g({ transform: 'rotate(-8 448 230)' }, [
    circle(484, 204, 22, { fill: G.hair }),
    path('M470 196C478 188 492 190 496 200M472 210C482 204 494 208 498 214', { fill: 'none', stroke: C.hairHi, 'stroke-width': 1.4, opacity: 0.7 }),
    path('M416 184C416 157 432 145 450 145C468 145 481 158 481 182C481 205 470 222 452 228C442 231 433 228 427 220C419 211 416 198 416 184Z', { fill: G.skin }),
    path('M474 160C482 176 480 204 460 224C474 218 481 202 481 182C481 172 478 165 474 160Z', { fill: C.skinShade, opacity: 0.5 }),
    ellipse(431, 196, 8, 4.5, { fill: C.blush, opacity: 0.35 }),
    path('M412 186C406 156 424 130 452 128C480 126 498 146 497 172C497 186 492 198 486 206C488 190 484 172 474 162C462 151 442 150 430 158C421 166 416 176 412 186Z', { fill: G.hair }),
    path('M416 180C409 198 411 216 420 228C416 212 416 196 420 184Z', { fill: C.hair }),
    path('M432 138C448 131 470 134 484 146C468 140 450 140 436 146Z', { fill: C.hairHi, opacity: 0.6 }),
    circle(479, 207, 2.6, { fill: '#ffffff', stroke: C.dressDeep, 'stroke-width': 0.6 }),
    arrange(defs, [
      { kind: 'blossom', x: 474, y: 186, size: 5.5, palette: 'ivory' },
      { kind: 'blossom', x: 486, y: 190, size: 5, palette: 'blush' },
      { kind: 'blossom', x: 496, y: 200, size: 4.5, palette: 'ivory' },
      { kind: 'leaf', x: 480, y: 182, size: 9, rotate: -60, palette: 'sage', layer: -1 },
    ]),
  ]);
  const ribbons = [
    path('M444 446C440 470 436 494 428 522L437 524C442 498 446 472 450 448Z', { fill: G.sash }),
    path('M452 446C458 470 464 496 472 518L463 522C458 498 452 472 448 448Z', { fill: G.sash }),
  ];
  return [
    ellipse(476, 962, 205, 13, { fill: G.shadow }),
    ...veil,
    ...skirt,
    ...lace,
    ...upper,
    ...neck,
    head,
    ...ribbons,
    bouquet(defs),
  ].join('');
}

/** Both figures, bride slightly in front and closer to the groom. */
export function couple(defs) {
  return groom(defs) + g({ transform: 'translate(-40 0)' }, bride(defs));
}
