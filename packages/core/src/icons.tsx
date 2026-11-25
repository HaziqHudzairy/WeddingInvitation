import type { ReactNode } from 'react';

/** Hand-drawn 24×24 line icons. They inherit `currentColor`. */
const ICONS = {
  home: <path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" />,
  heart: (
    <path d="M12 20.2s-7.4-4.5-9-9.1C1.8 7.6 4 4.2 7.4 4.2c2 0 3.5 1.1 4.6 2.7 1.1-1.6 2.6-2.7 4.6-2.7 3.4 0 5.6 3.4 4.4 6.9-1.6 4.6-9 9.1-9 9.1z" />
  ),
  rings: (
    <>
      <circle cx="9" cy="14.5" r="5.5" />
      <circle cx="15" cy="14.5" r="5.5" />
      <path d="M9.6 3.5h4.8L16 6l-4 3.2L8 6z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M12 13.2c.9-1.3 3-.8 2.6.9-.3 1.2-2.6 2.6-2.6 2.6s-2.3-1.4-2.6-2.6c-.4-1.7 1.7-2.2 2.6-.9z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </>
  ),
  envelope: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.6 7 8.4 6.4L20.4 7" />
    </>
  ),
  message: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9.5L5 20.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  phone: (
    <path d="M5.2 3.8h3.3l1.6 4.1-2.1 1.3a11 11 0 0 0 5 5l1.3-2.1 4.1 1.6v3.3a2 2 0 0 1-2.1 2A15.6 15.6 0 0 1 3.2 5.9a2 2 0 0 1 2-2.1z" />
  ),
  whatsapp: (
    <>
      <path d="M4.3 19.7 5.5 16A8.3 8.3 0 1 1 8.4 18.7z" />
      <path d="M9.4 8.3c.4-.4 1-.4 1.2.1l.6 1.4c.1.3 0 .6-.2.8l-.4.4a5 5 0 0 0 2.4 2.4l.4-.4c.2-.2.5-.3.8-.2l1.4.6c.5.2.5.8.1 1.2-.7.7-1.8.9-2.8.4a8 8 0 0 1-3.9-3.9c-.5-1-.3-2.1.4-2.8z" />
    </>
  ),
  navigate: <path d="M3.5 11 20.5 3.5 13 20.5l-2-7.5z" />,
  'chevron-left': <path d="M14.5 5.5 8 12l6.5 6.5" />,
  'chevron-right': <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  'chevron-down': <path d="M5.5 9.5 12 16l6.5-6.5" />,
  sparkle: <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z" />,
  glass: (
    <>
      <path d="M7.5 3h9l-.7 6.4a3.8 3.8 0 0 1-7.6 0z" />
      <path d="M12 13.2V20M8.5 20.5h7M8 7h8" />
    </>
  ),
  dinner: (
    <>
      <path d="M6.5 3v6a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3M8.5 11v10M8.5 3v5" />
      <path d="M17.5 21V3c-2.2 1.4-3.3 4.4-3.3 8.2h3.3" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v8.5h14V12M12 8v12.5M12 8c-1.6-3.6-5.3-3.8-5.3-1.6C6.7 7.8 9.5 8 12 8zm0 0c1.6-3.6 5.3-3.8 5.3-1.6 0 1.4-2.8 1.6-5.3 1.6z" />
    </>
  ),
  dress: <path d="M9.2 3h5.6l-1 4.2 4.6 13.3H5.6l4.6-13.3zM10.2 7.2h3.6" />,
  car: (
    <>
      <path d="M4 16.5V12l2-5h12l2 5v4.5zM4 16.5V19h3v-2.5M17 16.5V19h3v-2.5" />
      <path d="M7.5 13.5h.01M16.5 13.5h.01" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5M15.5 5.2a3 3 0 0 1 0 5.6M17.5 14.6c1.6.6 2.7 2.2 3 4.9" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19 7" />,
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  music: (
    <>
      <path d="M9 18.5V5.5l11-2v13" />
      <circle cx="6.5" cy="18.5" r="2.5" />
      <circle cx="17.5" cy="16.5" r="2.5" />
    </>
  ),
  rose: (
    <>
      <path d="M12 21v-7.2" />
      <path d="M12 13.8c-3.3 0-5.4-2.4-5.4-5.4 1.4.5 2.9-.4 3-2.4.8.7 1.6 1 2.4 1s1.6-.3 2.4-1c.1 2 1.6 2.9 3 2.4 0 3-2.1 5.4-5.4 5.4z" />
      <path d="M12 17.6c-1.4-1.6-3.4-2-5-1.2 1.1 1.6 3.1 2.2 5 1.2zM12 16.6c1.2-1.5 3-1.8 4.6-1.1-1 1.5-2.8 2-4.6 1.1z" />
    </>
  ),
  leaf: <path d="M5 19c0-8.2 5-13.6 15-15-1 10-6.8 15-15 15zM5 19l8-8" />,
  quote: (
    <path d="M10 7.5C6.8 8.3 5 10.6 5 14v2.5h4.5V12H7.2c.2-1.8 1.2-2.9 3.1-3.3zM19 7.5c-3.2.8-5 3.1-5 6.5v2.5h4.5V12h-2.3c.2-1.8 1.2-2.9 3.1-3.3z" />
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export const iconNames = Object.keys(ICONS) as IconName[];

export interface IconProps {
  name: IconName | (string & {});
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  /** Accessible label. Without it the icon is decorative. */
  title?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.6, className, title }: IconProps) {
  const glyph = (ICONS as Record<string, ReactNode>)[name] ?? ICONS.sparkle;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {glyph}
    </svg>
  );
}
