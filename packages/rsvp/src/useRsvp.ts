import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { mergeLabels } from './labels';
import type {
  Attendance,
  Availability,
  RsvpAdapter,
  RsvpConfig,
  RsvpLabelOverrides,
  RsvpLabels,
  RsvpRecord,
  RsvpSubmission,
  Wish,
} from './types';
import { deadlineMs, emitRsvpChange, makeCode, onRsvpChange, readJSON, writeJSON } from './utils';

export interface RsvpValues {
  name: string;
  phone: string;
  email: string;
  attendance: Attendance | '';
  guests: number;
  sessionId: string;
  message: string;
  custom: Record<string, string | boolean>;
}

export type RsvpErrors = Partial<Record<string, string>>;

export interface UseRsvpOptions {
  config: RsvpConfig;
  adapter: RsvpAdapter;
  /** Pre-fill the name, e.g. from a personalised link. */
  defaultName?: string;
  labels?: RsvpLabelOverrides;
  onSubmitted?: (record: RsvpRecord) => void;
}

const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function initialValues(config: RsvpConfig, name = ''): RsvpValues {
  return {
    name,
    phone: '',
    email: '',
    attendance: '',
    guests: 1,
    sessionId: config.sessions?.length === 1 ? config.sessions[0].id : '',
    message: '',
    custom: {},
  };
}

function fromRecord(r: RsvpRecord, config: RsvpConfig): RsvpValues {
  return {
    ...initialValues(config),
    name: r.name,
    phone: r.phone ?? '',
    email: r.email ?? '',
    attendance: r.attendance,
    guests: Math.max(1, r.guests),
    sessionId: r.sessionId ?? '',
    message: r.message ?? '',
    custom: r.custom ?? {},
  };
}

/**
 * Headless RSVP logic: state, validation, seat availability and submission.
 * Use it to build a completely custom form, or use <RsvpForm> for the default UI.
 */
export function useRsvp({ config, adapter, defaultName = '', labels, onSubmitted }: UseRsvpOptions) {
  const L: RsvpLabels = useMemo(() => mergeLabels(config.labels, labels), [config.labels, labels]);
  const storageKey = `wedding-rsvp:${config.id}:mine`;
  const fields: Required<NonNullable<RsvpConfig['fields']>> = {
    phone: config.fields?.phone ?? 'optional',
    email: config.fields?.email ?? 'hidden',
    message: config.fields?.message ?? 'optional',
  };
  const messageMax = config.messageMaxLength ?? 500;

  const [record, setRecord] = useState<RsvpRecord | null>(() => readJSON<RsvpRecord>(storageKey));
  const [mode, setMode] = useState<'form' | 'done'>(() => (readJSON<RsvpRecord>(storageKey) ? 'done' : 'form'));
  const [values, setValues] = useState<RsvpValues>(() => initialValues(config, defaultName));
  const [errors, setErrors] = useState<RsvpErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [availability, setAvailability] = useState<Availability | null>(null);

  const closed = config.deadline ? Date.now() > deadlineMs(config.deadline) : false;

  const refreshAvailability = useCallback(async () => {
    if (!adapter.getAvailability || !config.sessions?.length) return;
    try {
      setAvailability(await adapter.getAvailability());
    } catch {
      /* availability is a nicety; the backend still enforces capacity */
    }
  }, [adapter, config.sessions?.length]);

  useEffect(() => {
    void refreshAvailability();
  }, [refreshAvailability]);

  /** Seats still free in a session (your own previous reservation counts as free). */
  const remaining = useCallback(
    (sessionId: string) => {
      const session = config.sessions?.find((s) => s.id === sessionId);
      const capacity = availability?.[sessionId]?.capacity ?? session?.capacity;
      if (capacity == null) return Infinity;
      let reserved = availability?.[sessionId]?.reserved ?? 0;
      if (record?.attendance === 'yes' && record.sessionId === sessionId) reserved -= record.guests;
      return Math.max(0, capacity - reserved);
    },
    [availability, config.sessions, record],
  );

  const maxGuests = values.sessionId ? Math.min(config.maxGuests, Math.max(1, remaining(values.sessionId))) : config.maxGuests;

  const setField = useCallback(<K extends keyof RsvpValues>(key: K, value: RsvpValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const setCustom = useCallback((id: string, value: string | boolean) => {
    setValues((v) => ({ ...v, custom: { ...v.custom, [id]: value } }));
    setErrors((e) => (e[`custom.${id}`] ? { ...e, [`custom.${id}`]: undefined } : e));
  }, []);

  const validate = useCallback((): RsvpErrors => {
    const e: RsvpErrors = {};
    const name = values.name.trim();
    if (name.length < 2 || name.length > 80) e.name = L.errors.name;
    if (!values.attendance) e.attendance = L.errors.attendance;
    const attending = values.attendance === 'yes';
    if (attending) {
      if (!Number.isInteger(values.guests) || values.guests < 1 || values.guests > config.maxGuests) {
        e.guests = L.errors.guests(config.maxGuests);
      }
      if (config.sessions?.length) {
        if (!values.sessionId) e.sessionId = L.errors.session;
        else {
          const left = remaining(values.sessionId);
          if (values.guests > left) e.sessionId = L.errors.capacity(left);
        }
      }
    }
    const phone = values.phone.trim();
    if (fields.phone === 'required' && !phone) e.phone = L.errors.phone;
    else if (phone && !PHONE_RE.test(phone)) e.phone = L.errors.phone;
    const email = values.email.trim();
    if (fields.email === 'required' && !email) e.email = L.errors.email;
    else if (email && !EMAIL_RE.test(email)) e.email = L.errors.email;
    if (fields.message === 'required' && !values.message.trim()) e.message = L.errors.required;
    if (values.message.length > messageMax) e.message = L.errors.message(messageMax);
    for (const field of config.customFields ?? []) {
      const visible = field.showWhen === 'always' || attending;
      const v = values.custom[field.id];
      if (visible && field.required && (v === undefined || v === '' || v === false)) e[`custom.${field.id}`] = L.errors.required;
    }
    return e;
  }, [values, config, fields.phone, fields.email, fields.message, messageMax, L, remaining]);

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (status === 'submitting' || closed) return;
      const found = validate();
      setErrors(found);
      if (Object.keys(found).length) return;

      const attending = values.attendance === 'yes';
      const submission: RsvpSubmission = {
        code: record?.code ?? makeCode(config.codePrefix),
        name: values.name.trim(),
        phone: values.phone.trim() || undefined,
        email: values.email.trim() || undefined,
        attendance: values.attendance as Attendance,
        guests: attending ? values.guests : 0,
        sessionId: attending ? values.sessionId || undefined : undefined,
        message: values.message.trim() || undefined,
        custom: Object.keys(values.custom).length ? values.custom : undefined,
      };

      setStatus('submitting');
      setSubmitError('');
      try {
        const saved = await adapter.submit(submission);
        writeJSON(storageKey, saved);
        setRecord(saved);
        setMode('done');
        setStatus('idle');
        emitRsvpChange();
        onSubmitted?.(saved);
        void refreshAvailability();
      } catch (err) {
        setStatus('error');
        setSubmitError(err instanceof Error && err.message ? err.message : L.errors.generic);
      }
    },
    [status, closed, validate, values, record, config.codePrefix, adapter, storageKey, onSubmitted, refreshAvailability, L],
  );

  /** Re-open the form pre-filled with the saved response. */
  const edit = useCallback(() => {
    if (record) setValues(fromRecord(record, config));
    setErrors({});
    setMode('form');
  }, [record, config]);

  return {
    config,
    labels: L,
    fields,
    messageMax,
    values,
    setField,
    setCustom,
    errors,
    status,
    submitError,
    submit,
    record,
    mode,
    edit,
    availability,
    remaining,
    maxGuests,
    closed,
  };
}

export type RsvpController = ReturnType<typeof useRsvp>;

/** Loads guest wishes and refreshes automatically after a new RSVP. */
export function useWishes(adapter: RsvpAdapter, { limit = 60 }: { limit?: number } = {}) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!adapter.listWishes) {
      setLoading(false);
      return;
    }
    try {
      setWishes(await adapter.listWishes({ limit }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load wishes');
    } finally {
      setLoading(false);
    }
  }, [adapter, limit]);

  useEffect(() => {
    void load();
    return onRsvpChange(() => void load());
  }, [load]);

  return { wishes, loading, error, reload: load };
}
