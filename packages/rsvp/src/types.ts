export type Attendance = 'yes' | 'no';
export type FieldMode = 'required' | 'optional' | 'hidden';

/** A time slot / session guests can reserve seats in. */
export interface RsvpSession {
  id: string;
  label: string;
  /** Display text, e.g. "From 5:00 pm". */
  time?: string;
  /** Total seats. Leave out for unlimited. */
  capacity?: number;
  description?: string;
}

/** Extra question appended to the form. */
export interface RsvpCustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  /** Only ask attending guests (default) or everyone. */
  showWhen?: 'attending' | 'always';
}

export interface RsvpConfig {
  /** Namespace for stored data, normally the invitation id. */
  id: string;
  /** Max seats one response may reserve, including the guest. */
  maxGuests: number;
  /** ISO date or date-time. The form closes at the end of that day. */
  deadline?: string;
  sessions?: RsvpSession[];
  fields?: { phone?: FieldMode; email?: FieldMode; message?: FieldMode };
  customFields?: RsvpCustomField[];
  /** Prefix for reservation codes, e.g. "JS" -> "JS-7KQ2M". */
  codePrefix?: string;
  messageMaxLength?: number;
  /** Copy overrides (any language). */
  labels?: RsvpLabelOverrides;
  /** Used to format the deadline. */
  locale?: string;
  timeZone?: string;
}

export interface RsvpSubmission {
  /** Reservation code; re-submitting with the same code updates the response. */
  code: string;
  name: string;
  phone?: string;
  email?: string;
  attendance: Attendance;
  /** Seats reserved, 0 when not attending. */
  guests: number;
  sessionId?: string;
  message?: string;
  custom?: Record<string, string | boolean>;
}

export interface RsvpRecord extends RsvpSubmission {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

/** Seats already reserved per session id (capacity optional; config capacity is the fallback). */
export type Availability = Record<string, { reserved: number; capacity?: number }>;

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  attendance?: Attendance;
}

/** Storage backend. Implement this to plug the RSVP into any service. */
export interface RsvpAdapter {
  readonly name: string;
  submit(submission: RsvpSubmission): Promise<RsvpRecord>;
  getAvailability?(): Promise<Availability>;
  listWishes?(options?: { limit?: number }): Promise<Wish[]>;
}

export class RsvpError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'RsvpError';
    this.code = code;
  }
}

/** Any subset of the labels, including single error / success messages. */
export type RsvpLabelOverrides = Partial<Omit<RsvpLabels, 'errors' | 'success'>> & {
  errors?: Partial<RsvpLabels['errors']>;
  success?: Partial<RsvpLabels['success']>;
};

export interface RsvpLabels {
  name: string;
  namePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  attendance: string;
  attendYes: string;
  attendYesHint: string;
  attendNo: string;
  attendNoHint: string;
  guests: string;
  guestsHint: (max: number) => string;
  decrease: string;
  increase: string;
  session: string;
  seatsLeft: (n: number) => string;
  full: string;
  message: string;
  messagePlaceholder: string;
  optional: string;
  submit: string;
  submitting: string;
  update: string;
  deadline: (date: string) => string;
  closed: string;
  errors: {
    name: string;
    attendance: string;
    guests: (max: number) => string;
    session: string;
    capacity: (left: number) => string;
    phone: string;
    email: string;
    message: (max: number) => string;
    required: string;
    generic: string;
  };
  success: {
    titleYes: string;
    titleNo: string;
    bodyYes: (guests: number) => string;
    bodyNo: string;
    code: string;
    guest: string;
    seats: string;
    session: string;
    edit: string;
  };
}
