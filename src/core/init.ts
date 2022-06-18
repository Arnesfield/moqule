import { initialize } from '../module';
import { FactoryOptions, Module, ModuleRef } from '../types';

/**
 * Initialize all modules and components.
 *
 * All async components are resolved asynchronously.
 *
 * You may use `initAsync(module, options?)`
 * if at least one module is using async components.
 * @template T The register options type.
 * @param module The module declaration.
 * @param options The register options.
 * @param factory The component factory options.
 * @returns The module reference.
 */
export function init<T = unknown>(
  module: Module<T>,
  options?: T,
  factory?: FactoryOptions
): ModuleRef {
  return initialize(module, options, factory).moduleRef;
}
