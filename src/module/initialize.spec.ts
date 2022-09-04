import { expect } from 'chai';
import { spy } from 'sinon';
import { expectModuleRef } from '../tests/shared/expectModuleRef';
import {
  AsyncComponent,
  ForwardRef,
  FunctionComponent
} from '../types/component.types';
import { Module } from '../types/module.types';
import { initialize } from './initialize';

interface Value {
  value: number;
}

// test internal function `initialize`
// used in `init`, `initAsync`, and `override` initialize methods
describe('initialize', () => {
  it('should be a function', () => {
    expect(initialize).to.be.a('function');
  });

  it('should require a name', () => {
    let error: Error | undefined;
    try {
      initialize({ name: undefined as any }, undefined);
    } catch (err: unknown) {
      error = err as Error;
    }
    expect(error).to.be.an('Error');

    error = undefined;
    try {
      initialize({ name: 'AppModule' }, undefined);
    } catch (err: unknown) {
      error = err as Error;
    }
    expect(error).to.be.undefined;
  });

  it('should return an object with moduleRef and components to resolve', async () => {
    const result = initialize({ name: 'AppModule' }, undefined);
    expect(result).to.have.property('moduleRef').which.is.an('object');
    expect(result).to.have.property('components').which.is.a('promise');
    expectModuleRef(result.moduleRef);
    await result.components;
  });

  describe('class components', () => {
    let instances = 0;
    let args: IArguments | undefined;
    let forwardRef: ForwardRef<ClassComponent> | undefined;
    class ClassComponent {
      constructor(forward: ForwardRef<ClassComponent>) {
        instances++;
        // eslint-disable-next-line prefer-rest-params
        args = arguments;
        forwardRef = forward;
      }
    }

    afterEach(() => {
      instances = 0;
      args = undefined;
      forwardRef = undefined;
    });

    it('should instantiate class components', async () => {
      expect(instances).to.equal(0);
      initialize(
        { name: 'AppModule', components: [ClassComponent] },
        undefined
      );
      expect(instances).to.equal(1);
    });

    it('should instantiate class component object', async () => {
      expect(instances).to.equal(0);
      initialize(
        { name: 'AppModule', components: [{ class: ClassComponent }] },
        undefined
      );
      expect(instances).to.equal(1);
    });

    it('should receive `forwardRef` as only constructor argument', async () => {
      expect(args).to.be.undefined;
      expect(forwardRef).to.be.undefined;
      initialize(
        { name: 'AppModule', components: [ClassComponent] },
        undefined
      );
      expect(args).to.have.lengthOf(1);
      expect(forwardRef).to.be.a('function');
    });

    it('should be accessible via `moduleRef.get()`', () => {
      const { moduleRef } = initialize(
        { name: 'AppModule', components: [ClassComponent] },
        undefined
      );
      const component: ClassComponent = moduleRef.get(ClassComponent);
      expect(component).to.be.instanceOf(ClassComponent);
    });
  });

  describe('function components', () => {
    let calls = 0;
    let args: IArguments | undefined;
    let forwardRef: ForwardRef<Value> | undefined;
    const functionComponent: FunctionComponent<Value> = function (forward) {
      calls++;
      // eslint-disable-next-line prefer-rest-params
      args = arguments;
      forwardRef = forward;
      return { value: 1 };
    };

    afterEach(() => {
      calls = 0;
      args = undefined;
      forwardRef = undefined;
    });

    it('should call function components', () => {
      expect(calls).to.equal(0);
      initialize(
        { name: 'AppModule', components: [{ function: functionComponent }] },
        undefined
      );
      expect(calls).to.equal(1);
    });

    it('should receive `forwardRef` as only function argument', async () => {
      expect(args).to.be.undefined;
      expect(forwardRef).to.be.undefined;
      initialize(
        { name: 'AppModule', components: [{ function: functionComponent }] },
        undefined
      );
      expect(args).to.have.lengthOf(1);
      expect(forwardRef).to.be.a('function');
    });

    it('should be accessible via `moduleRef.get()`', () => {
      const { moduleRef } = initialize(
        { name: 'AppModule', components: [{ function: functionComponent }] },
        undefined
      );
      const value: Value = moduleRef.get(functionComponent);
      expect(value).to.deep.equal({ value: 1 });
    });
  });

  describe('async components', () => {
    let calls = 0;
    let args: IArguments | undefined;
    const asyncComponent: AsyncComponent<Value> = function () {
      return new Promise<Value>(resolve => {
        setImmediate(() => {
          calls++;
          // eslint-disable-next-line prefer-rest-params
          args = arguments;
          resolve({ value: 1 });
        });
      });
    };

    afterEach(() => {
      calls = 0;
      args = undefined;
    });

    it('should call async components', async () => {
      expect(calls).to.equal(0);
      const { components } = initialize(
        { name: 'AppModule', components: [{ async: asyncComponent }] },
        undefined
      );
      expect(calls).to.equal(0);
      await components;
      expect(calls).to.equal(1);
    });

    it('should not receive any function arguments', async () => {
      expect(args).to.be.undefined;
      const { components } = initialize(
        { name: 'AppModule', components: [{ async: asyncComponent }] },
        undefined
      );
      expect(args).to.be.undefined;
      await components;
      expect(args).to.have.lengthOf(0);
    });

    it('should be accessible via `moduleRef.get()`', async () => {
      const { components, moduleRef } = initialize(
        { name: 'AppModule', components: [{ async: asyncComponent }] },
        undefined
      );
      let value: Value | undefined;
      let error: Error | undefined;
      try {
        value = moduleRef.get(asyncComponent);
      } catch (err: unknown) {
        error = err as Error;
      }
      expect(value).to.be.undefined;
      expect(error).to.be.an('Error');
      await components;
      value = moduleRef.get(asyncComponent);
      expect(value).to.deep.equal({ value: 1 });
    });
  });

  describe('register', () => {
    it('should accept a register callback', () => {
      const register = spy(() => ({}));
      const module: Module<Record<string, any>> = {
        name: 'AppModule',
        register
      };
      initialize(module, undefined);
      expect(register.calledOnce).to.be.true;
    });

    it('should require register options', () => {
      const opts = {};
      const register = spy(options => {
        expect(options).to.equal(opts);
        return {};
      });
      const module: Module<Record<string, any>> = {
        name: 'AppModule',
        register
      };

      expect(register.calledOnce).to.be.false;
      let error: Error | undefined;
      try {
        initialize(module, undefined);
      } catch (err: unknown) {
        error = err as Error;
      }
      expect(error).to.be.an('Error');
      expect(register.calledOnce).to.be.false;
      initialize(module, opts);
      expect(register.calledOnce).to.be.true;
    });
  });

  // TODO:
  // describe('override', () => {});
});
