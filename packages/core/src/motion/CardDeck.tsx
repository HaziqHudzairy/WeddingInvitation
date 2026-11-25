import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { cx, type CSSVars } from '../utils/css';

export interface CardDeckProps {
  items: ReactNode[];
  initialIndex?: number;
  /** Accessible name of the deck. */
  label: string;
  /** Accessible names for each card (used by the dots). */
  itemLabels?: string[];
  className?: string;
  style?: CSSVars;
  /** Render prev / next buttons and dots. */
  controls?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  /** Custom content for the arrow buttons. */
  prevIcon?: ReactNode;
  nextIcon?: ReactNode;
  onChange?: (index: number) => void;
}

/**
 * A fanned hand of cards. The active card sits in front, the others fan out behind it
 * in 3D. Click a side card, swipe, use the arrows or the keyboard to bring one forward.
 * Tune the look with CSS variables: --deck-w, --deck-h, --deck-spread, --deck-rot, --deck-depth.
 */
export function CardDeck({
  items,
  initialIndex = 0,
  label,
  itemLabels,
  className,
  style,
  controls = true,
  prevLabel = 'Previous card',
  nextLabel = 'Next card',
  prevIcon = '‹',
  nextIcon = '›',
  onChange,
}: CardDeckProps) {
  const n = items.length;
  const [active, setActive] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(0, n - 1)));
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const swiped = useRef(false);

  const go = useCallback(
    (index: number) => {
      const next = ((index % n) + n) % n;
      setActive(next);
      onChange?.(next);
    },
    [n, onChange],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1);
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    swiped.current = false;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swiped.current = true;
      go(active + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <div
      className={cx('wk-deck', className)}
      style={style}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div
        className="wk-deck__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        {items.map((item, i) => {
          let off = i - active;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const isActive = off === 0;
          return (
            <div
              key={i}
              className={cx('wk-deck__card', isActive && 'is-active')}
              style={{ '--off': off, '--abs': Math.abs(off), zIndex: 50 - Math.abs(off) * 2 + (off < 0 ? 1 : 0) } as CSSVars}
              aria-roledescription="slide"
              aria-label={itemLabels?.[i] ?? `${i + 1} / ${n}`}
              aria-hidden={!isActive}
              onClick={() => {
                if (swiped.current) return;
                if (!isActive) go(i);
              }}
            >
              <div className="wk-deck__content" inert={!isActive}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      {controls && n > 1 && (
        <div className="wk-deck__controls">
          <button type="button" className="wk-deck__arrow" onClick={() => go(active - 1)} aria-label={prevLabel}>
            {prevIcon}
          </button>
          <div className="wk-deck__dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cx('wk-deck__dot', i === active && 'is-active')}
                aria-label={itemLabels?.[i] ?? `${i + 1} / ${n}`}
                aria-current={i === active}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button type="button" className="wk-deck__arrow" onClick={() => go(active + 1)} aria-label={nextLabel}>
            {nextIcon}
          </button>
        </div>
      )}
    </div>
  );
}
