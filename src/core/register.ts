import { Module, RegisteredModule } from '../types/module.types';

/**
 * Register options to the module declaration.
 * @param module The module declaration.
 * @param options The register options.
 * @returns The registered module.
 */
export function register<T = unknown>(
  module: Module<T>,
  options: T
): RegisteredModule<T> {
  return { module, options };
}
