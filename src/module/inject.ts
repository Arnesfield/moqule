import { Component } from '../types/component.types';
import { ComponentInstance, ModuleInstance } from '../types/instance.types';
import { Module } from '../types/module.types';
import { compare } from '../utils/compare';
import { isRegisteredModule } from '../utils/isRegisteredModule';

type ModuleOrComponent<T = unknown> =
  | { readonly module: ModuleInstance<T>; readonly component?: never }
  | { readonly module?: never; readonly component: ComponentInstance<T> };

function findModuleOrComponent(
  instance: ModuleInstance,
  id: string | symbol | Module | Component,
  instances: ModuleInstance[]
): ModuleOrComponent | undefined {
  // match component id
  const { components } = instance;
  const component =
    typeof id !== 'object'
      ? components.self.find(component => compare(id, component.refs))
      : undefined;
  if (component) {
    return { component };
  }
  // match string or module, make sure is imported from module metadata
  const isImported =
    (typeof id === 'string' || typeof id === 'object') &&
    (instance.metadata.imports || []).some(imported => {
      const value = isRegisteredModule(imported) ? imported.module : imported;
      return compare(id, value);
    });
  const module = isImported
    ? instances.find(instance => compare(id, instance.module))
    : undefined;
  return module && { module };
}

// includes module.components.self and imported.components.exported
function getProvidedComponents(
  instance: ModuleInstance,
  instances: ModuleInstance[]
): ComponentInstance[] {
  const components: ComponentInstance[] = [];
  for (const id of instance.metadata.provide || []) {
    const result = findModuleOrComponent(instance, id, instances);
    if (!result) {
      const label =
        typeof id === 'string' || typeof id === 'symbol'
          ? id.toString()
          : id.name;
      throw new Error(
        `Module "${instance.module.name}" needs to import the ` +
          `module or component "${label}" in order to provide it.`
      );
    }
    const { component, module } = result;
    const all = module ? module.components.exported : [component];
    components.push(...all);
    // set provideRefs of component
    for (const provided of all) {
      provided.provideRefs = (
        !module ? [id] : provided.exportRefs && [...provided.exportRefs]
      ) as typeof provided.provideRefs;
    }
  }
  return components;
}

function injectComponents(
  target: ModuleInstance,
  providedComponents: ComponentInstance[]
) {
  // include only if in inject options and not yet injected
  const { components } = target;
  const injectOpts = target.metadata.inject || false;
  for (const component of providedComponents) {
    const shouldInject =
      typeof injectOpts === 'boolean'
        ? injectOpts
        : injectOpts.some(
            id => component.provideRefs && compare(id, component.provideRefs)
          );
    if (shouldInject && !components.injected.includes(component)) {
      components.injected.push(component);
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
    if (components.length > 0) {
      for (const descendant of instance.descendants) {
        injectComponents(descendant, components);
      }
    }
  }
}
