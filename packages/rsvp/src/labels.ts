import type { RsvpLabelOverrides, RsvpLabels } from './types';

export const defaultLabels: RsvpLabels = {
  name: 'Your name',
  namePlaceholder: 'Full name',
  phone: 'Phone number',
  phonePlaceholder: '+60 12-345 6789',
  email: 'Email',
  emailPlaceholder: 'you@example.com',
  attendance: 'Will you attend?',
  attendYes: 'Joyfully accept',
  attendYesHint: 'Count me in',
  attendNo: 'Regretfully decline',
  attendNoHint: 'Celebrating from afar',
  guests: 'Seats to reserve',
  guestsHint: (max) => `Including yourself · up to ${max}`,
  decrease: 'Remove a seat',
  increase: 'Add a seat',
  session: 'Choose your session',
  seatsLeft: (n) => `${n} seat${n === 1 ? '' : 's'} left`,
  full: 'Fully booked',
  message: 'Wishes for the couple',
  messagePlaceholder: 'Write a few words of love…',
  optional: 'optional',
  submit: 'Send reservation',
  submitting: 'Sending…',
  update: 'Update reservation',
  deadline: (date) => `Kindly respond by ${date}`,
  closed: 'Reservations are now closed. Thank you!',
  errors: {
    name: 'Please tell us your name.',
    attendance: 'Please let us know if you can come.',
    guests: (max) => `Please choose between 1 and ${max} seats.`,
    session: 'Please pick a session.',
    capacity: (left) => (left > 0 ? `Only ${left} seat${left === 1 ? '' : 's'} left in this session.` : 'This session is fully booked.'),
    phone: 'Please enter a valid phone number.',
    email: 'Please enter a valid email address.',
    message: (max) => `Please keep your message under ${max} characters.`,
    required: 'This field is required.',
    generic: 'Something went wrong. Please try again.',
  },
  success: {
    titleYes: 'Reservation confirmed',
    titleNo: 'Response received',
    bodyYes: (guests) => `We can't wait to celebrate with you. ${guests} seat${guests === 1 ? ' is' : 's are'} saved in your name.`,
    bodyNo: "We'll miss you dearly — thank you for letting us know.",
    code: 'Reservation code',
    guest: 'Guest',
    seats: 'Seats',
    session: 'Session',
    edit: 'Change response',
  },
};

export function mergeLabels(...overrides: Array<RsvpLabelOverrides | undefined>): RsvpLabels {
  let out: RsvpLabels = defaultLabels;
  for (const o of overrides) {
    if (!o) continue;
    out = {
      ...out,
      ...o,
      errors: { ...out.errors, ...o.errors },
      success: { ...out.success, ...o.success },
    };
  }
  return out;
}
