import { Module, RegisteredModule } from '../types/module.types';

/**
 * Check if a module is a registered module or not.
 * @param module The module to check.
 * @returns Boolean which determines if a module is a registered module or not.
 */
export function isRegisteredModule<T = unknown>(
  module: Module<T> | RegisteredModule<T>
): module is RegisteredModule<T> {
  const value = module as any;
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.module === 'object'
  );
}
