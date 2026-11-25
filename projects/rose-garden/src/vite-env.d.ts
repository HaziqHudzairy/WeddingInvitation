/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RSVP_MODE?: 'local' | 'sheets' | 'rest';
  readonly VITE_RSVP_SHEETS_URL?: string;
  readonly VITE_RSVP_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
