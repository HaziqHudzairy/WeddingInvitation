export interface CalendarEvent {
  title: string;
  /** ISO date-time with offset. */
  start: string;
  /** Defaults to start + 2 hours. */
  end?: string;
  description?: string;
  location?: string;
  url?: string;
  uid?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 2027-07-25T17:00:00+08:00 -> 20270725T090000Z */
export function toUtcStamp(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function endOf(event: CalendarEvent): string {
  return event.end ?? new Date(new Date(event.start).getTime() + 2 * 3600_000).toISOString();
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(endOf(event))}`,
    details: [event.description, event.url].filter(Boolean).join('\n\n'),
    location: event.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: new Date(event.start).toISOString(),
    enddt: new Date(endOf(event)).toISOString(),
    body: event.description ?? '',
    location: event.location ?? '',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

const escapeIcs = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

/** Folds lines longer than 75 characters as required by RFC 5545. */
const fold = (line: string) => {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += 74) chunks.push((i ? ' ' : '') + line.slice(i, i + 74));
  return chunks.join('\r\n');
};

export function buildIcs(events: CalendarEvent | CalendarEvent[], productName = 'Wedding Invitation'): string {
  const list = Array.isArray(events) ? events : [events];
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${productName}//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const ev of list) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid ?? `${toUtcStamp(ev.start)}-${Math.random().toString(36).slice(2)}@wedding`}`,
      `DTSTAMP:${toUtcStamp(new Date())}`,
      `DTSTART:${toUtcStamp(ev.start)}`,
      `DTEND:${toUtcStamp(endOf(ev))}`,
      `SUMMARY:${escapeIcs(ev.title)}`,
    );
    if (ev.description) lines.push(`DESCRIPTION:${escapeIcs(ev.description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeIcs(ev.location)}`);
    if (ev.url) lines.push(`URL:${ev.url}`);
    lines.push('BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcs(ev.title)}`, 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n');
}

/** Triggers a download of an .ics file (works with Apple Calendar, Outlook, Google, ...). */
export function downloadIcs(events: CalendarEvent | CalendarEvent[], filename = 'wedding.ics'): void {
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
