import { ModuleMetadata } from './metadata.types';

/**
 * Base module properties.
 */
export interface BaseModule {
  /**
   * The module name.
   */
  name: string;
}

/**
 * Module with metadata.
 */
export interface ModuleWithMetadata extends BaseModule, ModuleMetadata {
  register?: undefined;
}

/**
 * Module with register callback.
 * @template T The register options type.
 */
export interface ModuleWithRegister<T = unknown> extends BaseModule {
  /**
   * Setup the module metadata with register options.
   * @param options The register options.
   * @returns The module metadata.
   */
  register(options: T): ModuleMetadata;
}

/**
 * Module declaration.
 * @template T The register options type.
 */
export type Module<T = unknown> = ModuleWithMetadata | ModuleWithRegister<T>;

/**
 * Registered module.
 * @template T The register options type.
 */
export interface RegisteredModule<T = unknown> {
  /**
   * The registered module.
   */
  readonly module: Module<T>;
  /**
   * The register options.
   */
  readonly options: T;
}
