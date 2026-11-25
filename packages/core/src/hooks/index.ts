import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import { clamp } from '../utils/css';

/* ------------------------------------------------------------------ */
/* Reduced motion                                                      */
/* ------------------------------------------------------------------ */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(REDUCED_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(REDUCED_QUERY);
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/* Countdown                                                           */
/* ------------------------------------------------------------------ */

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
}

export function breakdown(ms: number): CountdownValue {
  const isPast = ms <= 0;
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalMs: Math.max(0, ms),
    isPast,
  };
}

/** Ticks once per second, aligned to the wall clock. */
export function useCountdown(target: string | number | Date): CountdownValue {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(() => {
        setNow(Date.now());
        schedule();
      }, 1000 - (Date.now() % 1000) + 8);
    };
    schedule();
    return () => window.clearTimeout(id);
  }, []);
  return useMemo(() => breakdown(targetMs - now), [targetMs, now]);
}

/* ------------------------------------------------------------------ */
/* Intersection                                                        */
/* ------------------------------------------------------------------ */

export interface InViewOptions {
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { once = true, rootMargin = '0px', threshold = 0 }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, rootMargin, threshold]);
  return inView;
}

/** Returns the id of the section currently crossing the middle of the viewport. */
export function useActiveSection(ids: string[], rootMargin = '-45% 0px -50% 0px'): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key, rootMargin]);
  return active;
}

/* ------------------------------------------------------------------ */
/* Pointer / gyroscope parallax                                        */
/* ------------------------------------------------------------------ */

export interface PointerParallaxOptions {
  enabled?: boolean;
  /** Use the phone's gyroscope where available. */
  gyro?: boolean;
  /** 0..1, lower is smoother. */
  smoothing?: number;
}

/**
 * Writes `--px` and `--py` (-1..1, smoothed) on the element so CSS layers can
 * translate by depth. Mouse on desktop, device tilt on phones.
 */
export function usePointerParallax<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { enabled = true, gyro = true, smoothing = 0.07 }: PointerParallaxOptions = {},
): void {
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || reduced) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let betaBase: number | null = null;

    const loop = () => {
      x += (tx - x) * smoothing;
      y += (ty - y) * smoothing;
      el.style.setProperty('--px', x.toFixed(4));
      el.style.setProperty('--py', y.toFixed(4));
      raf = Math.abs(tx - x) > 0.0005 || Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      tx = 0;
      ty = 0;
      kick();
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      if (betaBase == null) betaBase = e.beta;
      tx = clamp(e.gamma / 22, -1, 1);
      ty = clamp((e.beta - betaBase) / 22, -1, 1);
      kick();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('mouseout', onOut);
    if (gyro) window.addEventListener('deviceorientation', onOrient);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mouseout', onOut);
      window.removeEventListener('deviceorientation', onOrient);
      cancelAnimationFrame(raf);
    };
  }, [ref, enabled, gyro, smoothing, reduced]);
}

/**
 * iOS needs an explicit permission prompt for the gyroscope, and it must be
 * triggered from a user gesture (e.g. the "Open invitation" button).
 */
export async function requestMotionPermission(): Promise<boolean> {
  const D = (typeof window !== 'undefined' ? window.DeviceOrientationEvent : undefined) as
    | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> })
    | undefined;
  if (D && typeof D.requestPermission === 'function') {
    try {
      return (await D.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Scroll progress                                                     */
/* ------------------------------------------------------------------ */

export interface ScrollProgressOptions {
  /** Element that receives the CSS variable (defaults to the measured element). */
  target?: RefObject<HTMLElement | null>;
  varName?: string;
  /**
   * `sticky`: 0 when the element's top hits the viewport top, 1 when its bottom hits the viewport bottom.
   * `view`: 0 when the element enters from below, 1 when it leaves at the top.
   */
  mode?: 'sticky' | 'view';
  enabled?: boolean;
}

export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { target, varName = '--sp', mode = 'sticky', enabled = true }: ScrollProgressOptions = {},
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const out = target?.current ?? el;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p =
        mode === 'sticky' ? clamp(-r.top / Math.max(1, r.height - vh)) : clamp((vh - r.top) / (vh + r.height));
      out.style.setProperty(varName, p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, target, varName, mode, enabled]);
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

/** Personalised greeting from the link, e.g. `?to=Aunt%20Mary`. */
export function useGuestName(param = 'to'): string {
  return useMemo(() => {
    if (typeof window === 'undefined') return '';
    const raw = new URLSearchParams(window.location.search).get(param) ?? '';
    return raw.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  }, [param]);
}

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, [locked]);
}

/** Simple boolean toggle helper. */
export function useToggle(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}
