import { ModuleMetadata } from './types';

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
