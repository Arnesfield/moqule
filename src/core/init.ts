import { initialize } from '../module';
import { Module, ModuleRef } from '../types';

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
 * @returns The module reference.
 */
export function init<T = unknown>(module: Module<T>, options?: T): ModuleRef {
  return initialize(module, options).moduleRef;
}

/**
 * Initialize all modules and components.
 *
 * All async components are resolved before the promise is fulfilled.
 *
 * You may use `init(module, options?)` if no module is using async components.
 * @template T The register options type.
 * @param module The module declaration.
 * @param options The register options.
 * @returns The module reference.
 */
export async function initAsync<T = unknown>(
  module: Module<T>,
  options?: T
): Promise<ModuleRef> {
  const init = initialize(module, options);
  await init.components;
  return init.moduleRef;
}
