import { initialize } from '../module';
import { Module, ModuleRef, Override } from '../types';

/**
 * Initialize all modules and components.
 *
 * All async components are resolved before the promise is fulfilled.
 *
 * You may use `init(module, options?)` if no module is using async components.
 * @template T The register options type.
 * @param module The module declaration.
 * @param options The register options.
 * @param override The override options.
 * @returns The module reference.
 */
export async function initAsync<T = unknown>(
  module: Module<T>,
  options?: T,
  override?: Override | Override['components']
): Promise<ModuleRef> {
  const init = initialize(module, options, override);
  await init.components;
  return init.moduleRef;
}
