import { compile, CompiledModule } from '../compiler';
import { Module, ModuleOptions, ModuleRef } from '../types';
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

  const emit = async (event: 'init' | 'resolve', modules: CompiledModule[]) => {
    // call on init listeners
    const promises: (void | Promise<void>)[] = [];
    for (const compiled of modules) {
      const { data, moduleRef } = compiled;
      promises.push(
        ...data.listeners[event].map(listener => listener(moduleRef))
      );
      if (event === 'init') {
        compiled.data.resolved = true;
      }
    }
    await Promise.all(promises);
  };

  // TODO: implement component instance lazy creation
  const resolve: Module<T>['resolve'] = async (
    options?: T | ((ref: ModuleRef) => void | Promise<void>),
    onCreateRef?: (ref: ModuleRef) => void | Promise<void>
  ): Promise<ModuleRef> => {
    if (typeof options === 'function') {
      onCreateRef = options as (ref: ModuleRef) => void | Promise<void>;
      options = undefined;
    }
    // compile modules
    const result = compile(module.register(options as any));
    const { moduleRef } = result.compiled;
    // emit listeners
    await onCreateRef?.(moduleRef);
    await emit('init', result.modules);
    await emit('resolve', result.modules);
    return moduleRef;
  };

  Object.defineProperties(
    module,
    createProperties({ name, options, register, resolve })
  );
  return module;
}
