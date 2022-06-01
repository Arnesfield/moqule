import { compile } from '../compiler';
import { resolveComponent } from '../module';
import { Module, ModuleOptions } from '../types';
import { createProperties } from '../utils';

export function createModule<T = unknown>(
  name: string,
  options: ModuleOptions
): Module<T>;

export function createModule<T = unknown>(
  name: string,
  options: (registerOptions: T | undefined) => ModuleOptions
): Module<T>;

export function createModule<T = unknown>(
  name: string,
  options: Module<T>['options']
): Module<T> {
  const module = {} as Module<T>;

  const register: Module<T>['register'] = options => {
    return { options, module };
  };

  const resolve: Module<T>['resolve'] = (options?: T) => {
    // compile modules
    const { compiled, modules } = compile(module.register(options as T));
    // resolve all components
    for (const compiled of modules) {
      for (const component of compiled.components.self) {
        resolveComponent(component);
      }
    }
    return compiled.moduleRef;
  };

  Object.defineProperties(
    module,
    createProperties({ name, options, register, resolve })
  );
  return module;
}
