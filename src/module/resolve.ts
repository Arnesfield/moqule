import { ModuleRef, RegisteredModule } from '../types';
import { compile } from './compile';
import { resolveComponents } from './component';
import { inject } from './inject';
import { ModuleInstance } from './module.types';

export interface ResolveResult {
  readonly moduleRef: ModuleRef;
  readonly components: Promise<void>;
}

/**
 * Set up components of the module declaration
 * and its submodules based on their metadata.
 * @param module The module declaration to instantiate.
 * @returns The module reference and all available components.
 */
export function resolve<T = unknown>(
  module: RegisteredModule<T>
): ResolveResult {
  // compile and inject provided components
  const instances: ModuleInstance[] = [];
  const { moduleRef } = compile(module, instances);
  inject(instances);
  return { moduleRef, components: resolveComponents(instances) };
}
