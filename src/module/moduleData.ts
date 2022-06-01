import { ModuleEventListener } from '../types';
import { ComponentList } from './module.types';

export interface ModuleData {
  compiled: boolean;
  resolved: boolean;
  readonly components: ComponentList;
  readonly listeners: Record<'init' | 'resolve', ModuleEventListener[]>;
}

export function createModuleData(): ModuleData {
  return {
    compiled: false,
    resolved: false,
    listeners: { init: [], resolve: [] },
    components: { exported: [], module: [], self: [] }
  };
}
