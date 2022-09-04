import { expect } from 'chai';
import rewire from 'rewire';
import { SinonSpy, spy } from 'sinon';
import { COMPONENT_TYPES } from '../constants/componentTypes.constant';
import { initialize } from '../module/initialize';
import { expectModuleRef } from '../tests/shared/expectModuleRef';
import {
  AsyncComponent,
  Component,
  FunctionComponent
} from '../types/component.types';
import {
  AsyncComponentFactory,
  ClassComponentFactory,
  ComponentFactory,
  FunctionComponentFactory
} from '../types/componentFactory.types';
import { Override } from '../types/override.types';
import { override } from './override';

interface Value {
  value: number;
}

class ClassComponent {}
const classFactory: ClassComponentFactory<ClassComponent>['factory'] = () => {
  return new ClassComponent();
};

const functionComponent: FunctionComponent<Value> = () => ({ value: 1 });
const functionFactory: FunctionComponentFactory<Value>['factory'] = forward => {
  return functionComponent(forward);
};

const asyncComponent: AsyncComponent<Value> = async () => ({ value: 1 });
const asyncFactory: AsyncComponentFactory<Value>['factory'] = () => {
  return asyncComponent();
};

function expectOverrideObject(mocked: Override) {
  expect(mocked).to.be.an('object');
  expect(mocked).to.have.property('components').which.is.an('array');
  const properties = ['class', 'function', 'async', 'init', 'initAsync'];
  for (const property of properties) {
    expect(mocked).to.have.property(property).which.is.a('function');
  }
}

function expectComponent<T = unknown>(value: {
  type: typeof COMPONENT_TYPES[number];
  factory: ComponentFactory<T>['factory'];
  actual: Component<T>;
  expect: ComponentFactory<T>;
}) {
  expect(value.expect).to.have.property('type').that.equals(value.type);
  expect(value.expect).to.have.property('ref').that.equals(value.actual);
  expect(value.expect).to.have.property('factory').that.equals(value.factory);
}

describe('override', () => {
  it('should be a function', () => {
    expect(override).to.be.a('function');
  });

  it('should return an Override object', () => {
    const mocked = override();
    expectOverrideObject(mocked);
    expect(mocked.components).to.be.empty;
  });

  describe('class', () => {
    it('should handle class components', () => {
      const mocked = override();
      const value = mocked.class(ClassComponent, classFactory);
      expectOverrideObject(value);
      expect(mocked.components).to.have.lengthOf(1);
      expectComponent({
        type: 'class',
        factory: classFactory,
        actual: ClassComponent,
        expect: mocked.components[0]
      });
      mocked.class(ClassComponent, classFactory);
      expect(mocked.components).to.have.lengthOf(2);
    });
  });

  describe('function', () => {
    it('should handle function components', () => {
      const mocked = override();
      const value = mocked.function(functionComponent, functionFactory);
      expectOverrideObject(value);
      expect(mocked.components).to.have.lengthOf(1);
      expectComponent({
        type: 'function',
        factory: functionFactory,
        actual: functionComponent,
        expect: mocked.components[0]
      });
      mocked.function(functionComponent, functionFactory);
      expect(mocked.components).to.have.lengthOf(2);
    });
  });

  describe('async', () => {
    it('should handle async function components', () => {
      const mocked = override();
      const value = mocked.async(asyncComponent, asyncFactory);
      expectOverrideObject(value);
      expect(mocked.components).to.have.lengthOf(1);
      expectComponent({
        type: 'async',
        factory: asyncFactory,
        actual: asyncComponent,
        expect: mocked.components[0]
      });
      mocked.async(asyncComponent, asyncFactory);
      expect(mocked.components).to.have.lengthOf(2);
    });
  });

  describe('init', () => {
    it('should return a moduleRef', () => {
      const name = 'AppModule';
      const moduleRef = override().init({ name });
      expectModuleRef(moduleRef);
      expect(moduleRef.name).to.equal(name);
    });
  });

  describe('initAsync', () => {
    it('should return a Promise that resolves to a moduleRef', async () => {
      const name = 'AppModule';
      const promise = override().initAsync({ name });
      expect(promise).to.be.instanceOf(Promise);
      const moduleRef = await promise;
      expectModuleRef(moduleRef);
      expect(moduleRef.name).to.equal(name);
    });
  });

  describe('initialize methods', () => {
    const overrideModule = rewire<typeof import('./override')>('./override');
    const { override } = overrideModule;
    let revert: () => void;
    let initializeSpy: SinonSpy<
      Parameters<typeof initialize>,
      ReturnType<typeof initialize>
    >;
    function overrideComponents(mocked: Override) {
      mocked
        .class(ClassComponent, () => new ClassComponent())
        .function(functionComponent, functionFactory)
        .async(asyncComponent, asyncFactory);
    }

    beforeEach(() => {
      initializeSpy = spy(initialize);
      revert = overrideModule.__set__('initialize', initializeSpy);
    });

    afterEach(() => revert());

    describe('init', () => {
      it('should call `initialize()` function', () => {
        override().init({ name: 'AppModule' });
        expect(initializeSpy.calledOnce).to.be.true;
      });

      it('should handle override components', () => {
        const mocked = override();
        overrideComponents(mocked);
        mocked.init({ name: 'AppModule' });
        const components = initializeSpy.args[0][2];
        expect(components)
          .to.be.an('array')
          .and.to.have.lengthOf(mocked.components.length);
      });
    });

    describe('initAsync', () => {
      it('should call `initialize()` function', async () => {
        await override().initAsync({ name: 'AppModule' });
        expect(initializeSpy.calledOnce).to.be.true;
      });

      it('should handle override components', async () => {
        const mocked = override();
        overrideComponents(mocked);
        await mocked.initAsync({ name: 'AppModule' });
        const components = initializeSpy.args[0][2];
        expect(components)
          .to.be.an('array')
          .and.to.have.lengthOf(mocked.components.length);
      });
    });
  });
});
