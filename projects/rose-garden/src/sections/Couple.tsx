import { Icon, Reveal, TiltCard, cx, useWedding, type CSSVars, type IconName, type Person } from '@wedding/core';
import { art } from '../art';
import { SectionTitle } from '../components/Ornate';

interface PortraitCardProps {
  person: Person;
  figure: string;
  tone: 'sage' | 'blush';
  emblem: IconName;
  side: 'left' | 'right';
}

/**
 * Character-card style portrait: gold frame, layered art that pops out of the
 * frame in 3D (background → arch → figure → flowers → name plate).
 */
function PortraitCard({ person, figure, tone, emblem, side }: PortraitCardProps) {
  return (
    <TiltCard className={cx('pcard', `pcard--${tone}`, `pcard--${side}`)} max={11} lift={1.04} sway>
      <div className="pcard__frame" aria-hidden="true" />
      <div className="pcard__bg" aria-hidden="true">
        <span className="pcard__rays" />
      </div>
      <img className="pcard__arch wk-z" style={{ '--z': '14px' } as CSSVars} src={art.cardArch} alt="" aria-hidden="true" />
      <img className="pcard__figure wk-z" style={{ '--z': '30px' } as CSSVars} src={figure} alt={`Illustration of ${person.firstName}`} />
      {/* bouquet pops out of the outer top corner; the emblem sits on the inner corner */}
      <img className="pcard__flowers" style={{ '--z': '78px' } as CSSVars} src={art.cornerBouquet} alt="" aria-hidden="true" />
      <span className="pcard__badge wk-z" style={{ '--z': '40px' } as CSSVars} aria-hidden="true">
        <Icon name={emblem} size={18} />
      </span>
      <div className="pcard__plate wk-z" style={{ '--z': '54px' } as CSSVars}>
        <p className="pcard__role">{person.title}</p>
        <h3 className="pcard__name">{person.fullName ?? person.firstName}</h3>
        <p className="pcard__stars" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} />
          ))}
        </p>
        {person.parents && <p className="pcard__parents">{person.parents}</p>}
      </div>
    </TiltCard>
  );
}

export function Couple() {
  const { config } = useWedding();
  const { partnerA, partnerB } = config.couple;
  return (
    <section id="couple" className="section couple" aria-labelledby="couple-title">
      <SectionTitle kicker="The happy couple" title="Bride & Groom" id="couple-title" />
      <div className="couple__stage">
        <Reveal variant="left" className="couple__slot couple__slot--a">
          <PortraitCard person={partnerA} figure={art.groom} tone="sage" emblem="leaf" side="left" />
          {partnerA.bio && <p className="couple__bio">{partnerA.bio}</p>}
        </Reveal>
        <Reveal variant="zoom" delay={250} className="couple__amp" aria-hidden="true">
          <span>&amp;</span>
        </Reveal>
        <Reveal variant="right" delay={120} className="couple__slot couple__slot--b">
          <PortraitCard person={partnerB} figure={art.bride} tone="blush" emblem="rose" side="right" />
          {partnerB.bio && <p className="couple__bio">{partnerB.bio}</p>}
        </Reveal>
      </div>
    </section>
  );
}
