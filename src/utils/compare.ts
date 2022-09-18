import { Component } from '../types/component.types';
import { ComponentRef } from '../types/instance.types';
import { Module } from '../types/module.types';

/**
 * Compare module, component, componentRef, name, or symbol.
 * @param a Value to compare.
 * @param b Value to compare.
 * @returns Boolean which determines if `a` and `b` match.
 */
export function compare(
  a: string | symbol | Module | Component | ComponentRef['refs'],
  b: string | symbol | Module | Component | ComponentRef['refs']
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
