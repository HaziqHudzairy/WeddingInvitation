import { useRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { useInView } from '../hooks';
import { cx, type CSSVars } from '../utils/css';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'zoom-out' | 'flip' | 'fade';

export interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  as?: ElementType;
  variant?: RevealVariant;
  /** Delay in ms, handy for staggering siblings. */
  delay?: number;
  once?: boolean;
  style?: CSSVars;
  children?: ReactNode;
}

/** Animates its children in when they scroll into view. */
export function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, once = true, className, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, rootMargin: '0px 0px -8% 0px' });
  return (
    <Tag
      ref={ref}
      className={cx('wk-reveal', `wk-reveal--${variant}`, inView && 'is-in', className)}
      style={{ '--wk-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
