import { ForwardRef } from '../types/component.types';
import { ComponentRef, ModuleInstance } from '../types/instance.types';

/**
 * Resolve the component value.
 * @param component The component reference.
 * @returns The component value.
 */
export function resolveComponent<T = unknown>(
  component: ComponentRef<T>
): Awaited<T> {
  if (component.resolved) {
    return component.value as Awaited<T>;
  }
  component.resolved = true;
  const { factory, ref, type } = component;
  if (type === 'value') {
    if (typeof factory === 'function') {
      component.value = factory();
    }
  } else if (type === 'async') {
    // handle async
    const promise = (component.asyncValue = Promise.resolve(
      typeof factory === 'function' ? factory() : ref()
    ));
    promise.then(result => {
      component.value = result;
      delete component.asyncValue;
    });
  } else {
    const forwardRef: ForwardRef<T> = value => {
      component.value = value;
      return component.moduleRef;
    };
    component.value =
      typeof factory === 'function'
        ? factory(forwardRef)
        : type === 'class'
        ? new ref(forwardRef)
        : ref(forwardRef);
  }
  delete component.factory;
  return component.value as Awaited<T>;
}

function iterate(instances: ModuleInstance[], async: boolean) {
  const promises: (Promise<unknown> | undefined)[] = [];
  for (const { components } of instances) {
    for (const component of components.self) {
      if (async === (component.type === 'async')) {
        resolveComponent(component);
        async && promises.push(component.asyncValue);
      }
    }
  }
  return promises;
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
  const promises = iterate(instances, true);
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  iterate(instances, false);
  callback();
}
