#!/usr/bin/env node
/**
 * Minimal self-hosted RSVP backend implementing the REST adapter contract.
 * Zero dependencies — responses are stored in a JSON file per wedding.
 *
 *   npm run rsvp:server                       (from the repo root)
 *   PORT=8787 RSVP_CAPACITY='{"ceremony":120,"reception":220}' node server.mjs
 *
 * Routes (each wedding is namespaced by its id):
 *   POST /api/:wedding/rsvp
 *   GET  /api/:wedding/availability
 *   GET  /api/:wedding/wishes?limit=60
 *   GET  /api/:wedding/export.csv          (requires ?key=ADMIN_KEY when ADMIN_KEY is set)
 *
 * Site .env:  VITE_RSVP_MODE=rest   VITE_RSVP_API_URL=http://localhost:8787/api/<wedding-id>
 */
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 8787);
const DATA_DIR = process.env.RSVP_DATA_DIR ?? join(dirname(fileURLToPath(import.meta.url)), 'data');
const CAPACITY = JSON.parse(process.env.RSVP_CAPACITY ?? '{"ceremony":120,"reception":220}');
const MAX_GUESTS = Number(process.env.RSVP_MAX_GUESTS ?? 6);
const ALLOWED_ORIGIN = process.env.RSVP_ALLOWED_ORIGIN ?? '*';
const ADMIN_KEY = process.env.ADMIN_KEY ?? '';

mkdirSync(DATA_DIR, { recursive: true });

const fileFor = (wedding) => join(DATA_DIR, `${wedding}.json`);
const load = (wedding) => (existsSync(fileFor(wedding)) ? JSON.parse(readFileSync(fileFor(wedding), 'utf8')) : []);
const save = (wedding, rows) => {
  const tmp = `${fileFor(wedding)}.tmp`;
  writeFileSync(tmp, JSON.stringify(rows, null, 2));
  renameSync(tmp, fileFor(wedding));
};

/* Serialise writes per wedding so two guests can't grab the last seat at once. */
const queues = new Map();
const serial = (key, task) => {
  const next = (queues.get(key) ?? Promise.resolve()).then(task, task);
  queues.set(key, next.catch(() => {}));
  return next;
};

function availability(rows) {
  const out = {};
  for (const [id, capacity] of Object.entries(CAPACITY)) out[id] = { reserved: 0, capacity };
  for (const r of rows) if (r.attendance === 'yes' && out[r.sessionId]) out[r.sessionId].reserved += r.guests;
  return out;
}

function sanitize(d = {}) {
  const str = (v, max) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);
  const out = {
    code: str(d.code, 24),
    name: str(d.name, 80),
    phone: str(d.phone, 24) || undefined,
    email: str(d.email, 120) || undefined,
    attendance: d.attendance === 'yes' ? 'yes' : 'no',
    guests: Math.max(0, Math.min(MAX_GUESTS, Number.parseInt(d.guests, 10) || 0)),
    sessionId: str(d.sessionId, 40) || undefined,
    message: str(d.message, 600) || undefined,
    custom: d.custom && typeof d.custom === 'object' ? d.custom : undefined,
  };
  if (!/^[A-Z0-9-]{4,24}$/.test(out.code)) throw Object.assign(new Error('Invalid reservation code.'), { status: 400 });
  if (out.name.length < 2) throw Object.assign(new Error('Please tell us your name.'), { status: 400 });
  if (out.attendance === 'no') {
    out.guests = 0;
    out.sessionId = undefined;
  } else if (out.guests < 1) {
    throw Object.assign(new Error('Please reserve at least one seat.'), { status: 400 });
  }
  if (out.sessionId && CAPACITY[out.sessionId] == null) throw Object.assign(new Error('Unknown session.'), { status: 400 });
  return out;
}

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 20_000) reject(Object.assign(new Error('Payload too large'), { status: 413 }));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/api\/([a-z0-9-]{1,64})\/(rsvp|availability|wishes|export\.csv)$/);
  if (!match) return send(res, 404, { ok: false, error: 'Not found' });
  const [, wedding, route] = match;

  try {
    if (route === 'rsvp' && req.method === 'POST') {
      const sub = sanitize(JSON.parse((await readBody(req)) || '{}'));
      const record = await serial(wedding, () => {
        const rows = load(wedding);
        const index = rows.findIndex((r) => r.code === sub.code);
        const existing = index >= 0 ? rows[index] : null;
        if (sub.attendance === 'yes' && sub.sessionId) {
          const avail = availability(rows)[sub.sessionId];
          const mine = existing?.attendance === 'yes' && existing.sessionId === sub.sessionId ? existing.guests : 0;
          const left = avail.capacity - (avail.reserved - mine);
          if (sub.guests > left) {
            throw Object.assign(new Error(left > 0 ? `Only ${left} seats left in this session.` : 'This session is fully booked.'), { status: 409, code: 'capacity' });
          }
        }
        const now = new Date().toISOString();
        const rec = existing ? { ...existing, ...sub, updatedAt: now } : { ...sub, id: sub.code, createdAt: now };
        if (existing) rows[index] = rec;
        else rows.push(rec);
        save(wedding, rows);
        return rec;
      });
      return send(res, 200, { ok: true, record });
    }
    if (route === 'availability' && req.method === 'GET') {
      return send(res, 200, { ok: true, availability: availability(load(wedding)) });
    }
    if (route === 'wishes' && req.method === 'GET') {
      const limit = Math.min(200, Number(url.searchParams.get('limit')) || 60);
      const wishes = load(wedding)
        .filter((r) => r.message)
        .map((r) => ({ id: r.id, name: r.name, message: r.message, attendance: r.attendance, createdAt: r.updatedAt ?? r.createdAt }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
      return send(res, 200, { ok: true, wishes });
    }
    if (route === 'export.csv' && req.method === 'GET') {
      if (ADMIN_KEY && url.searchParams.get('key') !== ADMIN_KEY) return send(res, 401, { ok: false, error: 'Unauthorized' });
      const cols = ['createdAt', 'updatedAt', 'code', 'name', 'phone', 'email', 'attendance', 'guests', 'sessionId', 'message'];
      const csv = [cols.join(','), ...load(wedding).map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n');
      return send(res, 200, csv, 'text/csv; charset=utf-8');
    }
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (err) {
    return send(res, err.status ?? 500, { ok: false, error: err.message ?? 'Server error', code: err.code });
  }
});

server.listen(PORT, () => {
  console.log(`RSVP server on http://localhost:${PORT}  (data: ${DATA_DIR})`);
  console.log(`Capacity: ${JSON.stringify(CAPACITY)}  ·  max guests per response: ${MAX_GUESTS}`);
});
