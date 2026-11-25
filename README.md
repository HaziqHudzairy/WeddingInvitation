# Wedding Invitation Studio

A monorepo for building digital wedding invitations. The root holds the **shared libraries**;
every client invitation is its own small React + Vite site under `projects/`.

```
WeddingInvitation/
├── packages/                 shared libraries (reused by every invitation)
│   ├── core/                 @wedding/core  – config types, date/calendar/map utils, hooks,
│   │                                          3D & parallax motion kit (TiltCard, ParallaxScene,
│   │                                          CardDeck, ZoomGate, Reveal), icons
│   ├── rsvp/                 @wedding/rsvp  – reservation / RSVP template: headless hook,
│   │                                          themeable form + ticket, wishes, backends
│   └── art/                  @wedding/art   – procedural SVG kit: roses, leaves, berries, buds,
│                                              gold filigree, crests, seals, compass, damask
├── projects/                 one folder per client invitation
│   └── rose-garden/          floral theme (Johan & Sarah demo)
└── scripts/                  run.mjs (run a project script), new-project.mjs (scaffold a client)
```

## Quick start

```bash
npm install
npm run dev -- rose-garden        # http://localhost:5173
```

Useful URLs while designing:

| URL | What it does |
| --- | --- |
| `/?to=Aunt%20Mariam` | Personalised cover ("Dear Aunt Mariam") and a pre-filled RSVP name |
| `/?skip` | Skips the cover and opens the invitation directly |
| `/artboard.html` | Gallery of every generated illustration (dev only) |

## A new client

```bash
npm run new -- aina-and-farhan                 # copies projects/rose-garden
npm run new -- aina-and-farhan --from rose-garden
npm install                                    # links the new workspace
npm run dev -- aina-and-farhan
```

Then edit `projects/aina-and-farhan/src/wedding.config.ts` — names, parents, date, time zone,
venue, events, contacts, dress code and the RSVP settings all live there. Change colours in
`src/styles/theme.css` (tokens at the top) and re-generate the art if you change palettes.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev -- <project>` | Dev server |
| `npm run build -- <project>` | Type-check + production build → `projects/<project>/dist` |
| `npm run preview -- <project>` | Serve the production build |
| `npm run art -- <project>` | Re-generate the project's SVG illustrations |
| `npm run typecheck -- <project>` | Type-check only |
| `npm run build:all` | Build every project |
| `npm run new -- <slug>` | Scaffold a new client project |
| `npm run rsvp:server` | Local REST backend for RSVPs (see below) |

With a single project the name can be omitted.

## The Rose Garden theme

- **Zoom-through cover** – a sealed card with garlands and a wax seal. Opening it breaks the seal and
  the camera flies *through* the card into the garden (`ZoomGate`).
- **Pop-up diorama hero** – garden, castles, a rotating gold sigil, an ornate rose arch, the couple,
  rose bushes and foreground roses on separate layers. They move with the mouse or phone tilt, and
  scrolling zooms through the arch into the page (`ParallaxScene` / `ParallaxLayer`).
- **Character-card portraits** – gold-framed cards whose figure, flowers, emblem and name plate sit at
  different 3D depths, tilting toward the pointer with a moving sheen (`TiltCard`).
- **Fanned event deck** – ceremony / golden hour / reception as a hand of cards; tap, swipe or use the
  arrows. Each card has directions and an add-to-calendar button (`CardDeck`).
- Invitation wording styled after a printed card, countdown with Google / Apple / Outlook calendar,
  illustrated venue map with Google Maps and Waze, details cards, RSVP with reservation ticket,
  a wishes garland, contacts with WhatsApp, and a floating ornate dock.
- Respects `prefers-reduced-motion`; mobile-first layout.

### Illustrations

All art is generated as SVG from code (`projects/rose-garden/art/`) using `@wedding/art`, so it is
reproducible and re-colourable:

- `scenes.mjs` – garlands, corner bouquet, bushes, foreground, arch, garden, map, sigil, ornaments
- `people.mjs` – the anonymous bride & groom (hand-drawn paths, generated bouquet and boutonnière)
- `generate.mjs` – writes everything to `src/assets/art/` (and `public/favicon.svg`)

Palettes live in `packages/art/src/palettes.mjs` (`ROSE`, `LEAF`, `BERRY`, `GOLD`). Pass a palette
name or your own object (`{ id, rim, light, mid, dark, deep, core }`) to `rose()`.

## RSVP / reservations

`@wedding/rsvp` is design-agnostic: the same logic, validation and backends serve every theme.
Sessions with seat capacity, max seats per response, a deadline, custom questions, editable
responses (same reservation code), and a guest-wishes feed are built in.
Backends are chosen per project with environment variables (`projects/<p>/.env`, see `.env.example`):

| `VITE_RSVP_MODE` | Storage |
| --- | --- |
| `local` (default) | Visitor's browser — previews only |
| `sheets` | Google Sheet through Apps Script — free, see `packages/rsvp/README.md` |
| `rest` | Any server implementing the REST contract, e.g. `packages/rsvp/backend/node/server.mjs` |

## Deploying

`npm run build -- <project>` produces a static site in `projects/<project>/dist` with relative paths,
so it can be hosted anywhere: Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any sub-folder.
Remember to set the RSVP environment variables in the host before building.
