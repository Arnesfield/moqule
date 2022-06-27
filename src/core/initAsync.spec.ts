import { expect } from 'chai';
import { initAsync } from './initAsync';
import { expectInit, expectModuleRef } from '../tests/shared';

describe('initAsync', () => {
  expectInit(initAsync);

  it('should return a Promise that resolves to a moduleRef', async () => {
    const name = 'AppModule';
    const promise = initAsync({ name });
    expect(promise).to.be.instanceOf(Promise);
    const moduleRef = await promise;
    expectModuleRef(moduleRef);
    expect(moduleRef.name).to.equal(name);
  });
});
