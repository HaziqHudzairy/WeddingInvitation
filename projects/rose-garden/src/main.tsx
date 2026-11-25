import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Library styles first, so the theme below can override them.
import '@wedding/core';
import '@wedding/rsvp';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/great-vibes/400.css';
import './styles/theme.css';
import './styles/sections.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Dev helper for screenshots: `?skip&s=rsvp` jumps to a section, `?skip&y=1200` to a pixel offset.
if (import.meta.env.DEV) {
  const params = new URLSearchParams(window.location.search);
  const section = params.get('s');
  const y = params.get('y');
  if (section || y) {
    const jump = () => {
      const top = section ? (document.getElementById(section)?.getBoundingClientRect().top ?? 0) + window.scrollY : Number(y);
      window.scrollTo({ top, behavior: 'instant' });
    };
    [800, 1600, 2600].forEach((ms) => setTimeout(jump, ms));
  }
}
