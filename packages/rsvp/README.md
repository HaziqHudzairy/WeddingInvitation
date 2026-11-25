# @wedding/rsvp

A design-agnostic RSVP and seat-reservation system. Every invitation design uses the
same logic and backends; only the look changes.

## Pieces

| Piece | What it does |
| --- | --- |
| `useRsvp({ config, adapter })` | Headless logic: form state, validation, seats left per session, submit, edit. |
| `<RsvpForm>` | Default UI built on `useRsvp`. Re-skin with `--rsvp-*` CSS variables. |
| `<RsvpTicket>` | Confirmation "ticket" with the reservation code. Replace via `renderSuccess`. |
| `useWishes(adapter)` / `<WishList>` | Guest wishes (the RSVP message), refreshed after each submit. |
| Adapters | Where responses are stored: `local`, `rest`, `google-sheets`. |

## Config

```ts
const rsvp: RsvpConfig = {
  id: 'johan-sarah',            // storage namespace
  maxGuests: 4,                 // seats per response, incl. the guest
  deadline: '2027-06-25',       // form closes after this day
  codePrefix: 'JS',             // reservation codes look like JS-7KQ2M
  sessions: [                   // optional time slots with capacity
    { id: 'ceremony', label: 'Ceremony & Reception', time: 'From 5:00 pm', capacity: 120 },
    { id: 'reception', label: 'Reception only', time: 'From 7:00 pm', capacity: 220 },
  ],
  fields: { phone: 'required', email: 'hidden', message: 'optional' },
  customFields: [{ id: 'diet', label: 'Dietary needs', type: 'text' }],
  labels: { submit: 'Hantar' }, // any copy, any language
};
```

## Backends

### Local (default for development)
`createLocalAdapter()` keeps responses in the visitor's browser. Use it for design work and demos only.

### Google Sheets (free)
1. Create a Google Sheet → Extensions → Apps Script → paste `backend/google-apps-script/Code.gs`.
2. Edit `SESSIONS` in the script to match your config.
3. Deploy → New deployment → Web app → Execute as **Me**, access **Anyone**.
4. In the project's `.env`: `VITE_RSVP_MODE=sheets` and `VITE_RSVP_SHEETS_URL=<the /exec URL>`.

The sheet becomes your guest list. Capacity is enforced server side with a lock.

### REST / self-hosted
`createRestAdapter({ baseUrl })` talks to any server implementing:

```
POST {baseUrl}/rsvp            body: RsvpSubmission  -> { ok: true, record }
GET  {baseUrl}/availability                         -> { ok: true, availability: { [sessionId]: { reserved, capacity } } }
GET  {baseUrl}/wishes?limit=60                      -> { ok: true, wishes: Wish[] }
errors                                              -> { ok: false, error, code? }
```

`backend/node/server.mjs` is a zero-dependency implementation (JSON file storage, capacity
checks, CSV export). Run it with `npm run rsvp:server` from the repo root and set
`VITE_RSVP_MODE=rest`, `VITE_RSVP_API_URL=http://localhost:8787/api/<wedding-id>`.

### Custom
Implement `RsvpAdapter` (`submit`, optional `getAvailability`, `listWishes`) for Supabase,
Firebase, Airtable, etc.
