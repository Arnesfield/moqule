import { COMPONENT_TYPES } from '../constants';
import { initialize } from '../module';
import { Component, ComponentFactory, ForwardRef, Mock } from '../types';
import { defineProperties } from '../utils';

/**
 * Create a Mock object that can mock or override component values.
 * @returns The mock object.
 */
export function mock(): Mock {
  const mock = { components: [] as ComponentFactory[] } as Mock;
  for (const type of COMPONENT_TYPES) {
    mock[type] = <T = unknown>(
      ref: string | Component<T>,
      factory: (forwardRef: ForwardRef<T>) => any
    ) => {
      mock.components.push({ type, ref, factory } as ComponentFactory<T>);
      return mock;
    };
  }
  // similar to `init()` and `initAsync()` but with mock components
  mock.init = (module, options) => {
    return initialize(module, options, mock.components).moduleRef;
  };
  mock.initAsync = async (module, options) => {
    const init = initialize(module, options, mock.components);
    await init.components;
    return init.moduleRef;
  };
  return defineProperties(mock, mock);
}
