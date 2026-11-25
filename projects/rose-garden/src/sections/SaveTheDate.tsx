import { Reveal, downloadIcs, googleCalendarUrl, useCountdown, useWedding, type CalendarEvent } from '@wedding/core';
import { art } from '../art';
import { OrnateButton, OrnateLink } from '../components/Ornate';

export function SaveTheDate() {
  const { config, fmt } = useWedding();
  const t = useCountdown(config.date);
  const last = config.events[config.events.length - 1];
  const calendarEvent: CalendarEvent = {
    title: `Wedding of ${config.couple.partnerA.firstName} & ${config.couple.partnerB.firstName}`,
    start: config.events[0]?.start ?? config.date,
    end: last?.end,
    description: config.invitation?.message,
    location: `${config.venue.name}, ${config.venue.address}`,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
  const tiles: Array<[number, string]> = [
    [t.days, 'Days'],
    [t.hours, 'Hours'],
    [t.minutes, 'Minutes'],
    [t.seconds, 'Seconds'],
  ];

  return (
    <section id="date" className="section savedate" aria-labelledby="date-title">
      <img className="savedate__garland savedate__garland--top" src={art.garlandBottom} alt="" aria-hidden="true" />
      <div className="savedate__pattern" aria-hidden="true" />
      <div className="savedate__inner">
        <Reveal as="p" variant="zoom" className="savedate__kicker">
          Save the Date
        </Reveal>
        <Reveal as="h2" variant="up" className="savedate__date" id="date-title">
          {fmt.date(config.date)}
        </Reveal>
        <Reveal variant="flip" className="countdown" role="timer" aria-label={t.isPast ? 'The celebration has begun' : `${t.days} days to go`}>
          {t.isPast ? (
            <p className="countdown__done">Today is the day — thank you for celebrating with us!</p>
          ) : (
            tiles.map(([value, label]) => (
              <div key={label} className="countdown__tile">
                <span className="countdown__num" key={value}>
                  {String(value).padStart(2, '0')}
                </span>
                <span className="countdown__label">{label}</span>
              </div>
            ))
          )}
        </Reveal>
        <div className="savedate__actions">
          <OrnateLink icon="calendar" variant="ivory" href={googleCalendarUrl(calendarEvent)}>
            Google Calendar
          </OrnateLink>
          <OrnateButton icon="download" variant="ghost" onClick={() => downloadIcs(calendarEvent, `${config.id}.ics`)}>
            Apple / Outlook
          </OrnateButton>
        </div>
      </div>
      <img className="savedate__garland savedate__garland--bottom" src={art.garlandTop} alt="" aria-hidden="true" />
    </section>
  );
}
