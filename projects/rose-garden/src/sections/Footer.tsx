import { Reveal, useWedding } from '@wedding/core';
import { art } from '../art';

export function Footer() {
  const { config, fmt } = useWedding();
  const { partnerA, partnerB, hashtag } = config.couple;
  const p = fmt.parts(config.date);
  return (
    <footer className="footer">
      <img className="footer__garland footer__garland--top" src={art.garlandTop} alt="" aria-hidden="true" />
      <Reveal variant="zoom" className="footer__inner">
        <p className="footer__kicker">{config.closing?.title ?? 'With love'}</p>
        <h2 className="footer__names">
          {partnerA.firstName} <span>&amp;</span> {partnerB.firstName}
        </h2>
        {config.closing?.message && <p className="footer__message">{config.closing.message}</p>}
        {hashtag && <p className="footer__hashtag">{hashtag}</p>}
        <p className="footer__date">
          {p.dayPadded} · {p.monthNumeric} · {p.year}
        </p>
      </Reveal>
      <img className="footer__garland footer__garland--bottom" src={art.garlandBottom} alt="" aria-hidden="true" />
    </footer>
  );
}
