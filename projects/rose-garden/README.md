# Rose Garden

Floral invitation theme — soft white, blush pink, rose red and sage green with antique gold
"fantasy" framing. Demo couple: Johan & Sarah, Sunday 25 July 2027.

## Customise

| What | Where |
| --- | --- |
| Names, date, venue, events, contacts, notes | `src/wedding.config.ts` |
| RSVP sessions, seats, deadline, fields | `rsvp` export in `src/wedding.config.ts` |
| RSVP backend | `.env` (copy `.env.example`) |
| Colours, fonts, spacing | tokens at the top of `src/styles/theme.css` |
| Section layout & styling | `src/sections/*.tsx`, `src/styles/sections.css` |
| Illustrations | `art/*.mjs` → `npm run art -- rose-garden` |
| Page title / social preview text | `index.html` |

Sections are plain components composed in `src/App.tsx` — remove or reorder them freely.

## Art pipeline

```bash
npm run art -- rose-garden          # regenerate every SVG
node art/generate.mjs arch          # (from this folder) regenerate only names containing "arch"
```

Open `/artboard.html` on the dev server to review all generated pieces at once.
