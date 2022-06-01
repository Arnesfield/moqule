import { compile } from '../compiler';
import { resolveComponent } from '../module';
import { Module, ModuleMetadata } from '../types';
import { createProperties } from '../utils';

export function createModule<T = unknown>(
  name: string,
  metadata: ModuleMetadata
): Module<T>;

export function createModule<T = unknown>(
  name: string,
  metadata: (options: T | undefined) => ModuleMetadata
): Module<T>;

export function createModule<T = unknown>(
  name: string,
  getMetadata: ModuleMetadata | ((options: T | undefined) => ModuleMetadata)
): Module<T> {
  const module = {} as Module<T>;

  const metadata: Module<T>['metadata'] = options => {
    return typeof getMetadata === 'function'
      ? getMetadata(options)
      : getMetadata;
  };

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
    createProperties({ name, metadata, register, resolve })
  );
  return module;
}
