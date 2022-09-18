import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent
} from './component.types';
import {
  AsyncComponentFactory,
  ClassComponentFactory,
  ComponentFactory,
  FunctionComponentFactory,
  ValueComponentFactory
} from './componentFactory.types';
import { Module } from './module.types';
import { ModuleRef } from './moduleRef.types';

/**
 * Override object.
 */
export interface Override {
  /**
   * Factory components.
   */
  readonly components: ComponentFactory[];
  /**
   * Override class component.
   * @param ref The class component to override.
   * @param factory Function that returns the component value.
   * @returns The override object.
   */
  class<T = unknown>(
    ref: string | symbol | ClassComponent<T>,
    factory: ClassComponentFactory<T>['factory']
  ): this;
  /**
   * Override function component.
   * @param ref The function component to override.
   * @param factory Function that returns the component value.
   * @returns The override object.
   */
  function<T = unknown>(
    ref: string | symbol | FunctionComponent<T>,
    factory: FunctionComponentFactory<T>['factory']
  ): this;
  /**
   * Override async function component.
   * @param ref The async function component to override.
   * @param factory Function that returns the component value.
   * @returns The override object.
   */
  async<T = unknown>(
    ref: string | symbol | AsyncComponent<T>,
    factory: AsyncComponentFactory<T>['factory']
  ): this;
  /**
   * Override value component.
   * @param ref The value component to override.
   * @param factory Function that returns the component value.
   * @returns The override object.
   */
  value<T = unknown>(
    ref: string | symbol,
    factory: ValueComponentFactory<T>['factory']
  ): this;
  /**
   * Initialize all modules and components.
   *
   * All async components are resolved asynchronously.
   *
   * You may use `override.initAsync(module, options?)`
   * if at least one module is using async components.
   * @template T The register options type.
   * @param module The module declaration.
   * @param options The register options.
   * @returns The module reference.
   */
  init<T = unknown>(module: Module<T>, options?: T): ModuleRef;
  /**
   * Initialize all modules and components.
   *
   * All async components are resolved before the promise is fulfilled.
   *
   * You may use `override.init(module, options?)`
   * if no module is using async components.
   * @template T The register options type.
   * @param module The module declaration.
   * @param options The register options.
   * @returns The module reference.
   */
  initAsync<T = unknown>(module: Module<T>, options?: T): Promise<ModuleRef>;
}
