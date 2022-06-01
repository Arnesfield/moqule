import { compile } from '../compiler';
import { resolveComponent } from '../module';
import { Module, ModuleMetadata } from '../types';
import { createProperties } from '../utils';

export type CreateModuleMetadata<T = unknown> =
  | ModuleMetadata
  | ((options: T | undefined) => ModuleMetadata);

export function moqule<T = unknown>(
  name: string,
  metadata: CreateModuleMetadata<T>
): Module<T>;

export function moqule<T = unknown>(
  name: string,
  requireOptions: false,
  metadata: CreateModuleMetadata<T>
): Module<T>;

export function moqule<T = unknown>(
  name: string,
  requireOptions: true,
  metadata: (options: T) => ModuleMetadata
): Module<T>;

export function moqule<T = unknown>(
  name: string,
  requireOptions: boolean | CreateModuleMetadata<T>,
  getMetadata: CreateModuleMetadata<T> = {}
): Module<T> {
  const module = {} as Module<T>;
  if (
    requireOptions &&
    (typeof requireOptions === 'object' || typeof requireOptions === 'function')
  ) {
    getMetadata = requireOptions;
    requireOptions = false;
  }

  const metadata: Module<T>['metadata'] = options => {
    if (requireOptions && typeof options === 'undefined') {
      throw new Error(`Module "${module.name}" requires register options.`);
    }
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

export { moqule as createModule };
