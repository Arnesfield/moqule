import { expect } from 'chai';
import type { init, initAsync } from '../../core';

/**
 * Test behavior of `init` function.
 * @param initFn The `init` function to test.
 */
export function expectInit(initFn: typeof init | typeof initAsync): void {
  it('should be a function', () => {
    expect(initFn).to.be.a('function');
  });

  it('should require a name', async () => {
    let error: Error | undefined;
    try {
      await initFn({ name: undefined as any });
    } catch (err: unknown) {
      error = err as any;
    }
    expect(error).to.be.an('Error');
  });
}
