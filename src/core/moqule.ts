import { resolve as resolveModule } from '../module';
import { Module, ModuleMetadata } from '../types';
import { defineProperties } from '../utils';

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
  const {
    name,
    register: requireOptions,
    metadata: getMetadata
  }: CreateModuleOptions<T> = typeof _name === 'string'
    ? { name: _name, metadata: _metadata }
    : _name;

  const metadata: Module<T>['metadata'] = (options: T) => {
    if (requireOptions && typeof options === 'undefined') {
      throw new Error(`Module "${name}" requires register options.`);
    }
    return typeof getMetadata === 'function'
      ? getMetadata(options)
      : getMetadata;
  };

  const register: Module<T>['register'] = options => ({ module, options });

  const resolve: Module<T>['resolve'] = async (options: T) => {
    const { moduleRef, components } = resolveModule(register(options));
    await components;
    return moduleRef;
  };

  const resolveSync: Module<T>['resolveSync'] = (options: T) => {
    return resolveModule(register(options)).moduleRef;
  };

  defineProperties(module, { name, metadata, register, resolve, resolveSync });
  return module;
}
