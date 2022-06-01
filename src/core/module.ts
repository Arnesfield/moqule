import { compile, CompiledModule } from '../compiler';
import { resolveComponent } from '../module';
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

  // TODO: remove all listeners?
  const emit = async (modules: CompiledModule[]) => {
    // call on init listeners
    const promises: (void | Promise<void>)[] = [];
    for (const compiled of modules) {
      const { data, moduleRef } = compiled;
      promises.push(
        ...data.listeners.init.map(listener => listener(moduleRef))
      );
    }
    await Promise.all(promises);
  };

  const resolveAllComponents = (modules: CompiledModule[]) => {
    for (const compiled of modules) {
      for (const component of compiled.data.components.self) {
        resolveComponent(component);
      }
    }
  };

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
    resolveAllComponents(result.modules);
    await emit(result.modules);
    return moduleRef;
  };

  Object.defineProperties(
    module,
    createProperties({ name, options, register, resolve })
  );
  return module;
}
