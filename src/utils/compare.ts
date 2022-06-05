import { ComponentId, Module } from '../types';

/**
 * Compare module, component, or name.
 * @param a Module, component, or name.
 * @param b Module, component, or name.
 * @returns Boolean which determines if `a` and `b` matches.
 */
export function compare(
  a: Module | ComponentId,
  b: Module | ComponentId
): boolean {
  if (typeof a === typeof b) {
    return a === b;
  }
  // compare by name
  const aName = typeof a === 'string' ? a : a.name;
  const bName = typeof b === 'string' ? b : b.name;
  return aName === bName;
}
