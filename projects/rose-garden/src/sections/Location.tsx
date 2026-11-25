import { Reveal, TiltCard, googleMapsUrl, useWedding, wazeUrl, type CSSVars } from '@wedding/core';
import { art } from '../art';
import { OrnateFrame, OrnateLink, SectionTitle } from '../components/Ornate';

export function Location() {
  const { config, fmt } = useWedding();
  const venue = config.venue;
  return (
    <section id="location" className="section location" aria-labelledby="location-title">
      <SectionTitle kicker="Find your way" title="The Venue" id="location-title" />
      <div className="location__grid">
        <Reveal variant="left">
          <TiltCard className="mapcard" max={8}>
            <img className="mapcard__map" src={art.map} alt={`Illustrated map to ${venue.name}`} />
            <span className="mapcard__label wk-z" style={{ '--z': '40px' } as CSSVars}>
              {venue.name}
            </span>
            <span className="mapcard__you wk-z" style={{ '--z': '24px' } as CSSVars}>
              You are here
            </span>
          </TiltCard>
        </Reveal>
        <Reveal variant="right" delay={120}>
          <OrnateFrame className="venue">
            <p className="venue__kicker">{fmt.date(config.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h3 className="venue__name">{venue.name}</h3>
            <p className="venue__address">{venue.address}</p>
            {venue.notes && <p className="venue__notes">{venue.notes}</p>}
            <div className="venue__actions">
              <OrnateLink icon="pin" variant="wine" href={googleMapsUrl(venue)}>
                Google Maps
              </OrnateLink>
              <OrnateLink icon="navigate" variant="ivory" href={wazeUrl(venue)}>
                Waze
              </OrnateLink>
            </div>
          </OrnateFrame>
        </Reveal>
      </div>
    </section>
  );
}
