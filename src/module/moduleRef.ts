import { ComponentId, ModuleRef } from '../types';
import { compare, defineProperties } from '../utils';
import { ComponentRef } from './module.types';

/**
 * Create a module reference.
 * @param name The module name.
 * @param components The module components (`ComponentList.module`).
 * @returns The module reference.
 */
export function createModuleRef(
  name: string,
  components: ComponentRef[]
): ModuleRef {
  const moduleRef = {} as ModuleRef;

  const getOptional: ModuleRef['getOptional'] = <T = unknown>(
    id: ComponentId
  ) => {
    if (typeof id === 'undefined') {
      throw new Error(
        `Cannot get "${id}" component from module "${name}". If this was not ` +
          'intentional, it might be caused by circular dependencies or imports.'
      );
    }
    const component = components.find(
      (component): component is ComponentRef<T> => compare(id, component.ref)
    );
    return component?.value;
  };

  const get: ModuleRef['get'] = <T = unknown>(id: ComponentId<T>) => {
    const value = getOptional<T>(id);
    if (typeof value === 'undefined') {
      const wrap = typeof id === 'string';
      const componentName = wrap ? id : id.name;
      const wrappedName = wrap ? `"${componentName}"` : componentName;
      throw new Error(
        `Component "${componentName}" is not found in module "${name}".\n` +
          ` - Component needs to be registered in the module "${name}" components.\n` +
          ` - Consider using \`moduleRef.getOptional(${wrappedName})\` ` +
          'if the component is intended to be "undefined".\n' +
          ' - If the component comes from an imported module, it needs to be exported from that module.\n' +
          ' - If the component is provided by an ancestor module, ' +
          `module "${name}" should include it in "inject" options.\n`
      );
    }
    return value;
  };

  defineProperties(moduleRef, { name, get, getOptional });
  return moduleRef;
}
