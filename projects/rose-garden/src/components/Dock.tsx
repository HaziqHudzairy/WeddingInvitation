import { Icon, cx, useActiveSection, useGate, type IconName } from '@wedding/core';

/** Each dock item lights up for its own section and the ones that follow it. */
const ITEMS: Array<{ id: string; icon: IconName; label: string; covers: string[] }> = [
  { id: 'home', icon: 'home', label: 'Home', covers: ['home', 'invitation'] },
  { id: 'couple', icon: 'heart', label: 'Couple', covers: ['couple'] },
  { id: 'events', icon: 'calendar', label: 'Events', covers: ['events', 'date'] },
  { id: 'location', icon: 'pin', label: 'Venue', covers: ['location', 'details'] },
  { id: 'rsvp', icon: 'envelope', label: 'RSVP', covers: ['rsvp', 'wishes', 'contact'] },
];
const WATCHED = ITEMS.flatMap((i) => i.covers);

/** Floating ornate navigation dock, shown once the invitation is open. */
export function Dock() {
  const { state } = useGate();
  const section = useActiveSection(WATCHED);
  const active = ITEMS.find((i) => section && i.covers.includes(section))?.id ?? 'home';
  if (state !== 'open') return null;
  return (
    <nav className="dock" aria-label="Invitation sections">
      {ITEMS.map((item) => (
        <a key={item.id} href={`#${item.id}`} className={cx('dock__item', active === item.id && 'is-active')} aria-current={active === item.id ? 'true' : undefined}>
          <span className="dock__icon">
            <Icon name={item.icon} size={19} />
          </span>
          <span className="dock__label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
