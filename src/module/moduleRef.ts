import { ComponentId, ModuleRef } from '../types';
import { compare, createProperties } from '../utils';
import { ModuleData } from './moduleData';

export function createModuleRef(name: string, data: ModuleData): ModuleRef {
  const { listeners, components } = data;
  const moduleRef: ModuleRef = {} as ModuleRef;

  const getOptional: ModuleRef['getOptional'] = <T = unknown>(
    id: ComponentId
  ) => {
    if (typeof id === 'undefined') {
      throw new Error(
        `Cannot get "undefined" component from module "${name}". ` +
          'If this was not intentional, it could be caused by circular dependencies or imports.'
      );
    } else if (!data.compiled) {
      const componentName = typeof id === 'string' ? id : id.name;
      throw new Error(
        `Cannot get component "${componentName}" before module "${name}" is compiled.`
      );
    }
    const component = components.module.find(component => {
      return compare(id, component.ref);
    });
    return component?.value as T | undefined;
  };

  const get: ModuleRef['get'] = <T = unknown>(id: ComponentId) => {
    const value = getOptional<T>(id);
    if (!value) {
      const componentName = typeof id === 'string' ? id : id.name;
      throw new Error(
        `Component "${componentName}" is not found in module "${name}".\n` +
          ` - Component needs to be registered in the module "${name}" components.\n` +
          ' - If the component comes from an imported module, it needs to be exported from that module.\n' +
          ' - If the component is provided by an ancestor module, ' +
          `module "${name}" should include it in "inject" options.\n`
      );
    }
    return value;
  };

  const on: ModuleRef['on'] = (event, callback) => {
    listeners[event].push(callback);
    return moduleRef;
  };

  Object.defineProperties(
    moduleRef,
    createProperties({ name, get, getOptional, on })
  );
  return moduleRef;
}
