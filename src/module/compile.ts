import { register } from '../core/register';
import {
  AsyncComponent,
  ComponentId,
  Module,
  ModuleRef,
  RegisteredModule
} from '../types';
import {
  ComponentList,
  ComponentRef,
  ModuleInstance
} from '../types/instance.types';
import { compare, isRegisteredModule } from '../utils';
import { getMetadata } from './metadata';
import { createModuleRef } from './module-ref';

function createInstance<T = unknown>(
  module: Module<T>,
  options: T | undefined,
  onInit: ModuleRef['onInit']
): ModuleInstance<T> {
  const metadata = getMetadata(module, options);
  const components: ComponentList = { exported: [], module: [], self: [] };
  const moduleRef = createModuleRef(module.name, components.module, onInit);
  return { module, moduleRef, metadata, components, descendants: [] };
}

// setup registered components of self
function setupComponents(instance: ModuleInstance): void {
  const { components, metadata } = instance;
  // only export non-modules
  const exports = (metadata.exports || []).filter(
    (id): id is ComponentId => typeof id !== 'object'
  );
  const saveComponent = (component: ComponentRef) => {
    components.self.push(component);
    components.module.push(component);
    const index = exports.findIndex(value => compare(value, component.ref));
    if (index > -1) {
      components.exported.push(component);
      exports.splice(index, 1);
    }
  };

  const moduleComponents = Array.isArray(metadata.components)
    ? { class: metadata.components }
    : metadata.components || {};
  const { moduleRef } = instance;
  for (const ref of moduleComponents.class || []) {
    saveComponent({ type: 'class', moduleRef, ref });
  }
  for (const type of ['function', 'async'] as const) {
    for (const value of moduleComponents[type] || []) {
      const obj = typeof value === 'function' ? { value } : value;
      for (const name in obj) {
        // cast as AsyncComponent so it works for both cases
        const ref = obj[name] as AsyncComponent | undefined;
        if (typeof ref === 'function') {
          saveComponent(
            type === 'async' ? { type, ref } : { type, moduleRef, ref }
          );
        }
      }
    }
  }

  if (exports.length === 0) {
    return;
  }
  // handle not exported
  const label = exports
    .map(value => {
      const name = typeof value === 'string' ? value : value.name;
      return `"${name}"`;
    })
    .join(', ');
  throw new Error(
    `Module "${moduleRef.name}" cannot export missing or duplicate components [${label}].`
  );
}

/**
 * Compile and resolve the components of the module declaration and its submodules.
 * @param declaration The module declaration.
 * @param instances The module instances. Created instances are pushed to this array.
 * @param onInit Callback to add module init listeners.
 * @returns The created module instance.
 */
export function compile<T = unknown>(
  declaration: Module<T> | RegisteredModule<T>,
  instances: ModuleInstance[],
  onInit: ModuleRef['onInit']
): ModuleInstance<T> {
  const isRegistered = isRegisteredModule(declaration);
  const { module, options } = isRegistered
    ? declaration
    : register(declaration, undefined);
  // skip if already compiled
  const existingInstance = instances.find(
    (instance): instance is ModuleInstance<T> => instance.module === module
  );
  if (existingInstance) {
    if (!isRegistered) {
      return existingInstance;
    }
    // make sure consumer cannot register more than once
    throw new Error(
      `Module "${module.name}" was already compiled and cannot be registered with options.`
    );
  }

  // create module instance
  const instance = createInstance(module, options, onInit);
  instances.push(instance);
  // handle components and submodules
  setupComponents(instance);
  // compile all imported modules and get components
  // also save its descendants for injection later
  const descendants: ModuleInstance[] = [];
  const { exports = [], imports = [] } = instance.metadata;
  for (const imported of imports) {
    const compiled = compile(imported, instances, onInit);
    descendants.push(compiled, ...compiled.descendants);
    const shouldExport = exports.some(value => {
      return (
        (typeof value === 'string' || typeof value === 'object') &&
        compare(value, compiled.module)
      );
    });
    // get all exported components from imported module
    for (const component of compiled.components.exported) {
      instance.components.module.push(component);
      // re-export components from exported modules
      if (shouldExport) {
        instance.components.exported.push(component);
      }
    }
  }

  // make sure descendants are unique
  if (descendants.length > 0) {
    instance.descendants.push(...new Set(descendants));
  }
  // make sure instance descendants do not contain itself
  const index = instance.descendants.indexOf(instance);
  if (index > -1) {
    instance.descendants.splice(index, 1);
  }
  return instance;
}
