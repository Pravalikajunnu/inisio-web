import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Guard against cross-origin iframe DevTools or frame property inspection errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event?.message &&
      (event.message.includes('$$typeof') ||
        event.message.includes('cross-origin frame') ||
        event.message.includes('Blocked a frame with origin'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event?.reason?.message &&
      (event.reason.message.includes('$$typeof') ||
        event.reason.message.includes('cross-origin frame') ||
        event.reason.message.includes('Blocked a frame with origin'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

