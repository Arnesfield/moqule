import { compile, CompileResult } from '../compiler';
import { resolveComponent } from '../module';
import { Module, ModuleMetadata } from '../types';
import { createProperties } from '../utils';

/**
 * Create module metadata.
 * @template T The register options type.
 */
export type CreateModuleMetadata<T = unknown> =
  | ModuleMetadata
  | ((options: T | undefined) => ModuleMetadata);

/**
 * Create module options.
 * @template T The register options type.
 */
export type CreateModuleOptions<T = unknown> =
  | {
      /**
       * The module name.
       */
      name: string;
      /**
       * Determines if register options is required.
       */
      register?: false;
      /**
       * The module metadata.
       */
      metadata: CreateModuleMetadata<T>;
    }
  | {
      /**
       * The module name.
       */
      name: string;
      /**
       * Determines if register options is required.
       */
      register: true;
      /**
       * Get the module metadata.
       * @param options The register options.
       * @returns The module metadata.
       */
      metadata(options: T): ModuleMetadata;
    };

/**
 * Create a module declaration.
 * @template T The register options type.
 * @param options The create module options.
 * @returns The module declaration.
 */
export function moqule<T = unknown>(options: CreateModuleOptions<T>): Module<T>;

/**
 * Create a module declaration.
 * @template T The register options type.
 * @param name The module name.
 * @param metadata The module metadata.
 * @returns The module declaration.
 */
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

  const resolveComponents = async (components: CompileResult['components']) => {
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
    await Promise.all(promises);
    resolveSync();
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
