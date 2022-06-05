import { Module, RegisteredModule } from '../types';

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
