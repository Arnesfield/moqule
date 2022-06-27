import { expect } from 'chai';
import { init } from './init';
import { expectInit, expectModuleRef } from '../tests/shared';

describe('init', () => {
  expectInit(init);

  it('should return a moduleRef', () => {
    const name = 'AppModule';
    const moduleRef = init({ name });
    expectModuleRef(moduleRef);
    expect(moduleRef.name).to.equal(name);
  });
});
