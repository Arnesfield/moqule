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

/**
 * Go through and resolve the components of module instances.
 * @param instances The module instances.
 */
export async function resolveComponents(
  instances: ModuleInstance[]
): Promise<void> {
  // save async values to promises, sync components are resolved after
  const sync: { component: ComponentRef; moduleRef: ModuleRef }[] = [];
  const promises: (Promise<unknown> | undefined)[] = [];
  for (const { components, moduleRef } of instances) {
    for (const component of components.self) {
      if (component.type !== 'async') {
        sync.push({ component, moduleRef });
        continue;
      }
      resolveComponent(component, moduleRef);
      promises.push(component.asyncValue);
    }
  }
  // make sure to await only if there are promises to resolve
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  for (const { component, moduleRef } of sync) {
    resolveComponent(component, moduleRef);
  }
}
