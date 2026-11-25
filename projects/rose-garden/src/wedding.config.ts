/**
 * Everything about this couple lives here. To make an invitation for a new client,
 * copy the project (`npm run new -- <slug>`) and edit this file.
 */
import { defineWedding } from '@wedding/core';
import type { RsvpConfig } from '@wedding/rsvp';

export const wedding = defineWedding({
  id: 'rose-garden',
  locale: 'en-GB',
  timeZone: 'Asia/Kuala_Lumpur',
  couple: {
    partnerA: {
      firstName: 'Johan',
      fullName: 'Johan Arif Hakimi',
      title: 'The Groom',
      parents: 'Son of Mr. Hakim Rahman & Mrs. Aisyah Noor',
      bio: 'Architect, early riser and maker of very serious pancakes.',
    },
    partnerB: {
      firstName: 'Sarah',
      fullName: 'Sarah Amelia Daniel',
      title: 'The Bride',
      parents: 'Daughter of Mr. Daniel Lee & Mrs. Mariam Yusof',
      bio: 'Florist at heart, collector of old books and long sunsets.',
    },
    monogram: 'J & S',
    hashtag: '#JohanAndSarah2027',
  },
  invitation: {
    kicker: 'Kindly join us for the wedding of',
    message: 'Together with our families, we invite you to share in our joy as we begin our forever among the roses.',
    hosts: ['Mr. Hakim Rahman & Mrs. Aisyah Noor', 'Mr. Daniel Lee & Mrs. Mariam Yusof'],
    quote: { text: 'Whatever our souls are made of, his and mine are the same.', source: 'Emily Brontë' },
  },
  date: '2027-07-25T17:00:00+08:00',
  venue: {
    name: 'Rosewood Garden Pavilion',
    address: '18 Rosewood Lane, Garden District',
    mapsQuery: 'Rosewood Garden Pavilion',
    notes: 'Complimentary valet parking at the east gate. The garden path is paved — comfortable heels welcome.',
  },
  events: [
    {
      id: 'ceremony',
      title: 'The Ceremony',
      subtitle: 'Exchange of vows',
      start: '2027-07-25T17:00:00+08:00',
      end: '2027-07-25T18:00:00+08:00',
      icon: 'rings',
      description: 'Kindly be seated by 4:45 pm. Vows are exchanged beneath the rose arch.',
    },
    {
      id: 'golden-hour',
      title: 'Golden Hour',
      subtitle: 'Drinks & canapés',
      start: '2027-07-25T18:00:00+08:00',
      end: '2027-07-25T19:00:00+08:00',
      icon: 'glass',
      description: 'Sip and stroll through the rose garden while the sun goes down.',
    },
    {
      id: 'reception',
      title: 'The Reception',
      subtitle: 'Dinner & dancing',
      start: '2027-07-25T19:00:00+08:00',
      end: '2027-07-25T23:00:00+08:00',
      icon: 'dinner',
      description: 'Dinner in the glasshouse, followed by dancing under the stars.',
    },
  ],
  contacts: [
    { name: 'Aina', role: 'Maid of honour', phone: '+60 12-345 6789' },
    { name: 'Farhan', role: 'Best man', phone: '+60 19-876 5432' },
  ],
  notes: [
    {
      id: 'dress',
      title: 'Dress Code',
      body: 'Garden formal. Soft pastels are lovely — we kindly ask that white be left to the bride.',
      icon: 'dress',
      swatches: ['#f6d6d8', '#e9a7b0', '#c5d3b2', '#f4ead9', '#a9bfd3'],
    },
    {
      id: 'gifts',
      title: 'Gifts',
      body: 'Your presence is the greatest gift. Should you wish to bless us, a wishing well awaits at the reception.',
      icon: 'gift',
    },
    {
      id: 'little-ones',
      title: 'Little Ones',
      body: 'Children are warmly welcome — a little play corner will be set up in the garden.',
      icon: 'users',
    },
  ],
  closing: {
    title: 'With love',
    message: 'Thank you for being part of our story. We cannot wait to celebrate with you among the roses.',
  },
});

/** Reservation settings, reused by the shared @wedding/rsvp template. */
export const rsvp: RsvpConfig = {
  id: wedding.id,
  maxGuests: 4,
  deadline: '2027-06-25',
  codePrefix: 'JS',
  locale: wedding.locale,
  timeZone: wedding.timeZone,
  sessions: [
    { id: 'ceremony', label: 'Ceremony & Reception', time: 'From 5:00 pm', capacity: 120 },
    { id: 'reception', label: 'Reception only', time: 'From 7:00 pm', capacity: 220 },
  ],
  fields: { phone: 'required', email: 'hidden', message: 'optional' },
};
