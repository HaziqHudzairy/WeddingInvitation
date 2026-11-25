import { Icon, ParallaxLayer, ParallaxScene, cx, useGate, useWedding } from '@wedding/core';
import { art } from '../art';
import { Petals } from '../components/Ornate';

/**
 * Pop-up diorama: garden, arch, couple, bushes and foreground roses on separate
 * layers. They shift with the pointer / phone tilt, and while scrolling the camera
 * zooms through the arch into the rest of the invitation.
 */
export function Hero() {
  const { config, fmt } = useWedding();
  const { state } = useGate();
  const { partnerA, partnerB } = config.couple;
  const p = fmt.parts(config.date);

  return (
    <ParallaxScene id="home" className={cx('hero', state !== 'closed' && 'is-awake')} scrollLength="230vh" aria-label="Welcome">
      <div className="hero__sky" aria-hidden="true" />
      <ParallaxLayer depth={0.06} zoom={0.25} className="hero__sun" aria-hidden="true">
        <div />
        <img className="hero__sigil" src={art.sigil} alt="" />
      </ParallaxLayer>
      <ParallaxLayer depth={0.14} zoom={0.35} className="hero__garden" aria-hidden="true">
        <img src={art.garden} alt="" />
      </ParallaxLayer>
      <ParallaxLayer depth={0.3} zoom={1.1} className="hero__arch" aria-hidden="true">
        <div className="hero__halo" />
        <img src={art.arch} alt="" />
      </ParallaxLayer>
      <ParallaxLayer depth={0.46} zoom={1.25} className="hero__couple">
        <img src={art.couple} alt={`Illustration of ${partnerA.firstName} and ${partnerB.firstName} in wedding attire`} />
      </ParallaxLayer>
      <ParallaxLayer depth={0.72} zoom={1.5} drift={-0.32} className="hero__bush hero__bush--l" aria-hidden="true">
        <img src={art.bushLeft} alt="" />
      </ParallaxLayer>
      <ParallaxLayer depth={0.72} zoom={1.5} drift={0.32} className="hero__bush hero__bush--r" aria-hidden="true">
        <img src={art.bushRight} alt="" />
      </ParallaxLayer>
      <ParallaxLayer depth={1.05} zoom={2.4} drift={-0.55} fade={1.4} className="hero__fg hero__fg--l" aria-hidden="true">
        <img src={art.foregroundLeft} alt="" />
      </ParallaxLayer>
      <ParallaxLayer depth={1.05} zoom={2.4} drift={0.55} fade={1.4} className="hero__fg hero__fg--r" aria-hidden="true">
        <img src={art.foregroundRight} alt="" />
      </ParallaxLayer>
      <ParallaxLayer depth={1.4} zoom={1.2} className="hero__petals" aria-hidden="true">
        <Petals count={14} seed={11} />
      </ParallaxLayer>

      <ParallaxLayer depth={-0.2} lift={-0.35} fade={3.2} className="hero__title">
        <p className="hero__kicker">The Wedding of</p>
        <h1 className="hero__names">
          <span className="hero__name">{partnerA.firstName}</span>
          <span className="hero__amp">&amp;</span>
          <span className="hero__name">{partnerB.firstName}</span>
        </h1>
        <p className="hero__date">
          <span>{p.weekday}</span>
          <b>
            {p.day} {p.month} {p.year}
          </b>
          <span>{config.venue.name}</span>
        </p>
      </ParallaxLayer>

      <div className="hero__veil" aria-hidden="true" />
      <a className="hero__cue" href="#invitation">
        <span>Scroll</span>
        <Icon name="chevron-down" size={18} />
      </a>
    </ParallaxScene>
  );
}
