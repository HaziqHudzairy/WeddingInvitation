const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Short, unambiguous reservation code, e.g. "JS-7KQ2M". */
export function makeCode(prefix = 'RSVP', length = 5): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  let code = '';
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `${prefix.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'RSVP'}-${code}`;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) — the RSVP still works */
  }
}

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/** End of the deadline day (or the exact time if one is given) in ms. */
export function deadlineMs(deadline: string): number {
  return /T\d/.test(deadline) ? new Date(deadline).getTime() : new Date(`${deadline}T23:59:59`).getTime();
}

/* A tiny event bus so the wishes wall refreshes after a new RSVP. */
const bus: EventTarget | null = typeof window !== 'undefined' ? new EventTarget() : null;

export function emitRsvpChange(): void {
  bus?.dispatchEvent(new Event('change'));
}

export function onRsvpChange(listener: () => void): () => void {
  bus?.addEventListener('change', listener);
  return () => bus?.removeEventListener('change', listener);
}
