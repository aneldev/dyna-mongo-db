import 'jest-localstorage-mock';
import { performance } from 'perf_hooks';

if (!globalThis.performance) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).performance = performance;
}
jest.setTimeout(12000);
