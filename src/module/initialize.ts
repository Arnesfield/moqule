import { register } from '../core/register';
import { ComponentFactory } from '../types/componentFactory.types';
import { ModuleInstance } from '../types/instance.types';
import { Module } from '../types/module.types';
import { ModuleRef } from '../types/moduleRef.types';
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
 * @param components The override components.
 * @returns The module reference and all available components.
 */
export function initialize<T = unknown>(
  module: Module<T>,
  options: T,
  components: ComponentFactory[] = []
): InitializeResult {
  if (typeof module.name !== 'string') {
    throw new Error('Module name is required and should be a string.');
  }
  // create listeners separately so instances will get garbage collected
  const l = createListener();
  // compile and inject provided components
  const instances: ModuleInstance[] = [];
  const { moduleRef } = compile(
    register(module, options),
    instances,
    l.onInit,
    components
  );
  inject(instances);
  return { moduleRef, components: resolveComponents(instances, l.emit) };
}
