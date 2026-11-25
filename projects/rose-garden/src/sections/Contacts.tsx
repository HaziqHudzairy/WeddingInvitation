import { Reveal, telUrl, useWedding, whatsappUrl } from '@wedding/core';
import { OrnateFrame, OrnateLink, SectionTitle } from '../components/Ornate';

export function Contacts() {
  const { config } = useWedding();
  const contacts = config.contacts ?? [];
  if (!contacts.length) return null;
  const couple = `${config.couple.partnerA.firstName} & ${config.couple.partnerB.firstName}`;
  return (
    <section id="contact" className="section contacts" aria-labelledby="contact-title">
      <SectionTitle kicker="Any questions?" title="Get in Touch" id="contact-title" />
      <div className="contacts__row">
        {contacts.map((c, i) => (
          <Reveal key={c.name} variant="up" delay={i * 120}>
            <OrnateFrame className="contact">
              {c.role && <p className="contact__role">{c.role}</p>}
              <h3 className="contact__name">{c.name}</h3>
              {c.phone && (
                <div className="contact__actions">
                  {c.whatsapp !== false && (
                    <OrnateLink icon="whatsapp" variant="wine" href={whatsappUrl(c.phone, `Hi ${c.name}! I have a question about ${couple}'s wedding.`)}>
                      WhatsApp
                    </OrnateLink>
                  )}
                  <OrnateLink icon="phone" variant="ivory" href={telUrl(c.phone)} target="_self">
                    Call
                  </OrnateLink>
                </div>
              )}
            </OrnateFrame>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
