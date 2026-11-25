import { createGoogleSheetsAdapter, createLocalAdapter, createRestAdapter, type RsvpAdapter } from '@wedding/rsvp';
import { rsvp } from './wedding.config';

/**
 * Pick the RSVP backend with environment variables (see .env.example):
 *   VITE_RSVP_MODE=local   → stored in the browser (default, for previews)
 *   VITE_RSVP_MODE=sheets  → Google Sheet via Apps Script (VITE_RSVP_SHEETS_URL)
 *   VITE_RSVP_MODE=rest    → any server implementing the REST contract (VITE_RSVP_API_URL)
 */
function makeAdapter(): RsvpAdapter {
  const env = import.meta.env;
  if (env.VITE_RSVP_MODE === 'sheets' && env.VITE_RSVP_SHEETS_URL) {
    return createGoogleSheetsAdapter({ scriptUrl: env.VITE_RSVP_SHEETS_URL });
  }
  if (env.VITE_RSVP_MODE === 'rest' && env.VITE_RSVP_API_URL) {
    return createRestAdapter({ baseUrl: env.VITE_RSVP_API_URL });
  }
  return createLocalAdapter({
    storageKey: `wedding-rsvp:${rsvp.id}:records`,
    seedReserved: { ceremony: 86, reception: 141 },
    seedWishes: [
      { name: 'Aunt Mariam', message: 'May your home always be full of roses and laughter. So proud of you both!', createdAt: '2027-05-02T10:00:00Z', attendance: 'yes' },
      { name: 'Daniel & Hana', message: 'Counting down the days — save us a spot on the dance floor!', createdAt: '2027-04-28T10:00:00Z', attendance: 'yes' },
      { name: 'Mei Ling', message: 'Two of the kindest people I know. Here’s to forever and a day.', createdAt: '2027-04-20T10:00:00Z', attendance: 'yes' },
      { name: 'The Rahman Family', message: 'Wishing you a lifetime of love, patience and adventure together.', createdAt: '2027-04-11T10:00:00Z', attendance: 'yes' },
      { name: 'Priya', message: 'Your love story is my favourite one. Can’t wait to celebrate in the garden!', createdAt: '2027-04-02T10:00:00Z', attendance: 'yes' },
      { name: 'Uncle Ben', message: 'Sorry we can’t make it from abroad — sending all our love and a big hug.', createdAt: '2027-03-30T10:00:00Z', attendance: 'no' },
    ],
  });
}

export const rsvpAdapter = makeAdapter();
