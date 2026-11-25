/**
 * Wedding RSVP backend for Google Sheets (free, no server needed).
 *
 * Setup (once per wedding):
 *   1. Create a Google Sheet. Extensions → Apps Script. Paste this file.
 *   2. Edit SESSIONS below (session id → capacity) to match the site config.
 *   3. Deploy → New deployment → type "Web app"
 *        Execute as: Me      Who has access: Anyone
 *   4. Copy the /exec URL into the project's .env:
 *        VITE_RSVP_MODE=sheets
 *        VITE_RSVP_SHEETS_URL=https://script.google.com/macros/s/XXXX/exec
 *   5. After editing this script, deploy a NEW version (Manage deployments → Edit → New version).
 */

const SHEET_NAME = 'RSVP';
/** Session id → seat capacity. Must match `sessions` in the site's RSVP config. */
const SESSIONS = {
  ceremony: 120,
  reception: 220,
};
const MAX_GUESTS = 6;
const HEADERS = ['createdAt', 'updatedAt', 'code', 'name', 'phone', 'email', 'attendance', 'guests', 'sessionId', 'message', 'custom'];

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || '').toLowerCase();
  try {
    if (action === 'availability') return json_({ ok: true, availability: availability_() });
    if (action === 'wishes') {
      const limit = Math.min(200, Number(e.parameter.limit) || 60);
      return json_({ ok: true, wishes: wishes_(limit) });
    }
    return json_({ ok: true, service: 'wedding-rsvp' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sub = sanitize_(body.data || body);
    const sheet = sheet_();
    const rows = rows_(sheet);
    const existingIndex = rows.findIndex((r) => r.code === sub.code);
    const existing = existingIndex >= 0 ? rows[existingIndex] : null;

    if (sub.attendance === 'yes' && sub.sessionId && SESSIONS[sub.sessionId] != null) {
      const taken = availability_(rows)[sub.sessionId].reserved - (existing && existing.attendance === 'yes' && existing.sessionId === sub.sessionId ? Number(existing.guests) : 0);
      const left = SESSIONS[sub.sessionId] - taken;
      if (sub.guests > left) {
        return json_({ ok: false, code: 'capacity', error: left > 0 ? 'Only ' + left + ' seats left in this session.' : 'This session is fully booked.' });
      }
    }

    const now = new Date().toISOString();
    const record = Object.assign({}, sub, {
      id: sub.code,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: existing ? now : '',
    });
    const values = HEADERS.map((h) => (h === 'custom' ? JSON.stringify(record.custom || {}) : record[h] == null ? '' : record[h]));
    if (existing) sheet.getRange(existingIndex + 2, 1, 1, HEADERS.length).setValues([values]);
    else sheet.appendRow(values);
    return json_({ ok: true, record: record });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

function sanitize_(d) {
  const str = (v, max) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, max);
  const out = {
    code: str(d.code, 24),
    name: str(d.name, 80),
    phone: str(d.phone, 24),
    email: str(d.email, 120),
    attendance: d.attendance === 'yes' ? 'yes' : 'no',
    guests: Math.max(0, Math.min(MAX_GUESTS, parseInt(d.guests, 10) || 0)),
    sessionId: str(d.sessionId, 40),
    message: str(d.message, 600),
    custom: typeof d.custom === 'object' && d.custom ? d.custom : {},
  };
  if (!/^[A-Z0-9-]{4,24}$/.test(out.code)) throw new Error('Invalid reservation code.');
  if (out.name.length < 2) throw new Error('Please tell us your name.');
  if (out.attendance === 'no') {
    out.guests = 0;
    out.sessionId = '';
  } else if (out.guests < 1) {
    throw new Error('Please reserve at least one seat.');
  }
  if (out.sessionId && SESSIONS[out.sessionId] == null) throw new Error('Unknown session.');
  return out;
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function rows_(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet
    .getRange(2, 1, last - 1, HEADERS.length)
    .getValues()
    .map((row) => {
      const o = {};
      HEADERS.forEach((h, i) => (o[h] = row[i]));
      return o;
    });
}

function availability_(rows) {
  const list = rows || rows_(sheet_());
  const out = {};
  Object.keys(SESSIONS).forEach((id) => (out[id] = { reserved: 0, capacity: SESSIONS[id] }));
  list.forEach((r) => {
    if (r.attendance === 'yes' && out[r.sessionId]) out[r.sessionId].reserved += Number(r.guests) || 0;
  });
  return out;
}

function wishes_(limit) {
  return rows_(sheet_())
    .filter((r) => String(r.message).trim())
    .map((r) => ({
      id: String(r.code),
      name: String(r.name),
      message: String(r.message),
      attendance: r.attendance,
      createdAt: String(r.updatedAt || r.createdAt),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
