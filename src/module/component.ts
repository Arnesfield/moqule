import { ComponentRef, ModuleInstance } from '../types/instance.types';

// TODO: remove moduleRef from ComponentRef
function resolveComponent<T = unknown>(value: ComponentRef<T>): T {
  const { ref, type } = value;
  if (type !== 'async') {
    const { moduleRef } = value;
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

/**
 * Go through and resolve the components of module instances.
 * @param instances The module instances.
 */
export async function resolveComponents(
  instances: ModuleInstance[]
): Promise<void> {
  // save async values to promises, sync components are resolved after
  const sync: ComponentRef[] = [];
  const promises: (Promise<unknown> | undefined)[] = [];
  for (const instance of instances) {
    for (const component of instance.components.self) {
      if (component.type !== 'async') {
        sync.push(component);
        continue;
      }
      resolveComponent(component);
      promises.push(component.asyncValue);
    }
  }
  // make sure to await only if there are promises to resolve
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  for (const component of sync) {
    resolveComponent(component);
  }
}
