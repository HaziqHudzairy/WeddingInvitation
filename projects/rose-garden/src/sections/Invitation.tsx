import { Reveal, useWedding } from '@wedding/core';
import { art } from '../art';
import { Divider, OrnateFrame } from '../components/Ornate';

/** The classic printed-card wording, framed like the paper invitation. */
export function Invitation() {
  const { config, fmt } = useWedding();
  const { partnerA, partnerB } = config.couple;
  const inv = config.invitation ?? {};
  const p = fmt.parts(config.date);
  const ceremony = config.events[0];

  return (
    <section id="invitation" className="section invitation" aria-labelledby="invitation-title">
      <img className="invitation__float invitation__float--a" src={art.roseBlush} alt="" aria-hidden="true" />
      <img className="invitation__float invitation__float--b" src={art.roseRed} alt="" aria-hidden="true" />
      <img className="invitation__float invitation__float--c" src={art.roseIvory} alt="" aria-hidden="true" />

      <Reveal variant="zoom" className="invitation__wrap">
        <img className="invitation__bouquet invitation__bouquet--tl" src={art.cornerBouquet} alt="" aria-hidden="true" />
        <img className="invitation__bouquet invitation__bouquet--br" src={art.cornerBouquet} alt="" aria-hidden="true" />
        <OrnateFrame className="invitation__card" crest>
          {inv.kicker && <p className="invitation__kicker">{inv.kicker}</p>}
          <h2 className="invitation__names" id="invitation-title">
            {partnerA.firstName} <em>and</em> {partnerB.firstName}
          </h2>
          <Divider className="invitation__divider" />
          {inv.message && <p className="invitation__message">{inv.message}</p>}

          <div className="daterow" aria-label={fmt.date(config.date)}>
            <span className="daterow__side">{p.month}</span>
            <span className="daterow__dot" aria-hidden="true" />
            <span className="daterow__center">
              <small>{p.weekdayShort}</small>
              <b>{p.day}</b>
            </span>
            <span className="daterow__dot" aria-hidden="true" />
            <span className="daterow__side">{p.year}</span>
          </div>

          <p className="invitation__time">{ceremony ? fmt.time(ceremony.start) : fmt.time(config.date)}</p>
          <p className="invitation__venue">{config.venue.name}</p>
          <p className="invitation__address">{config.venue.address}</p>
          <p className="invitation__follow">Reception to Follow</p>

          {inv.hosts?.length ? (
            <div className="invitation__hosts">
              <p className="invitation__hosts-label">Together with their families</p>
              {inv.hosts.map((h) => (
                <p key={h}>{h}</p>
              ))}
            </div>
          ) : null}

          {inv.quote && (
            <blockquote className="invitation__quote">
              <p>“{inv.quote.text}”</p>
              {inv.quote.source && <cite>— {inv.quote.source}</cite>}
            </blockquote>
          )}
        </OrnateFrame>
      </Reveal>
    </section>
  );
}
