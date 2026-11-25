import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion, useScrollLock } from '../hooks';
import { cx, type CSSVars } from '../utils/css';

export type GateState = 'closed' | 'opening' | 'open';

export interface GateApi {
  state: GateState;
  open: () => void;
}

const GateContext = createContext<GateApi>({ state: 'open', open: () => {} });

/** Lets any component know whether the invitation has been opened yet. */
export const useGate = () => useContext(GateContext);

export interface ZoomGateProps {
  /** The closed invitation (envelope / cover card). Receives the gate api. */
  cover: ReactNode | ((api: GateApi) => ReactNode);
  children: ReactNode;
  /** Length of the zoom-through in ms. */
  duration?: number;
  /** How far the cover is scaled while flying past the camera. */
  zoom?: number;
  /** Focal point of the zoom on the cover, e.g. where the seal is. */
  origin?: string;
  /** Starting scale of the page behind the cover; it settles to 1. */
  worldScale?: number;
  /** Skip the cover entirely (e.g. `?skip=1`). */
  skip?: boolean;
  /** Called synchronously inside the click, so it may start audio or ask for gyro permission. */
  onOpen?: () => void;
  className?: string;
}

/**
 * Shows a cover over the page. When opened, the camera "flies through" the cover:
 * the cover scales up and fades while the page behind settles from `worldScale` to 1.
 */
export function ZoomGate({
  cover,
  children,
  duration = 1700,
  zoom = 5,
  origin = '50% 50%',
  worldScale = 1.3,
  skip = false,
  onOpen,
  className,
}: ZoomGateProps) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<GateState>(skip ? 'open' : 'closed');
  const stateRef = useRef(state);
  const onOpenRef = useRef(onOpen);
  const timer = useRef(0);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useScrollLock(state !== 'open');

  const dur = reduced ? 450 : duration;

  const open = useCallback(() => {
    if (stateRef.current !== 'closed') return;
    stateRef.current = 'opening';
    onOpenRef.current?.();
    window.scrollTo(0, 0);
    setState('opening');
    timer.current = window.setTimeout(() => {
      stateRef.current = 'open';
      setState('open');
    }, dur);
  }, [dur]);

  const api = useMemo<GateApi>(() => ({ state, open }), [state, open]);

  return (
    <GateContext.Provider value={api}>
      <div className="wk-gate-root">
        <div
          className={cx('wk-gate-world', `is-${state}`)}
          style={{ '--wk-gate-dur': `${dur}ms`, '--wk-world-scale': worldScale } as CSSVars}
        >
          {children}
        </div>
      </div>
      {state !== 'open' && (
        <div
          className={cx('wk-gate', `is-${state}`, reduced && 'is-reduced', className)}
          style={{ '--wk-gate-dur': `${dur}ms`, '--wk-gate-zoom': zoom, '--wk-gate-origin': origin } as CSSVars}
          role="dialog"
          aria-modal="true"
          aria-label="Invitation cover"
        >
          {typeof cover === 'function' ? cover(api) : cover}
        </div>
      )}
    </GateContext.Provider>
  );
}
