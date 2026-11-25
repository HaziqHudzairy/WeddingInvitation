import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks';
import { clamp, cx, type CSSVars } from '../utils/css';

export interface TiltCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Maximum rotation in degrees. */
  max?: number;
  /** Scale while hovered. */
  lift?: number;
  perspective?: number;
  /** Moving light sheen that follows the pointer. */
  glare?: boolean;
  /** Gentle idle sway on touch devices (no hover there). */
  sway?: boolean;
  innerClassName?: string;
  style?: CSSVars;
  children?: ReactNode;
}

/**
 * A card that tilts in 3D toward the pointer. Children can pop out of the card by
 * using the `.wk-z` helper class with a `--z` depth, e.g. `style={{ '--z': '60px' }}`.
 */
export function TiltCard({
  max = 9,
  lift = 1.03,
  perspective = 1100,
  glare = true,
  sway = false,
  className,
  innerClassName,
  style,
  children,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  const set = (vars: Record<string, string>) => {
    const el = ref.current;
    if (!el) return;
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  };

  const handleEnter = (e: PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(e);
    if (reduced || e.pointerType === 'touch') return;
    ref.current?.classList.add('is-tilting');
    set({ '--ts': String(lift), '--glare': '1' });
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (reduced || e.pointerType === 'touch') return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = clamp((clientX - r.left) / r.width);
      const y = clamp((clientY - r.top) / r.height);
      set({
        '--ry': `${((x - 0.5) * 2 * max).toFixed(2)}deg`,
        '--rx': `${((0.5 - y) * 2 * max).toFixed(2)}deg`,
        '--gx': `${(x * 100).toFixed(1)}%`,
        '--gy': `${(y * 100).toFixed(1)}%`,
      });
    });
  };

  const handleLeave = (e: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    cancelAnimationFrame(frame.current);
    ref.current?.classList.remove('is-tilting');
    set({ '--rx': '0deg', '--ry': '0deg', '--ts': '1', '--glare': '0' });
  };

  return (
    <div
      ref={ref}
      className={cx('wk-tilt', sway && !reduced && 'wk-tilt--sway', className)}
      style={{ '--wk-perspective': `${perspective}px`, ...style } as CSSVars}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...rest}
    >
      <div className={cx('wk-tilt__inner', innerClassName)}>
        {children}
        {glare && <span className="wk-tilt__glare" aria-hidden="true" />}
      </div>
    </div>
  );
}
