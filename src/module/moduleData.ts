import { ModuleEventListener } from '../types';
import { ResolvedComponent } from './resolveComponent';

export type ComponentList = Readonly<
  Record<'exported' | 'module' | 'self', ResolvedComponent[]>
>;

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
