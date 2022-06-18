import {
  AsyncComponentFactory,
  ClassComponentFactory,
  ComponentFactory,
  FunctionComponentFactory
} from './component-factory.types';
import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent
} from './component.types';

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
    ref: string | ClassComponent<T>,
    factory: ClassComponentFactory<T>['factory']
  ): this;
  /**
   * Override function component.
   * @param ref The function component to override.
   * @param factory Function that returns the component value.
   * @returns The override object.
   */
  function<T = unknown>(
    ref: string | FunctionComponent<T>,
    factory: FunctionComponentFactory<T>['factory']
  ): this;
  /**
   * Override async function component.
   * @param ref The async function component to override.
   * @param factory Function that returns the component value.
   * @returns The override object.
   */
  async<T = unknown>(
    ref: string | AsyncComponent<T>,
    factory: AsyncComponentFactory<T>['factory']
  ): this;
}
