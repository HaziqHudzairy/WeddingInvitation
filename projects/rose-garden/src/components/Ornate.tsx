import { useMemo, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { Icon, Reveal, cx, seeded, type CSSVars, type IconName } from '@wedding/core';
import { art } from '../art';

/* ------------------------------------------------------------------ */
/* Ornate frame: clean glass panel + gold filigree corners + crest     */
/* ------------------------------------------------------------------ */

export interface OrnateFrameProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  as?: ElementType;
  crest?: boolean;
  tone?: 'ivory' | 'wine';
  style?: CSSVars;
  children?: ReactNode;
}

export function OrnateFrame({ as: Tag = 'div', crest, tone = 'ivory', className, children, ...rest }: OrnateFrameProps) {
  return (
    <Tag className={cx('ornate', `ornate--${tone}`, crest && 'ornate--crest', className)} {...rest}>
      <span className="ornate__rule" aria-hidden="true" />
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <img key={c} className={`ornate__corner ornate__corner--${c}`} src={art.filigree} alt="" aria-hidden="true" />
      ))}
      {crest && <img className="ornate__crest" src={art.crest} alt="" aria-hidden="true" />}
      <div className="ornate__body">{children}</div>
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Section title: script kicker, engraved caps, gold divider           */
/* ------------------------------------------------------------------ */

export function SectionTitle({ kicker, title, tone = 'ink', id }: { kicker?: string; title: string; tone?: 'ink' | 'light'; id?: string }) {
  return (
    <Reveal as="header" variant="zoom" className={cx('stitle', tone === 'light' && 'stitle--light')}>
      {kicker && <p className="stitle__kicker">{kicker}</p>}
      <h2 className="stitle__title" id={id}>
        <span className="stitle__gem" aria-hidden="true" />
        {title}
        <span className="stitle__gem" aria-hidden="true" />
      </h2>
      <img className="stitle__divider" src={art.divider} alt="" aria-hidden="true" />
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons: pill with gold rim and an icon medallion                   */
/* ------------------------------------------------------------------ */

type Variant = 'ivory' | 'wine' | 'ghost';

interface CommonButtonProps {
  icon?: IconName;
  variant?: Variant;
  children: ReactNode;
}

export function OrnateButton({ icon, variant = 'ivory', className, children, ...rest }: CommonButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cx('obtn', `obtn--${variant}`, className)} {...rest}>
      {icon && (
        <span className="obtn__icon">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="obtn__label">{children}</span>
    </button>
  );
}

export function OrnateLink({ icon, variant = 'ivory', className, children, ...rest }: CommonButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx('obtn', `obtn--${variant}`, className)} target="_blank" rel="noreferrer" {...rest}>
      {icon && (
        <span className="obtn__icon">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="obtn__label">{children}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Falling petals                                                      */
/* ------------------------------------------------------------------ */

export function Petals({ count = 12, seed = 7, className }: { count?: number; seed?: number; className?: string }) {
  const petals = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      src: art.petals[i % art.petals.length],
      x: rnd() * 100,
      size: 12 + rnd() * 18,
      dur: 12 + rnd() * 12,
      delay: -rnd() * 24,
      sway: 18 + rnd() * 46,
      spin: rnd() > 0.5 ? 1 : -1,
      blur: rnd() > 0.8,
    }));
  }, [count, seed]);
  return (
    <div className={cx('petals', className)} aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className={cx('petal', p.blur && 'petal--soft')}
          style={{ '--x': `${p.x}%`, '--s': `${p.size}px`, '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, '--sway': `${p.sway}px`, '--spin': p.spin } as CSSVars}
        >
          <img src={p.src} alt="" />
        </span>
      ))}
    </div>
  );
}

/** Gold divider image. */
export function Divider({ className }: { className?: string }) {
  return <img className={cx('divider', className)} src={art.divider} alt="" aria-hidden="true" />;
}
