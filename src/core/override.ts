import { COMPONENT_TYPES } from '../constants/componentTypes.constant';
import { initialize } from '../module/initialize';
import { ForwardRef } from '../types/component.types';
import { ComponentFactory } from '../types/componentFactory.types';
import { Override } from '../types/override.types';
import { Ref } from '../types/ref.types';
import { defineProperties } from '../utils/defineProperties';

/**
 * Create an object that can override component values.
 * @returns The override object.
 */
export function override(): Override {
  const override = { components: [] as ComponentFactory[] } as Override;
  for (const type of COMPONENT_TYPES) {
    override[type] = <T = unknown>(
      ref: Ref,
      factory: (forwardRef: ForwardRef<T>) => any
    ) => {
      override.components.push({ type, ref, factory } as ComponentFactory<T>);
      return override;
    };
  }
  // similar to `init()` and `initAsync()` but with override components
  override.init = (module, options) => {
    return initialize(module, options, override.components).moduleRef;
  };
  override.initAsync = async (module, options) => {
    const init = initialize(module, options, override.components);
    await init.components;
    return init.moduleRef;
  };
  return defineProperties(override, override);
}
