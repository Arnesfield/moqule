import { COMPONENT_TYPES } from '../constants';
import { Component, ComponentFactory, ForwardRef, Override } from '../types';
import { defineProperties } from '../utils';

/**
 * Create an object that can override component values.
 * @returns The override object.
 */
export function override(): Override {
  const override = { components: [] as Override['components'] } as Override;
  for (const type of COMPONENT_TYPES) {
    override[type] = <T = unknown>(
      ref: string | Component<T>,
      factory: (forwardRef: ForwardRef<T>) => any
    ) => {
      override.components.push({ type, ref, factory } as ComponentFactory<T>);
      return override;
    };
  }
  return defineProperties(override, override);
}
