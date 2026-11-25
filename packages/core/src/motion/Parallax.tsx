import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { usePointerParallax, useScrollProgress } from '../hooks';
import { cx, type CSSVars } from '../utils/css';

export interface ParallaxSceneProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * Total scroll length of the scene. The stage stays pinned while the visitor
   * scrolls through it, and `--sp` goes from 0 to 1 (drives zoom / drift / fade).
   */
  scrollLength?: string;
  pointer?: boolean;
  gyro?: boolean;
  stageClassName?: string;
  style?: CSSVars;
  children?: ReactNode;
}

/**
 * A pinned, layered "pop-up diorama". Put `<ParallaxLayer>`s inside: each one moves
 * with the pointer / device tilt by its `depth`, and zooms, drifts or fades with scroll.
 */
export function ParallaxScene({
  scrollLength = '220vh',
  pointer = true,
  gyro = true,
  className,
  stageClassName,
  style,
  children,
  ...rest
}: ParallaxSceneProps) {
  const outer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  usePointerParallax(stage, { enabled: pointer, gyro });
  useScrollProgress(outer, { target: stage });
  return (
    <section ref={outer} className={cx('wk-scene', className)} style={{ height: scrollLength, ...style }} {...rest}>
      <div ref={stage} className={cx('wk-scene__stage', stageClassName)}>
        {children}
      </div>
    </section>
  );
}

export interface ParallaxLayerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Pointer parallax strength. 0 = static background, 1 = foreground. */
  depth?: number;
  /** Extra scale at the end of the scroll (1 = doubles in size). */
  zoom?: number;
  /** Horizontal travel at the end of the scroll, as a fraction of the stage width. */
  drift?: number;
  /** Vertical travel at the end of the scroll, as a fraction of the stage height. */
  lift?: number;
  /** Opacity lost per unit of scroll progress (2 = gone halfway). */
  fade?: number;
  /** Zoom focal point, defaults to `50% 60%`. */
  origin?: string;
  style?: CSSVars;
  children?: ReactNode;
}

export function ParallaxLayer({
  depth = 0,
  zoom = 0,
  drift = 0,
  lift = 0,
  fade = 0,
  origin,
  className,
  style,
  children,
  ...rest
}: ParallaxLayerProps) {
  return (
    <div
      className={cx('wk-layer', className)}
      style={{
        '--d': depth,
        '--zoom': zoom,
        '--drift': drift,
        '--lift': lift,
        '--fade': fade,
        ...(origin ? { '--origin': origin } : null),
        ...style,
      } as CSSVars}
      {...rest}
    >
      {children}
    </div>
  );
}
