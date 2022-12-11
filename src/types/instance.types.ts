import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent
} from './component.types';
import {
  AsyncComponentFactory,
  ClassComponentFactory,
  FunctionComponentFactory,
  ValueComponentFactory
} from './componentFactory.types';
import { ModuleMetadata } from './metadata.types';
import { Module } from './module.types';
import { ModuleRef } from './moduleRef.types';
import { Ref } from './ref.types';

// NOTE: internal types

/**
 * Base component instance.
 * @template T The component value or instance type.
 */
export interface BaseComponentInstance<T = unknown> {
  value?: T;
  resolved?: boolean;
  readonly refs: Ref[];
  exportRefs?: Ref[];
  provideRefs?: Ref[];
}

/**
 * Class component instance.
 * @template T The component value or instance type.
 */
export interface ClassComponentInstance<T = unknown>
  extends BaseComponentInstance<T> {
  readonly type: 'class';
  readonly moduleRef: ModuleRef;
  readonly ref: ClassComponent<T>;
  factory?: ClassComponentFactory<T>['factory'];
}

/**
 * Function component instance.
 * @template T The component value or instance type.
 */
export interface FunctionComponentInstance<T = unknown>
  extends BaseComponentInstance<T> {
  readonly type: 'function';
  readonly moduleRef: ModuleRef;
  readonly ref: FunctionComponent<T>;
  factory?: FunctionComponentFactory<T>['factory'];
}

/**
 * Async function component instance.
 * @template T The component value or instance type.
 */
export interface AsyncComponentInstance<T = unknown>
  extends BaseComponentInstance<T> {
  readonly type: 'async';
  readonly ref: AsyncComponent<T>;
  asyncValue?: Promise<T>;
  factory?: AsyncComponentFactory<T>['factory'];
}

/**
 * Component value reference.
 * @template T The component value or instance type.
 */
export interface ValueComponentInstance<T = unknown>
  extends BaseComponentInstance<T> {
  readonly type: 'value';
  readonly ref?: never;
  factory?: ValueComponentFactory<T>['factory'];
}

/**
 * Component instance.
 * @template T The component value or instance type.
 */
export type ComponentInstance<T = unknown> =
  | ClassComponentInstance<T>
  | FunctionComponentInstance<T>
  | AsyncComponentInstance<T>
  | ValueComponentInstance<T>;

/**
 * Component list.
 */
export interface ComponentList {
  readonly exported: ComponentInstance[];
  readonly imported: ComponentInstance[];
  readonly injected: ComponentInstance[];
  readonly self: ComponentInstance[];
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
