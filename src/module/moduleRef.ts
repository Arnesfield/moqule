import { Component } from '../types/component.types';
import { ComponentInstance, ComponentList } from '../types/instance.types';
import { ModuleRef } from '../types/moduleRef.types';
import { compare } from '../utils/compare';
import { defineProperties } from '../utils/defineProperties';
import { resolveComponent } from './component';

/**
 * Create a module reference.
 * @param name The module name.
 * @param list The component list.
 * @param onInit Callback to add module init listeners.
 * @returns The module reference.
 */
export function createModuleRef(
  name: string,
  list: ComponentList,
  onInit: ModuleRef['onInit']
): ModuleRef {
  const getOptional: ModuleRef['getOptional'] = <T = unknown>(
    id: string | symbol | Component<T>
  ) => {
    if (typeof id === 'undefined') {
      throw new Error(
        `Module "${name}" cannot find component "${id}". If this is not ` +
          'intentional, it might be caused by circular dependencies or imports.'
      );
    }
    // reference imported components by their exported refs
    const component =
      list.self.find(c => compare(id, c.refs)) ||
      list.imported.find(c => c.exportRefs && compare(id, c.exportRefs)) ||
      list.injected.find(c => c.provideRefs && compare(id, c.provideRefs));
    return component && resolveComponent(component as ComponentInstance<T>);
  };

  const get: ModuleRef['get'] = <T = unknown>(
    id: string | symbol | Component<T>
  ) => {
    const value = getOptional<T>(id);
    if (typeof value !== 'undefined') {
      return value;
    }
    const wrap = typeof id === 'string';
    const componentName =
      wrap || typeof id === 'symbol' ? id.toString() : id.name;
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
        '`moqule.initAsync(module)` instead.'
    );
  };

  return defineProperties({} as ModuleRef, { name, get, getOptional, onInit });
}
