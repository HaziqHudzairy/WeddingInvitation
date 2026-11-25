import { CardDeck, Icon, Reveal, downloadIcs, googleMapsUrl, toRoman, useWedding, type WeddingEvent } from '@wedding/core';
import { art } from '../art';
import { SectionTitle } from '../components/Ornate';

function EventCard({ event, index, total }: { event: WeddingEvent; index: number; total: number }) {
  const { config, fmt } = useWedding();
  const venue = event.venue ?? config.venue;
  const couple = `${config.couple.partnerA.firstName} & ${config.couple.partnerB.firstName}`;
  return (
    <article className="ecard">
      <div className="ecard__inner">
        <img className="ecard__garland" src={art.garlandTop} alt="" aria-hidden="true" />
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <img key={c} className={`ecard__corner ecard__corner--${c}`} src={art.filigree} alt="" aria-hidden="true" />
        ))}
        <span className="ecard__medal" aria-hidden="true">
          <Icon name={event.icon ?? 'sparkle'} size={22} />
        </span>
        <p className="ecard__num">
          {toRoman(index + 1)} <span>/</span> {toRoman(total)}
        </p>
        <h3 className="ecard__title">{event.title}</h3>
        {event.subtitle && <p className="ecard__subtitle">{event.subtitle}</p>}
        <img className="ecard__divider" src={art.divider} alt="" aria-hidden="true" />
        <dl className="ecard__meta">
          <div>
            <dt>
              <Icon name="calendar" size={16} title="Date" />
            </dt>
            <dd>{fmt.date(event.start, { weekday: 'long', day: 'numeric', month: 'long' })}</dd>
          </div>
          <div>
            <dt>
              <Icon name="clock" size={16} title="Time" />
            </dt>
            <dd>{fmt.timeRange(event.start, event.end)}</dd>
          </div>
          <div>
            <dt>
              <Icon name="pin" size={16} title="Place" />
            </dt>
            <dd>{venue.name}</dd>
          </div>
        </dl>
        {event.description && <p className="ecard__desc">{event.description}</p>}
        <div className="ecard__actions">
          <a className="ecard__btn" href={googleMapsUrl(venue)} target="_blank" rel="noreferrer">
            <Icon name="navigate" size={15} /> Directions
          </a>
          <button
            type="button"
            className="ecard__btn"
            onClick={() =>
              downloadIcs(
                {
                  title: `${event.title} · ${couple}`,
                  start: event.start,
                  end: event.end,
                  description: event.description,
                  location: `${venue.name}, ${venue.address}`,
                  url: window.location.href,
                },
                `${config.id}-${event.id}.ics`,
              )
            }
          >
            <Icon name="calendar" size={15} /> Save
          </button>
        </div>
      </div>
    </article>
  );
}

export function Events() {
  const { config } = useWedding();
  const events = config.events;
  return (
    <section id="events" className="section events" aria-labelledby="events-title">
      <SectionTitle kicker="Order of the day" title="The Celebration" id="events-title" />
      <Reveal variant="flip" className="events__deck-wrap">
        <CardDeck
          className="events__deck"
          label="Wedding events"
          itemLabels={events.map((e) => e.title)}
          items={events.map((e, i) => (
            <EventCard key={e.id} event={e} index={i} total={events.length} />
          ))}
          prevIcon={<Icon name="chevron-left" size={20} />}
          nextIcon={<Icon name="chevron-right" size={20} />}
        />
        <p className="events__hint">Tap a card, swipe, or use the arrows to fan through the day.</p>
      </Reveal>
    </section>
  );
}
