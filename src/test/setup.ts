import '@testing-library/jest-dom';

// IntersectionObserver is not available in jsdom — provide a no-op mock so
// components that use it (e.g. FactsWidget) don't throw during tests.
globalThis.IntersectionObserver = class MockIntersectionObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}

  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  takeRecords = (): IntersectionObserverEntry[] => [];
} as unknown as typeof IntersectionObserver;
