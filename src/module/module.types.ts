import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent,
  Module,
  ModuleMetadata,
  ModuleRef
} from '../types';

// NOTE: internal types

export type ComponentRef<T = unknown> = {
  value?: T;
  asyncValue?: Promise<T>;
} & (
  | {
      readonly type: 'class';
      readonly moduleRef: ModuleRef;
      readonly ref: ClassComponent<T>;
    }
  | {
      readonly type: 'function';
      readonly moduleRef: ModuleRef;
      readonly ref: FunctionComponent<T>;
    }
  | { readonly type: 'async'; readonly ref: AsyncComponent<T> }
);

/**
 * Component list. Should be eligible for garbage collection
 * once the module is resolved except for the `module`
 * property array as it is used by the module reference.
 */
export interface ComponentList {
  readonly exported: ComponentRef[];
  readonly module: ComponentRef[];
  readonly self: ComponentRef[];
}

export interface ModuleInstance<T = unknown> {
  readonly module: Module<T>;
  readonly moduleRef: ModuleRef;
  readonly metadata: ModuleMetadata;
  readonly components: ComponentList;
  readonly descendants: ModuleInstance[];
}
