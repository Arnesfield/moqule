import { Module, ModuleMetadata } from '../types';
import { ModuleWithMetadata } from '../types/module.types';

function isModuleWithMetadata(module: any): module is ModuleWithMetadata {
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
  if (isModuleWithMetadata(module)) {
    return module;
  }
  const { name, register } = module;
  if (register.length > 0 && typeof options === 'undefined') {
    throw new Error(`Module "${name}" requires register options.`);
  }
  return register(options);
}
