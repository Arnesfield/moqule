import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent
} from './component.types';
import {
  AsyncComponentFactory,
  ClassComponentFactory,
  FunctionComponentFactory
} from './componentFactory.types';
import { ModuleMetadata } from './metadata.types';
import { Module } from './module.types';
import { ModuleRef } from './moduleRef.types';

// NOTE: internal types

/**
 * Component reference.
 * @template T The component value or instance type.
 */
export type ComponentRef<T = unknown> = {
  value?: T;
  resolved?: boolean;
  asyncValue?: Promise<T>;
} & (
  | {
      readonly type: 'class';
      readonly moduleRef: ModuleRef;
      readonly ref: ClassComponent<T>;
      factory?: ClassComponentFactory<T>['factory'];
    }
  | {
      readonly type: 'function';
      readonly moduleRef: ModuleRef;
      readonly ref: FunctionComponent<T>;
      factory?: FunctionComponentFactory<T>['factory'];
    }
  | {
      readonly type: 'async';
      readonly ref: AsyncComponent<T>;
      factory?: AsyncComponentFactory<T>['factory'];
    }
);

/**
 * Component list. Should be eligible for garbage collection
 * once the module is initialized except for the `module`
 * property array as it is used by the module reference.
 */
export interface ComponentList {
  readonly exported: ComponentRef[];
  readonly module: ComponentRef[];
  readonly self: ComponentRef[];
}

/**
 * Module instance.
 * @template T The register options type.
 */
export interface ModuleInstance<T = unknown> {
  readonly module: Module<T>;
  readonly moduleRef: ModuleRef;
  readonly metadata: ModuleMetadata;
  readonly components: ComponentList;
  readonly descendants: ModuleInstance[];
}
