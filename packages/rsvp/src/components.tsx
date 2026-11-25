import { useId, type ReactNode } from 'react';
import type { RsvpAdapter, RsvpConfig, RsvpLabelOverrides, RsvpLabels, RsvpRecord, Wish } from './types';
import { useRsvp, useWishes, type RsvpController } from './useRsvp';
import { mergeLabels } from './labels';
import { cx, deadlineMs } from './utils';

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const CHECK = 'M5 12.5 10 17.5 19 7';
const CROSS = 'M6.5 6.5l11 11M17.5 6.5l-11 11';
const PLUS = 'M12 5v14M5 12h14';
const MINUS = 'M5 12h14';

function formatDeadline(config: RsvpConfig): string {
  if (!config.deadline) return '';
  return new Intl.DateTimeFormat(config.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: config.timeZone,
  }).format(new Date(deadlineMs(config.deadline)));
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

export interface RsvpFormProps {
  config: RsvpConfig;
  adapter: RsvpAdapter;
  defaultName?: string;
  labels?: RsvpLabelOverrides;
  className?: string;
  /** Replace the default confirmation ticket. */
  renderSuccess?: (record: RsvpRecord, api: { edit: () => void; labels: RsvpLabels; controller: RsvpController }) => ReactNode;
  /** Shown on the default ticket. */
  ticketTitle?: string;
  ticketSubtitle?: string;
  onSubmitted?: (record: RsvpRecord) => void;
}

/**
 * Drop-in RSVP form. Style it per design with the `--rsvp-*` CSS variables
 * (see rsvp.css) or by targeting the `rsvp-*` class names.
 */
export function RsvpForm(props: RsvpFormProps) {
  const rsvp = useRsvp({
    config: props.config,
    adapter: props.adapter,
    defaultName: props.defaultName,
    labels: props.labels,
    onSubmitted: props.onSubmitted,
  });
  const { labels: L, record, mode, edit } = rsvp;

  if (mode === 'done' && record) {
    return (
      <div className={cx('rsvp-done', props.className)}>
        {props.renderSuccess ? (
          props.renderSuccess(record, { edit, labels: L, controller: rsvp })
        ) : (
          <RsvpTicket
            record={record}
            config={props.config}
            labels={L}
            title={props.ticketTitle}
            subtitle={props.ticketSubtitle}
            onEdit={rsvp.closed ? undefined : edit}
          />
        )}
      </div>
    );
  }

  if (rsvp.closed) {
    return <p className={cx('rsvp rsvp--closed', props.className)}>{L.closed}</p>;
  }

  return <RsvpFields rsvp={rsvp} className={props.className} />;
}

/** The form fields on their own, for designs that use `useRsvp` directly. */
export function RsvpFields({ rsvp, className }: { rsvp: RsvpController; className?: string }) {
  const id = useId();
  const { labels: L, values, setField, setCustom, errors, fields, config, remaining, maxGuests, status, submit, messageMax, record } = rsvp;
  const attending = values.attendance === 'yes';
  const submitting = status === 'submitting';
  const err = (key: string) =>
    errors[key] ? (
      <p className="rsvp-error" id={`${id}-${key}-error`}>
        {errors[key]}
      </p>
    ) : null;
  const describedBy = (key: string) => (errors[key] ? `${id}-${key}-error` : undefined);
  const optional = <span className="rsvp-optional">({L.optional})</span>;

  return (
    <form className={cx('rsvp', className)} onSubmit={submit} noValidate aria-busy={submitting}>
      <div className="rsvp-field">
        <label className="rsvp-label" htmlFor={`${id}-name`}>
          {L.name}
        </label>
        <input
          id={`${id}-name`}
          className="rsvp-input"
          autoComplete="name"
          placeholder={L.namePlaceholder}
          value={values.name}
          maxLength={80}
          onChange={(e) => setField('name', e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={describedBy('name')}
        />
        {err('name')}
      </div>

      <fieldset className="rsvp-field rsvp-fieldset" aria-describedby={describedBy('attendance')}>
        <legend className="rsvp-label">{L.attendance}</legend>
        <div className="rsvp-choices">
          {(['yes', 'no'] as const).map((v) => (
            <label key={v} className={cx('rsvp-choice', `rsvp-choice--${v}`, values.attendance === v && 'is-selected')}>
              <input
                type="radio"
                className="rsvp-sr"
                name={`${id}-attendance`}
                value={v}
                checked={values.attendance === v}
                onChange={() => setField('attendance', v)}
              />
              <span className="rsvp-choice__icon">
                <Glyph d={v === 'yes' ? CHECK : CROSS} />
              </span>
              <span className="rsvp-choice__text">
                <strong>{v === 'yes' ? L.attendYes : L.attendNo}</strong>
                <small>{v === 'yes' ? L.attendYesHint : L.attendNoHint}</small>
              </span>
            </label>
          ))}
        </div>
        {err('attendance')}
      </fieldset>

      {attending && (
        <div className="rsvp-group">
          {!!config.sessions?.length && (
            <fieldset className="rsvp-field rsvp-fieldset" aria-describedby={describedBy('sessionId')}>
              <legend className="rsvp-label">{L.session}</legend>
              <div className="rsvp-sessions">
                {config.sessions.map((s) => {
                  const left = remaining(s.id);
                  const full = left <= 0;
                  return (
                    <label key={s.id} className={cx('rsvp-session', values.sessionId === s.id && 'is-selected', full && 'is-full')}>
                      <input
                        type="radio"
                        className="rsvp-sr"
                        name={`${id}-session`}
                        value={s.id}
                        disabled={full}
                        checked={values.sessionId === s.id}
                        onChange={() => {
                          setField('sessionId', s.id);
                          if (values.guests > left) setField('guests', Math.max(1, Math.min(left, config.maxGuests)));
                        }}
                      />
                      <span className="rsvp-session__label">{s.label}</span>
                      {s.time && <span className="rsvp-session__time">{s.time}</span>}
                      {Number.isFinite(left) && (
                        <span className="rsvp-session__seats">{full ? L.full : L.seatsLeft(left)}</span>
                      )}
                    </label>
                  );
                })}
              </div>
              {err('sessionId')}
            </fieldset>
          )}

          <div className="rsvp-field">
            <span className="rsvp-label" id={`${id}-guests-label`}>
              {L.guests}
            </span>
            <div className="rsvp-stepper" role="group" aria-labelledby={`${id}-guests-label`}>
              <button
                type="button"
                className="rsvp-stepper__btn"
                aria-label={L.decrease}
                disabled={values.guests <= 1}
                onClick={() => setField('guests', Math.max(1, values.guests - 1))}
              >
                <Glyph d={MINUS} />
              </button>
              <output className="rsvp-stepper__value" aria-live="polite">
                {values.guests}
              </output>
              <button
                type="button"
                className="rsvp-stepper__btn"
                aria-label={L.increase}
                disabled={values.guests >= maxGuests}
                onClick={() => setField('guests', Math.min(maxGuests, values.guests + 1))}
              >
                <Glyph d={PLUS} />
              </button>
            </div>
            <p className="rsvp-hint">{L.guestsHint(config.maxGuests)}</p>
            {err('guests')}
          </div>
        </div>
      )}

      {fields.phone !== 'hidden' && (
        <div className="rsvp-field">
          <label className="rsvp-label" htmlFor={`${id}-phone`}>
            {L.phone} {fields.phone === 'optional' && optional}
          </label>
          <input
            id={`${id}-phone`}
            className="rsvp-input"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={L.phonePlaceholder}
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy('phone')}
          />
          {err('phone')}
        </div>
      )}

      {fields.email !== 'hidden' && (
        <div className="rsvp-field">
          <label className="rsvp-label" htmlFor={`${id}-email`}>
            {L.email} {fields.email === 'optional' && optional}
          </label>
          <input
            id={`${id}-email`}
            className="rsvp-input"
            type="email"
            autoComplete="email"
            placeholder={L.emailPlaceholder}
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy('email')}
          />
          {err('email')}
        </div>
      )}

      {(config.customFields ?? [])
        .filter((f) => f.showWhen === 'always' || attending)
        .map((f) => {
          const key = `custom.${f.id}`;
          const value = values.custom[f.id];
          const fid = `${id}-c-${f.id}`;
          if (f.type === 'checkbox') {
            return (
              <div className="rsvp-field" key={f.id}>
                <label className="rsvp-check">
                  <input type="checkbox" checked={value === true} onChange={(e) => setCustom(f.id, e.target.checked)} />
                  <span>{f.label}</span>
                </label>
                {err(key)}
              </div>
            );
          }
          return (
            <div className="rsvp-field" key={f.id}>
              <label className="rsvp-label" htmlFor={fid}>
                {f.label} {!f.required && optional}
              </label>
              {f.type === 'select' ? (
                <select
                  id={fid}
                  className="rsvp-input"
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e) => setCustom(f.id, e.target.value)}
                  aria-invalid={!!errors[key]}
                >
                  <option value="">—</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  id={fid}
                  className="rsvp-input rsvp-textarea"
                  placeholder={f.placeholder}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e) => setCustom(f.id, e.target.value)}
                />
              ) : (
                <input
                  id={fid}
                  className="rsvp-input"
                  placeholder={f.placeholder}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e) => setCustom(f.id, e.target.value)}
                  aria-invalid={!!errors[key]}
                />
              )}
              {err(key)}
            </div>
          );
        })}

      {fields.message !== 'hidden' && (
        <div className="rsvp-field">
          <label className="rsvp-label" htmlFor={`${id}-message`}>
            {L.message} {fields.message === 'optional' && optional}
          </label>
          <textarea
            id={`${id}-message`}
            className="rsvp-input rsvp-textarea"
            placeholder={L.messagePlaceholder}
            value={values.message}
            maxLength={messageMax}
            rows={3}
            onChange={(e) => setField('message', e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={describedBy('message')}
          />
          <span className="rsvp-count" aria-hidden="true">
            {values.message.length}/{messageMax}
          </span>
          {err('message')}
        </div>
      )}

      {rsvp.submitError && (
        <p className="rsvp-alert" role="alert">
          {rsvp.submitError}
        </p>
      )}

      <button type="submit" className="rsvp-submit" disabled={submitting}>
        {submitting ? L.submitting : record ? L.update : L.submit}
      </button>

      {config.deadline && <p className="rsvp-deadline">{L.deadline(formatDeadline(config))}</p>}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation ticket                                                 */
/* ------------------------------------------------------------------ */

export interface RsvpTicketProps {
  record: RsvpRecord;
  config: RsvpConfig;
  labels?: RsvpLabels;
  title?: string;
  subtitle?: string;
  onEdit?: () => void;
  className?: string;
  children?: ReactNode;
}

export function RsvpTicket({ record, config, labels, title, subtitle, onEdit, className, children }: RsvpTicketProps) {
  const L = labels ?? mergeLabels(config.labels);
  const yes = record.attendance === 'yes';
  const session = config.sessions?.find((s) => s.id === record.sessionId);
  return (
    <div className={cx('rsvp-ticket', !yes && 'is-declined', className)} role="status">
      <div className="rsvp-ticket__main">
        <p className="rsvp-ticket__eyebrow">{yes ? L.success.titleYes : L.success.titleNo}</p>
        {title && <h3 className="rsvp-ticket__title">{title}</h3>}
        {subtitle && <p className="rsvp-ticket__subtitle">{subtitle}</p>}
        <p className="rsvp-ticket__body">{yes ? L.success.bodyYes(record.guests) : L.success.bodyNo}</p>
        <dl className="rsvp-ticket__meta">
          <div>
            <dt>{L.success.guest}</dt>
            <dd>{record.name}</dd>
          </div>
          {yes && (
            <div>
              <dt>{L.success.seats}</dt>
              <dd>{record.guests}</dd>
            </div>
          )}
          {yes && session && (
            <div>
              <dt>{L.success.session}</dt>
              <dd>
                {session.label}
                {session.time ? ` · ${session.time}` : ''}
              </dd>
            </div>
          )}
        </dl>
        {children}
      </div>
      <div className="rsvp-ticket__stub">
        <span className="rsvp-ticket__code-label">{L.success.code}</span>
        <span className="rsvp-ticket__code">{record.code}</span>
        {onEdit && (
          <button type="button" className="rsvp-ticket__edit" onClick={onEdit}>
            {L.success.edit}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wishes                                                              */
/* ------------------------------------------------------------------ */

export interface WishListProps {
  adapter: RsvpAdapter;
  limit?: number;
  className?: string;
  emptyText?: string;
  renderWish?: (wish: Wish) => ReactNode;
}

/** Simple default guestbook. Designs usually build their own with `useWishes`. */
export function WishList({ adapter, limit, className, emptyText = 'Be the first to leave a wish.', renderWish }: WishListProps) {
  const { wishes, loading } = useWishes(adapter, { limit });
  if (loading) return <p className={cx('rsvp-wishes rsvp-wishes--loading', className)}>…</p>;
  if (!wishes.length) return <p className={cx('rsvp-wishes rsvp-wishes--empty', className)}>{emptyText}</p>;
  return (
    <ul className={cx('rsvp-wishes', className)}>
      {wishes.map((w) => (
        <li key={w.id} className="rsvp-wish">
          {renderWish ? (
            renderWish(w)
          ) : (
            <>
              <p className="rsvp-wish__message">{w.message}</p>
              <p className="rsvp-wish__name">{w.name}</p>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
