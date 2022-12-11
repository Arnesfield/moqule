import { Module } from '../types/module.types';
import { Ref } from '../types/ref.types';

/**
 * Compare module, component, componentRef, name, or symbol.
 * @param a Value to compare.
 * @param b Value to compare.
 * @returns Boolean which determines if `a` and `b` match.
 */
export function compare(
  a: Module | Ref | Ref[],
  b: Module | Ref | Ref[]
): boolean {
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (typeof a === typeof b && !aArr && !bArr) {
    return a === b;
  }
  const aRefs = aArr ? a : typeof a === 'object' ? [a.name] : [a];
  const bRefs = bArr ? b : typeof b === 'object' ? [b.name] : [b];
  return aRefs.some(aRef => bRefs.includes(aRef));
}
