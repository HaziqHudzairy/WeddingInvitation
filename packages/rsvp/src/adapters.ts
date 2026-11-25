import { RsvpError, type Availability, type RsvpAdapter, type RsvpRecord, type RsvpSubmission, type Wish } from './types';
import { delay, readJSON, uid, writeJSON } from './utils';

function toWish(r: RsvpRecord): Wish {
  return { id: r.id, name: r.name, message: r.message ?? '', createdAt: r.updatedAt ?? r.createdAt, attendance: r.attendance };
}

/* ------------------------------------------------------------------ */
/* Local (demo / offline)                                              */
/* ------------------------------------------------------------------ */

export interface LocalAdapterOptions {
  /** localStorage key. */
  storageKey?: string;
  /** Example wishes shown under real ones (great for demos). */
  seedWishes?: Array<Omit<Wish, 'id'> & { id?: string }>;
  /** Pretend seats were already taken, per session id. */
  seedReserved?: Record<string, number>;
  /** Simulated network latency in ms. */
  latency?: number;
}

/**
 * Stores responses in the visitor's browser. Perfect for previews and designing,
 * NOT for a real wedding (each guest only sees their own data). Switch to the
 * REST or Google Sheets adapter for production.
 */
export function createLocalAdapter({
  storageKey = 'wedding-rsvp:records',
  seedWishes = [],
  seedReserved = {},
  latency = 650,
}: LocalAdapterOptions = {}): RsvpAdapter {
  const read = () => readJSON<RsvpRecord[]>(storageKey) ?? [];
  return {
    name: 'local',
    async submit(sub: RsvpSubmission) {
      await delay(latency);
      const rows = read();
      const now = new Date().toISOString();
      const index = rows.findIndex((r) => r.code === sub.code);
      const record: RsvpRecord =
        index >= 0
          ? { ...rows[index], ...sub, updatedAt: now }
          : { ...sub, id: uid(), createdAt: now };
      if (index >= 0) rows[index] = record;
      else rows.push(record);
      writeJSON(storageKey, rows);
      return record;
    },
    async getAvailability() {
      await delay(latency / 3);
      const out: Availability = {};
      for (const [id, n] of Object.entries(seedReserved)) out[id] = { reserved: n };
      for (const r of read()) {
        if (r.attendance !== 'yes' || !r.sessionId) continue;
        out[r.sessionId] = { reserved: (out[r.sessionId]?.reserved ?? 0) + r.guests };
      }
      return out;
    },
    async listWishes({ limit = 60 } = {}) {
      await delay(latency / 3);
      const mine = read()
        .filter((r) => r.message?.trim())
        .map(toWish)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const seeds = seedWishes.map((w, i) => ({ ...w, id: w.id ?? `seed-${i}` }));
      return [...mine, ...seeds].slice(0, limit);
    },
  };
}

/* ------------------------------------------------------------------ */
/* REST                                                                */
/* ------------------------------------------------------------------ */

export interface RestAdapterOptions {
  /** e.g. "https://api.example.com/weddings/johan-sarah" */
  baseUrl: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new RsvpError(data?.error ?? `Request failed (${res.status})`, data?.code);
  }
  return data;
}

/**
 * Talks to any HTTP backend implementing:
 *   POST {baseUrl}/rsvp           body: RsvpSubmission   -> { ok, record }
 *   GET  {baseUrl}/availability                          -> { ok, availability }
 *   GET  {baseUrl}/wishes?limit=n                        -> { ok, wishes }
 * A ready-made Node server lives in packages/rsvp/backend/node.
 */
export function createRestAdapter({ baseUrl, headers = {}, fetch: f = globalThis.fetch.bind(globalThis) }: RestAdapterOptions): RsvpAdapter {
  const url = (p: string) => `${baseUrl.replace(/\/$/, '')}${p}`;
  return {
    name: 'rest',
    async submit(sub) {
      const res = await f(url('/rsvp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(sub),
      });
      return (await parse(res)).record as RsvpRecord;
    },
    async getAvailability() {
      const res = await f(url('/availability'), { headers });
      return ((await parse(res)).availability ?? {}) as Availability;
    },
    async listWishes({ limit = 60 } = {}) {
      const res = await f(url(`/wishes?limit=${limit}`), { headers });
      return ((await parse(res)).wishes ?? []) as Wish[];
    },
  };
}

/* ------------------------------------------------------------------ */
/* Google Sheets (Apps Script web app)                                 */
/* ------------------------------------------------------------------ */

export interface GoogleSheetsAdapterOptions {
  /** The deployed Apps Script web app URL (ends with /exec). */
  scriptUrl: string;
  fetch?: typeof fetch;
}

/**
 * Free backend: responses land in a Google Sheet you own.
 * Deploy packages/rsvp/backend/google-apps-script/Code.gs (see the README there).
 * Requests use text/plain so the browser does not need a CORS preflight.
 */
export function createGoogleSheetsAdapter({ scriptUrl, fetch: f = globalThis.fetch.bind(globalThis) }: GoogleSheetsAdapterOptions): RsvpAdapter {
  const get = async (params: Record<string, string>) => {
    const res = await f(`${scriptUrl}?${new URLSearchParams(params).toString()}`, { redirect: 'follow' });
    return parse(res);
  };
  return {
    name: 'google-sheets',
    async submit(sub) {
      const res = await f(scriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submit', data: sub }),
      });
      return (await parse(res)).record as RsvpRecord;
    },
    async getAvailability() {
      return ((await get({ action: 'availability' })).availability ?? {}) as Availability;
    },
    async listWishes({ limit = 60 } = {}) {
      return ((await get({ action: 'wishes', limit: String(limit) })).wishes ?? []) as Wish[];
    },
  };
}
