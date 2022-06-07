import { initialize } from '../module';
import { Module, ModuleRef } from '../types';
import { defineProperties } from '../utils';

/**
 * The `moqule` function.
 */
export interface Moqule {
  /**
   * Initialize all modules and components.
   *
   * All async components are resolved asynchronously.
   *
   * You may use `moqule.async(module, options?)`
   * if at least one module is using async components.
   * @template T The register options type.
   * @param module The module declaration.
   * @param options The register options.
   * @returns The module reference.
   */
  <T = unknown>(module: Module<T>, options?: T): ModuleRef;
  /**
   * Initialize all modules and components.
   *
   * All async components are resolved before the promise is fulfilled.
   *
   * You may use `moqule(module, options?)` if no module is using async components.
   * @template T The register options type.
   * @param module The module declaration.
   * @param options The register options.
   * @returns The module reference.
   */
  async<T = unknown>(module: Module<T>, options?: T): Promise<ModuleRef>;
}

/**
 * The `moqule` function.
 */
const moqule = function <T = unknown>(module: Module<T>, options?: T) {
  return initialize(module, options).moduleRef;
} as Moqule;

async function async<T = unknown>(
  module: Module<T>,
  options?: T
): Promise<ModuleRef> {
  const init = initialize(module, options);
  await init.components;
  return init.moduleRef;
}

defineProperties(moqule, { async });

export { moqule };
