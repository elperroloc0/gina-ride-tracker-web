import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// The design system owns the page: tokens on :root, Archivo on body.
// Nothing else styles this app globally.
import 'gina-ride-tracker-ds/styles.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
