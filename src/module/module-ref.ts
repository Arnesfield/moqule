import { ComponentId, ModuleRef } from '../types';
import { ComponentRef } from '../types/instance.types';
import { compare, defineProperties } from '../utils';
import { resolveComponent } from './component';

/**
 * Create a module reference.
 * @param name The module name.
 * @param components The module components (`ComponentList.module`).
 * @returns The module reference.
 */
export function createModuleRef(
  name: string,
  components: ComponentRef[],
  listeners: (() => void)[]
): ModuleRef {
  const getOptional: ModuleRef['getOptional'] = <T = unknown>(
    id: ComponentId<T>
  ) => {
    if (typeof id === 'undefined') {
      throw new Error(
        `Module "${name}" cannot find component "${id}". If this is not ` +
          'intentional, it might be caused by circular dependencies or imports.'
      );
    }
    const component = components.find(
      (component): component is ComponentRef<T> => compare(id, component.ref)
    );
    return component ? resolveComponent(component) : undefined;
  };

  const get: ModuleRef['get'] = <T = unknown>(id: ComponentId<T>) => {
    const value = getOptional<T>(id);
    if (typeof value !== 'undefined') {
      return value;
    }
    const wrap = typeof id === 'string';
    const componentName = wrap ? id : id.name;
    const wrappedName = wrap ? `"${componentName}"` : componentName;
    throw new Error(
      `Module "${name}" cannot find component "${componentName}".\n` +
        ' - The component needs to be registered in the "components" array.\n' +
        ` - Use \`moduleRef.getOptional(${wrappedName})\` ` +
        'if the component can be "undefined".\n' +
        ' - If the component comes from an imported module, ' +
        'it needs to be exported from that module.\n' +
        ' - If the component is provided by an ancestor module, ' +
        `module "${name}" should include it in "inject" options.\n` +
        ' - If async components were registered, make sure to use ' +
        '`moqule.async(module)` instead.'
    );
  };

  const onInit: ModuleRef['onInit'] = callback => {
    listeners.push(callback);
  };

  return defineProperties({} as ModuleRef, { name, get, getOptional, onInit });
}
