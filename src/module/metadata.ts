import { Module, ModuleMetadata } from '../types';
import { ModuleWithMetadata } from '../types/module.types';

function isMetadata(module: any): module is ModuleWithMetadata {
  return typeof module.register !== 'function';
}

/**
 * Get the module metadata.
 * @param module The module declaration.
 * @param options The register options.
 * @returns The module metadata.
 */
export function getMetadata<T = unknown>(
  module: Module<T>,
  options: T
): ModuleMetadata {
  if (isMetadata(module)) {
    return module;
  } else if (module.register.length > 0 && typeof options === 'undefined') {
    throw new Error(`Module "${module.name}" requires register options.`);
  }
  return module.register(options);
}
