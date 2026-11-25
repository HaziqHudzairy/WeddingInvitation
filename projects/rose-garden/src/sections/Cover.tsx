import { Icon, TiltCard, cx, useWedding, type GateApi } from '@wedding/core';
import { art } from '../art';
import { Petals } from '../components/Ornate';

/**
 * The closed invitation. Opening it breaks the wax seal and the camera
 * zooms through the card into the garden diorama (handled by <ZoomGate>).
 */
export function Cover({ api, guest }: { api: GateApi; guest: string }) {
  const { config, fmt } = useWedding();
  const { partnerA, partnerB } = config.couple;
  const p = fmt.parts(config.date);
  const opening = api.state === 'opening';

  return (
    <div className={cx('cover', opening && 'is-opening')}>
      <div className="cover__bg" aria-hidden="true" />
      <Petals count={10} seed={3} className="cover__petals" />

      <TiltCard className="cover__card" max={7} lift={1.02} sway>
        <div className="cover__paper">
          <span className="cover__rule" aria-hidden="true" />
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <img key={c} className={`cover__corner cover__corner--${c}`} src={art.filigree} alt="" aria-hidden="true" />
          ))}
        </div>
        <img className="cover__garland cover__garland--top wk-z" src={art.garlandTop} alt="" aria-hidden="true" />
        <img className="cover__garland cover__garland--bottom wk-z" src={art.garlandBottom} alt="" aria-hidden="true" />

        <div className="cover__content wk-z">
          <p className="cover__kicker">The Wedding of</p>
          <h1 className="cover__names">
            <span>{partnerA.firstName}</span>
            <span className="cover__amp">and</span>
            <span>{partnerB.firstName}</span>
          </h1>
          <img className="cover__divider" src={art.divider} alt="" aria-hidden="true" />
          <p className="cover__date">
            {p.dayPadded} · {p.monthNumeric} · {p.year}
          </p>
          {guest ? (
            <p className="cover__guest">
              <span>Dear</span>
              <strong>{guest}</strong>
            </p>
          ) : (
            <p className="cover__guest cover__guest--generic">
              <span>You are invited</span>
            </p>
          )}
        </div>

        <button type="button" className="cover__seal" onClick={api.open} aria-label="Break the seal and open the invitation">
          <span className="cover__seal-half cover__seal-half--l">
            <img src={art.seal} alt="" />
          </span>
          <span className="cover__seal-half cover__seal-half--r">
            <img src={art.seal} alt="" />
          </span>
          <span className="cover__monogram" aria-hidden="true">
            {partnerA.firstName[0]}
            <i>&amp;</i>
            {partnerB.firstName[0]}
          </span>
        </button>
      </TiltCard>

      <button type="button" className="obtn obtn--wine cover__open" onClick={api.open}>
        <span className="obtn__icon">
          <Icon name="envelope" size={16} />
        </span>
        <span className="obtn__label">Open Invitation</span>
      </button>
    </div>
  );
}
