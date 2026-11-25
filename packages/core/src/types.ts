/** A person getting married. */
export interface Person {
  /** Short name used in headings, e.g. "Sarah". */
  firstName: string;
  /** Full name shown on profile cards. */
  fullName?: string;
  /** Role line, e.g. "The Bride". */
  title?: string;
  /** Parents / family line, e.g. "Daughter of Mr. & Mrs. Daniel". */
  parents?: string;
  /** Short bio or quote for profile cards. */
  bio?: string;
  instagram?: string;
}

export interface Venue {
  name: string;
  address: string;
  /** Free-text query used to build map links when no explicit URL is given. */
  mapsQuery?: string;
  googleMapsUrl?: string;
  wazeUrl?: string;
  lat?: number;
  lng?: number;
  /** Extra practical info such as parking. */
  notes?: string;
}

export interface WeddingEvent {
  id: string;
  title: string;
  /** Script-style subtitle, e.g. "Holy Matrimony". */
  subtitle?: string;
  /** ISO date-time with offset, e.g. "2027-07-25T17:00:00+08:00". */
  start: string;
  end?: string;
  /** Defaults to the main wedding venue. */
  venue?: Venue;
  description?: string;
  /** Icon name from the core icon set. */
  icon?: string;
}

export interface Contact {
  name: string;
  role?: string;
  /** International format, e.g. "+60 12-345 6789". */
  phone?: string;
  /** Set to false to hide the WhatsApp button for this contact. */
  whatsapp?: boolean;
  email?: string;
}

export interface InfoNote {
  id: string;
  title: string;
  body: string;
  icon?: string;
  /** Optional colour swatches, e.g. for a dress code. */
  swatches?: string[];
}

export interface WeddingConfig {
  /** Unique slug, also used as storage namespace. */
  id: string;
  /** BCP 47 locale used for all dates, e.g. "en-GB". */
  locale: string;
  /** IANA time zone of the venue. All times are displayed in this zone. */
  timeZone: string;
  /** Clock style for times. Defaults to 12h ("5:00 pm"). */
  timeFormat?: '12h' | '24h';
  couple: {
    /** Usually the groom; rendered first. */
    partnerA: Person;
    /** Usually the bride. */
    partnerB: Person;
    /** Monogram letters, e.g. "J & S". */
    monogram?: string;
    hashtag?: string;
  };
  invitation?: {
    kicker?: string;
    message?: string;
    /** Hosting families / parents, one line each. */
    hosts?: string[];
    quote?: { text: string; source?: string };
  };
  /** Main date-time of the wedding (ISO with offset). Used by the countdown. */
  date: string;
  venue: Venue;
  events: WeddingEvent[];
  contacts?: Contact[];
  notes?: InfoNote[];
  closing?: { title?: string; message?: string };
}
