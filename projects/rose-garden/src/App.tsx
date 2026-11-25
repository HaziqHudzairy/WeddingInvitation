import { WeddingProvider, ZoomGate, requestMotionPermission, useGate, useGuestName } from '@wedding/core';
import { Dock } from './components/Dock';
import { Petals } from './components/Ornate';
import { Contacts } from './sections/Contacts';
import { Couple } from './sections/Couple';
import { Cover } from './sections/Cover';
import { Events } from './sections/Events';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Invitation } from './sections/Invitation';
import { Location } from './sections/Location';
import { Notes } from './sections/Notes';
import { Rsvp } from './sections/Rsvp';
import { SaveTheDate } from './sections/SaveTheDate';
import { Wishes } from './sections/Wishes';
import { wedding } from './wedding.config';

/** Petals drifting behind the content, once the invitation is open. */
function AmbientPetals() {
  const { state } = useGate();
  return state === 'open' ? <Petals count={9} seed={21} className="petals--ambient" /> : null;
}

export default function App() {
  const guest = useGuestName('to');
  // `?skip` jumps straight past the cover (handy while designing).
  const skip = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skip');

  return (
    <WeddingProvider config={wedding}>
      <ZoomGate
        skip={skip}
        zoom={4.5}
        worldScale={1.4}
        origin="50% 62%"
        duration={1800}
        onOpen={() => void requestMotionPermission()}
        cover={(api) => <Cover api={api} guest={guest} />}
      >
        <div className="site">
          <AmbientPetals />
          <Hero />
          <main className="page">
            <Invitation />
            <Couple />
            <Events />
            <SaveTheDate />
            <Location />
            <Notes />
            <Rsvp guest={guest} />
            <Wishes />
            <Contacts />
          </main>
          <Footer />
        </div>
        <Dock />
      </ZoomGate>
    </WeddingProvider>
  );
}
