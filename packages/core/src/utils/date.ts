export interface DateParts {
  weekday: string;
  weekdayShort: string;
  day: string;
  dayPadded: string;
  month: string;
  monthShort: string;
  monthNumeric: string;
  year: string;
}

export interface Formatters {
  /** "Sunday, 25 July 2027" (locale dependent). Pass options to customise. */
  date(iso: string, options?: Intl.DateTimeFormatOptions): string;
  /** "5:00 pm" */
  time(iso: string): string;
  /** "5:00 pm – 6:30 pm" */
  timeRange(start: string, end?: string): string;
  parts(iso: string): DateParts;
}

/** Formatters that always render in the venue's time zone, whatever the guest's device says. */
export function createFormatters(locale: string, timeZone: string, timeFormat: '12h' | '24h' = '12h'): Formatters {
  const cache = new Map<string, Intl.DateTimeFormat>();
  const get = (options: Intl.DateTimeFormatOptions) => {
    const key = JSON.stringify(options);
    let f = cache.get(key);
    if (!f) {
      f = new Intl.DateTimeFormat(locale, { timeZone, ...options });
      cache.set(key, f);
    }
    return f;
  };
  const part = (iso: string, options: Intl.DateTimeFormatOptions, type: Intl.DateTimeFormatPartTypes) =>
    get(options)
      .formatToParts(new Date(iso))
      .find((p) => p.type === type)?.value ?? '';

  const time = (iso: string) => get({ hour: 'numeric', minute: '2-digit', hour12: timeFormat === '12h' }).format(new Date(iso));

  return {
    date: (iso, options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) =>
      get(options).format(new Date(iso)),
    time,
    timeRange: (start, end) => (end ? `${time(start)} – ${time(end)}` : time(start)),
    parts: (iso) => ({
      weekday: part(iso, { weekday: 'long' }, 'weekday'),
      weekdayShort: part(iso, { weekday: 'short' }, 'weekday'),
      day: part(iso, { day: 'numeric' }, 'day'),
      dayPadded: part(iso, { day: '2-digit' }, 'day'),
      month: part(iso, { month: 'long' }, 'month'),
      monthShort: part(iso, { month: 'short' }, 'month'),
      monthNumeric: part(iso, { month: '2-digit' }, 'month'),
      year: part(iso, { year: 'numeric' }, 'year'),
    }),
  };
}

const ROMAN: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(value: number): string {
  let n = Math.floor(value);
  let out = '';
  for (const [v, s] of ROMAN) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}
