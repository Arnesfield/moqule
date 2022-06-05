import { ModuleRef } from '../types';
import { ComponentRef, ModuleInstance } from '../types/instance.types';

function resolveComponent<T = unknown>(
  value: ComponentRef<T>,
  moduleRef: ModuleRef
): T {
  const { ref, type } = value;
  if (type !== 'async') {
    value.value = type === 'class' ? new ref(moduleRef) : ref(moduleRef);
  } else {
    // handle async
    const promise = (value.asyncValue = Promise.resolve(ref()));
    promise.then(result => {
      value.value = result;
      delete value.asyncValue;
    });
  }
  return value.value as T;
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
