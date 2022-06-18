import { initialize } from '../module';
import { Module, ModuleRef, Override } from '../types';

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
 * @param override The override options.
 * @returns The module reference.
 */
export function init<T = unknown>(
  module: Module<T>,
  options?: T,
  override?: Override | Override['components']
): ModuleRef {
  return initialize(module, options, override).moduleRef;
}
