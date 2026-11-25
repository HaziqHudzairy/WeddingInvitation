import { Icon, Reveal, TiltCard, useWedding, type CSSVars } from '@wedding/core';
import { SectionTitle } from '../components/Ornate';

/** Practical details as a row of overlapping, slightly fanned cards. */
export function Notes() {
  const { config } = useWedding();
  const notes = config.notes ?? [];
  if (!notes.length) return null;
  return (
    <section id="details" className="section notes" aria-labelledby="notes-title">
      <SectionTitle kicker="Good to know" title="Little Details" id="notes-title" />
      <div className="notes__row" style={{ '--n': notes.length } as CSSVars}>
        {notes.map((note, i) => (
          <Reveal
            key={note.id}
            variant="flip"
            delay={i * 140}
            className="notes__slot"
            style={{ '--i': i - (notes.length - 1) / 2, '--ai': Math.abs(i - (notes.length - 1) / 2) } as CSSVars}
          >
            <TiltCard className="note" max={10} lift={1.05}>
              <span className="note__icon" aria-hidden="true">
                <Icon name={note.icon ?? 'sparkle'} size={22} />
              </span>
              <h3 className="note__title">{note.title}</h3>
              <p className="note__body">{note.body}</p>
              {note.swatches && (
                <ul className="note__swatches" aria-label="Suggested colours">
                  {note.swatches.map((c) => (
                    <li key={c} style={{ background: c }} />
                  ))}
                </ul>
              )}
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
