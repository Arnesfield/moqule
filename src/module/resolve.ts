import { register } from '../core/register';
import { Module, ModuleRef } from '../types';
import { ModuleInstance } from '../types/instance.types';
import { compile } from './compile';
import { resolveComponents } from './component';
import { inject } from './inject';

export interface ResolveResult {
  readonly moduleRef: ModuleRef;
  readonly components: Promise<void>;
}

/**
 * Set up components of the module declaration
 * and its submodules based on their metadata.
 * @param module The module declaration to instantiate.
 * @param options The register options.
 * @returns The module reference and all available components.
 */
export function resolve<T = unknown>(
  module: Module<T>,
  options: T
): ResolveResult {
  // compile and inject provided components
  const instances: ModuleInstance[] = [];
  const { moduleRef } = compile(register(module, options), instances);
  inject(instances);
  return { moduleRef, components: resolveComponents(instances) };
}
