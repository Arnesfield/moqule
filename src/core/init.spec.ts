import { expect } from 'chai';
import rewire from 'rewire';
import { spy } from 'sinon';
import { initialize } from '../module/initialize';
import { expectModuleRef } from '../tests/shared/expectModuleRef';
import { init } from './init';

describe('init', () => {
  it('should call `initialize()` function', () => {
    const initializeSpy = spy(initialize);
    const initModule = rewire<typeof import('./init')>('./init');
    const revert = initModule.__set__('initialize', initializeSpy);
    initModule.init({ name: 'AppModule' });
    expect(initializeSpy.calledOnce).to.be.true;
    revert();
  });

  it('should return a moduleRef', () => {
    const name = 'AppModule';
    const moduleRef = init({ name });
    expectModuleRef(moduleRef);
    expect(moduleRef.name).to.equal(name);
  });
});
