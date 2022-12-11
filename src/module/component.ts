import { ForwardRef } from '../types/component.types';
import {
  ClassComponentInstance,
  ComponentInstance,
  FunctionComponentInstance,
  ModuleInstance
} from '../types/instance.types';

/**
 * Create a forward reference.
 * @param component The component instance.
 * @returns The forward reference.
 */
function createForwardRef<T = unknown>(
  component: ClassComponentInstance<T> | FunctionComponentInstance<T>
): ForwardRef<T> {
  return value => {
    component.value = value;
    return component.moduleRef;
  };
}

/**
 * Resolve the component value.
 * @param component The component instance.
 * @returns The component value.
 */
export function resolveComponent<T = unknown>(
  component: ComponentInstance<T>
): Awaited<T> {
  if (component.resolved) {
    return component.value as Awaited<T>;
  }
  component.resolved = true;
  const { factory, ref, type } = component;
  const hasFactory = typeof factory === 'function';
  if (type === 'value') {
    if (hasFactory) {
      component.value = factory();
    }
  } else if (type === 'async') {
    // handle async
    component.asyncValue = Promise.resolve(hasFactory ? factory() : ref());
    component.asyncValue.then(result => {
      component.value = result;
      delete component.asyncValue;
    });
  } else {
    const forwardRef = createForwardRef(component);
    component.value = hasFactory
      ? factory(forwardRef)
      : type === 'class'
      ? new ref(forwardRef)
      : ref(forwardRef);
  }
  delete component.factory;
  return component.value as Awaited<T>;
}

/**
 * Go through and resolve the components of module instances.
 * @param instances The module instances.
 * @param callback Run callback after resolving sync components.
 */
export async function resolveComponents(
  instances: ModuleInstance[],
  callback: () => void
): Promise<void> {
  // resolve async components first if any
  const promises: (Promise<unknown> | undefined)[] = [];
  for (const instance of instances) {
    for (const component of instance.components.self) {
      if (component.type === 'async') {
        resolveComponent(component);
        promises.push(component.asyncValue);
      }
    }
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  for (const instance of instances) {
    for (const component of instance.components.self) {
      if (component.type !== 'async') {
        resolveComponent(component);
      }
    }
  }
  callback();
}
