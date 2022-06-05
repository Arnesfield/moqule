import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent
} from './component.types';
import { ModuleMetadata } from './metadata.types';
import { ModuleRef } from './module-ref.types';
import { Module } from './module.types';

// NOTE: internal types

/**
 * Component reference.
 * @template T The component value or instance type.
 */
export type ComponentRef<T = unknown> = {
  value?: T;
  asyncValue?: Promise<T>;
} & (
  | { readonly type: 'class'; readonly ref: ClassComponent<T> }
  | { readonly type: 'function'; readonly ref: FunctionComponent<T> }
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
