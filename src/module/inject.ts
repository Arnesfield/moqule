import { ComponentId, Module } from '../types';
import { compare, isRegisteredModule } from '../utils';
import { ComponentRef, ModuleInstance } from './module.types';

type ModuleOrComponent<T = unknown> =
  | { readonly type: 'module'; readonly value: ModuleInstance<T> }
  | { readonly type: 'component'; readonly value: ComponentRef<T> };

function findModuleOrComponent<T = unknown>(
  instance: ModuleInstance<T>,
  match: Module<T> | ComponentId<T>,
  instances: ModuleInstance[]
): ModuleOrComponent<T> | undefined {
  // match component id
  const { components, metadata } = instance;
  const component =
    typeof match !== 'object'
      ? components.self.find(component => compare(match, component.ref))
      : undefined;
  if (component) {
    return { type: 'component', value: component as ComponentRef<T> };
  }
  // match string or module, make sure is imported from module metadata
  const isImported =
    (typeof match === 'string' || typeof match === 'object') &&
    (metadata.imports || []).some(imported => {
      const value = isRegisteredModule(imported) ? imported.module : imported;
      return compare(match, value);
    });
  const module = isImported
    ? instances.find(instance => compare(match, instance.module))
    : undefined;
  if (module) {
    return { type: 'module', value: module as ModuleInstance<T> };
  }
}

// includes module.components.self and imported.components.exported
function getProvidedComponents(
  instance: ModuleInstance,
  instances: ModuleInstance[]
): ComponentRef[] {
  // get all components to inject first
  const { name } = instance.module;
  const components: ComponentRef[] = [];
  for (const id of instance.metadata.provide || []) {
    const result = findModuleOrComponent(instance, id, instances);
    if (!result) {
      const label = typeof id === 'string' ? id : id.name;
      throw new Error(
        `Module "${name}" needs to import the module or ` +
          `component "${label}" in order to provide it.`
      );
    }
    const { type, value } = result;
    const all = type === 'module' ? value.components.exported : [value];
    components.push(...all);
  }
  return components;
}

function injectComponents(
  target: ModuleInstance,
  providedComponents: ComponentRef[]
) {
  // include only if in inject options and not yet injected
  const { components } = target;
  const injectOpts = target.metadata.inject || false;
  for (const component of providedComponents) {
    const shouldInject =
      typeof injectOpts === 'boolean'
        ? injectOpts
        : injectOpts.some(value => compare(value, component.ref));
    if (shouldInject && !components.module.includes(component)) {
      components.module.push(component);
    }
  }
}

/**
 * Inject provided components to descendants of module instances.
 * @param instances The module instances to apply component injection.
 */
export function inject(instances: ModuleInstance[]): void {
  for (const instance of instances) {
    const components = getProvidedComponents(instance, instances);
    if (components.length === 0) {
      continue;
    }
    for (const descendant of instance.descendants) {
      injectComponents(descendant, components);
    }
  }
}
