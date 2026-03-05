import { rm } from 'fs/promises';

export default async function teardown() {
  await rm('test-results', { recursive: true, force: true });
  await rm('playwright-report', { recursive: true, force: true });
  await rm('tests/e2e/e2e-screenshots', { recursive: true, force: true });
  await rm('e2e-results.json', { force: true });
}
