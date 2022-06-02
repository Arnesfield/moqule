import { ComponentId, ModuleRef } from '../types';
import { compare, createProperties } from '../utils';
import { resolveComponent, ResolvedComponent } from './resolveComponent';

export interface ComponentList {
  readonly exported: ResolvedComponent[];
  readonly module: ResolvedComponent[];
  readonly self: ResolvedComponent[];
}

export function createModuleRef(
  name: string,
  components: ComponentList
): ModuleRef {
  const moduleRef: ModuleRef = {} as ModuleRef;

  const getOptional: ModuleRef['getOptional'] = <T = unknown>(
    id: ComponentId
  ) => {
    if (typeof id === 'undefined') {
      throw new Error(
        `Cannot get "${id}" component from module "${name}". If this was not ` +
          'intentional, it might be caused by circular dependencies or imports.'
      );
    }
    const component = components.module.find(
      (component): component is ResolvedComponent<T> => {
        return compare(id, component.ref);
      }
    );
    return component ? resolveComponent(component) : undefined;
  };

  const get: ModuleRef['get'] = <T = unknown>(id: ComponentId<T>) => {
    const value = getOptional<T>(id);
    if (typeof value === 'undefined') {
      const componentName = typeof id === 'string' ? id : id.name;
      throw new Error(
        `Component "${componentName}" is not found in module "${name}".\n` +
          ` - Component needs to be registered in the module "${name}" components.\n` +
          ' - If the component is intended to be "undefined", ' +
          `consider using "moduleRef.getOptional(${componentName})" instead.\n` +
          ' - If the component comes from an imported module, it needs to be exported from that module.\n' +
          ' - If the component is provided by an ancestor module, ' +
          `module "${name}" should include it in "inject" options.\n`
      );
    }
    return value;
  };

  Object.defineProperties(
    moduleRef,
    createProperties({ name, get, getOptional })
  );
  return moduleRef;
}
