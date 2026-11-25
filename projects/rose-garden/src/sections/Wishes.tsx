import { Icon, Reveal, cx, type CSSVars } from '@wedding/core';
import { useWishes } from '@wedding/rsvp';
import { SectionTitle } from '../components/Ornate';
import { rsvpAdapter } from '../rsvp';

/** Guest wishes on overlapping letter cards drifting past like a garland. */
export function Wishes() {
  const { wishes, loading } = useWishes(rsvpAdapter, { limit: 40 });
  const loop = wishes.length >= 4;
  const list = loop ? [...wishes, ...wishes] : wishes;
  return (
    <section id="wishes" className="section wishes" aria-labelledby="wishes-title">
      <SectionTitle kicker="Love notes" title="Wishes" id="wishes-title" />
      {loading ? (
        <p className="wishes__empty">Gathering wishes…</p>
      ) : wishes.length === 0 ? (
        <p className="wishes__empty">Be the first to leave a wish with your reply.</p>
      ) : (
        <Reveal variant="fade" className={cx('wishes__viewport', loop && 'is-looping')}>
          <ul className="wishes__track" style={{ '--count': wishes.length } as CSSVars}>
            {list.map((w, i) => (
              <li key={`${w.id}-${i}`} className="wish" aria-hidden={i >= wishes.length ? true : undefined} style={{ '--r': `${(i % 3) - 1}deg` } as CSSVars}>
                <Icon name="quote" size={22} className="wish__quote" />
                <p className="wish__message">{w.message}</p>
                <p className="wish__name">{w.name}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
      <p className="wishes__cta">
        <a href="#rsvp">Leave your wish with your reply</a>
      </p>
    </section>
  );
}
