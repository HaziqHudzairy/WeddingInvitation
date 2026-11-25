import { Icon, Reveal, TiltCard, downloadIcs, useWedding } from '@wedding/core';
import { RsvpForm, RsvpTicket } from '@wedding/rsvp';
import { art } from '../art';
import { OrnateFrame, SectionTitle } from '../components/Ornate';
import { rsvpAdapter } from '../rsvp';
import { rsvp } from '../wedding.config';

export function Rsvp({ guest }: { guest: string }) {
  const { config, fmt } = useWedding();
  const couple = `${config.couple.partnerA.firstName} & ${config.couple.partnerB.firstName}`;
  return (
    <section id="rsvp" className="section rsvp-section" aria-labelledby="rsvp-title">
      <SectionTitle kicker="Kindly reply" title="Reserve Your Seat" id="rsvp-title" />
      <Reveal variant="up" className="rsvp-wrap">
        <img className="rsvp-wrap__bouquet rsvp-wrap__bouquet--tl" src={art.cornerBouquet} alt="" aria-hidden="true" />
        <img className="rsvp-wrap__bouquet rsvp-wrap__bouquet--br" src={art.cornerBouquet} alt="" aria-hidden="true" />
        <OrnateFrame className="rsvp-panel" crest>
          <p className="rsvp-panel__intro">
            We have reserved a place for you among the roses. Let us know if you can join us so we can prepare your seat.
          </p>
          {import.meta.env.DEV && rsvpAdapter.name === 'local' && (
            <p className="rsvp-panel__demo">Preview mode · replies are saved in this browser only (see .env.example)</p>
          )}
          <RsvpForm
            config={rsvp}
            adapter={rsvpAdapter}
            defaultName={guest}
            renderSuccess={(record, { edit, labels }) => (
              <TiltCard className="ticket-tilt" max={8}>
                <RsvpTicket record={record} config={rsvp} labels={labels} title={couple} subtitle={fmt.date(config.date)} onEdit={edit}>
                  {record.attendance === 'yes' && (
                    <button
                      type="button"
                      className="ticket-cal"
                      onClick={() =>
                        downloadIcs(
                          {
                            title: `Wedding of ${couple}`,
                            start: config.events[0]?.start ?? config.date,
                            end: config.events[config.events.length - 1]?.end,
                            location: `${config.venue.name}, ${config.venue.address}`,
                            description: `Reservation ${record.code} · ${record.guests} seat(s)`,
                          },
                          `${config.id}.ics`,
                        )
                      }
                    >
                      <Icon name="calendar" size={15} /> Add to calendar
                    </button>
                  )}
                </RsvpTicket>
              </TiltCard>
            )}
          />
        </OrnateFrame>
      </Reveal>
    </section>
  );
}
