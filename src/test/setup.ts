import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia. App.tsx uses it to pick the desktop vs.
// mobile login screen; default every test to "not desktop" unless a test
// overrides window.matchMedia itself.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
