import { register } from '../core/register';
import { Module, ModuleRef, Override } from '../types';
import { ModuleInstance } from '../types/instance.types';
import { compile } from './compile';
import { resolveComponents } from './component';
import { inject } from './inject';

interface Listener {
  emit: () => void;
  onInit: ModuleRef['onInit'];
}

function createListener(): Listener {
  let didInit = false;
  let listeners: (() => void)[] = [];
  let emit = () => {
    // emit listeners
    for (const listener of listeners) {
      listener();
    }
    // cleanup
    didInit = true;
    listeners = undefined as any;
    emit = undefined as any;
  };
  return { emit, onInit: listener => !didInit && listeners.push(listener) };
}

export interface InitializeResult {
  readonly moduleRef: ModuleRef;
  readonly components: Promise<void>;
}

/**
 * Set up components of the module declaration
 * and its submodules based on their metadata.
 * @param module The module declaration to instantiate.
 * @param options The register options.
 * @param override The override options.
 * @returns The module reference and all available components.
 */
export function initialize<T = unknown>(
  module: Module<T>,
  options: T,
  override: Override | Override['components'] | undefined
): InitializeResult {
  // create listeners separately so instances will get garbage collected
  const { emit, onInit } = createListener();
  // compile and inject provided components
  const instances: ModuleInstance[] = [];
  const co = Array.isArray(override) ? override : override?.components || [];
  const { moduleRef } = compile(register(module, options), {
    onInit,
    instances,
    override: co
  });
  inject(instances);
  return { moduleRef, components: resolveComponents(instances, emit) };
}
