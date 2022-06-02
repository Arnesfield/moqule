import { compile, CompileResult } from '../compiler';
import { resolveComponent } from '../module';
import { Module, ModuleMetadata } from '../types';
import { createProperties } from '../utils';

export type CreateModuleMetadata<T = unknown> =
  | ModuleMetadata
  | ((options: T | undefined) => ModuleMetadata);

export type CreateModuleOptions<T = unknown> =
  | { name: string; register?: false; metadata: CreateModuleMetadata<T> }
  | { name: string; register: true; metadata(options: T): ModuleMetadata };

export function moqule<T = unknown>(options: CreateModuleOptions<T>): Module<T>;

export function moqule<T = unknown>(
  name: string,
  metadata: CreateModuleMetadata<T>
): Module<T>;

export function moqule<T = unknown>(
  _name: string | CreateModuleOptions<T>,
  _metadata: CreateModuleMetadata<T> = {}
): Module<T> {
  const module = {} as Module<T>;
  const opts: CreateModuleOptions<T> =
    typeof _name === 'string' ? { name: _name, metadata: _metadata } : _name;
  const { name, register: requireOptions } = opts;
  const getMetadata = opts.metadata as CreateModuleMetadata<T>;

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

  // try to be as sync as possible
  const resolveComponents = (components: CompileResult['components']) => {
    const resolveSync = () => {
      for (const component of components.sync) {
        resolveComponent(component);
      }
    };
    if (components.async.length === 0) {
      resolveSync();
      return;
    }
    const promises = components.async.map(component => {
      resolveComponent(component);
      return component.asyncValue;
    });
    return Promise.all(promises).then(() => resolveSync());
  };

  const resolve: Module<T>['resolve'] = async options => {
    const { compiled, components } = compile(module.register(options as T));
    await resolveComponents(components);
    return compiled.moduleRef;
  };

  const resolveSync: Module<T>['resolveSync'] = options => {
    const { compiled, components } = compile(module.register(options as T));
    resolveComponents(components);
    return compiled.moduleRef;
  };

  Object.defineProperties(
    module,
    createProperties({ name, metadata, register, resolve, resolveSync })
  );
  return module;
}
