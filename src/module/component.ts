import { ModuleRef } from '../types';
import { ComponentRef, ModuleInstance } from '../types/instance.types';

/**
 * Resolve the component value.
 * @param component The component reference.
 * @param moduleRef The module reference.
 * @returns The component value.
 */
export function resolveComponent<T = unknown>(
  component: ComponentRef<T>,
  moduleRef: ModuleRef
): Awaited<T> {
  if (component.resolved) {
    return component.value as Awaited<T>;
  }
  component.resolved = true;
  const { ref, type } = component;
  if (type !== 'async') {
    component.value = type === 'class' ? new ref(moduleRef) : ref(moduleRef);
  } else {
    // handle async
    const promise = (component.asyncValue = Promise.resolve(ref()));
    promise.then(result => {
      component.value = result;
      delete component.asyncValue;
    });
  }
  return component.value as Awaited<T>;
}

function iterate(instances: ModuleInstance[], async: boolean) {
  const promises: (Promise<unknown> | undefined)[] = [];
  for (const { components, moduleRef } of instances) {
    for (const component of components.self) {
      if (async === (component.type === 'async')) {
        resolveComponent(component, moduleRef);
        async && promises.push(component.asyncValue);
      }
    }
  }
  return promises;
}

/**
 * Go through and resolve the components of module instances.
 * @param instances The module instances.
 */
export async function resolveComponents(
  instances: ModuleInstance[]
): Promise<void> {
  // resolve async components first if any
  const promises = iterate(instances, true);
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  iterate(instances, false);
}
