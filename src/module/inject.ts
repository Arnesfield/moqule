import { Component, Module } from '../types';
import { ComponentRef, ModuleInstance } from '../types/instance.types';
import { compare, isRegisteredModule } from '../utils';

type ModuleOrComponent<T = unknown> =
  | { readonly module: ModuleInstance<T>; readonly component?: undefined }
  | { readonly module?: undefined; readonly component: ComponentRef<T> };

function findModuleOrComponent(
  instance: ModuleInstance,
  match: string | Module | Component,
  instances: ModuleInstance[]
): ModuleOrComponent | undefined {
  // match component id
  const { components } = instance;
  const component =
    typeof match !== 'object'
      ? components.self.find(component => compare(match, component.ref))
      : undefined;
  if (component) {
    return { component };
  }
  // match string or module, make sure is imported from module metadata
  const isImported =
    (typeof match === 'string' || typeof match === 'object') &&
    (instance.metadata.imports || []).some(imported => {
      const value = isRegisteredModule(imported) ? imported.module : imported;
      return compare(match, value);
    });
  const module = isImported
    ? instances.find(instance => compare(match, instance.module))
    : undefined;
  return module && { module };
}

// includes module.components.self and imported.components.exported
function getProvidedComponents(
  instance: ModuleInstance,
  instances: ModuleInstance[]
): ComponentRef[] {
  const components: ComponentRef[] = [];
  for (const id of instance.metadata.provide || []) {
    const result = findModuleOrComponent(instance, id, instances);
    if (!result) {
      const label = typeof id === 'string' ? id : id.name;
      throw new Error(
        `Module "${instance.module.name}" needs to import the ` +
          `module or component "${label}" in order to provide it.`
      );
    }
    const { component, module } = result;
    const all = module ? module.components.exported : [component];
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
    // get all components to inject first
    const components = getProvidedComponents(instance, instances);
    if (components.length === 0) {
      continue;
    }
    for (const descendant of instance.descendants) {
      injectComponents(descendant, components);
    }
  }
}
