import {
  AsyncComponent,
  ClassComponent,
  ForwardRef,
  FunctionComponent
} from './component.types';

/**
 * Class component factory.
 * @template T The component value or instance type.
 */
export interface ClassComponentFactory<T = unknown> {
  /**
   * Component type.
   */
  readonly type: 'class';
  /**
   * The component or name to match.
   */
  ref: string | ClassComponent<T>;
  /**
   * Factory function.
   * @param forwardRef Forward the component value and retrieve the module reference.
   * @returns The component value or instance.
   */
  factory(forwardRef: ForwardRef<T>): T;
}

/**
 * Function component factory.
 * @template T The component value or instance type.
 */
export interface FunctionComponentFactory<T = unknown> {
  /**
   * Component type.
   */
  readonly type: 'function';
  /**
   * The component or name to match.
   */
  ref: string | FunctionComponent<T>;
  /**
   * Factory function.
   * @param forwardRef Forward the component value and retrieve the module reference.
   * @returns The component value or instance.
   */
  factory(forwardRef: ForwardRef<T>): T;
}

/**
 * Async function component factory.
 * @template T The component value or instance type.
 */
export interface AsyncComponentFactory<T = unknown> {
  /**
   * Component type.
   */
  readonly type: 'async';
  /**
   * The component or name to match.
   */
  ref: string | AsyncComponent<T>;
  /**
   * Factory function.
   * @returns The component value or instance.
   */
  factory(): Promise<T>;
}

/**
 * Component factory.
 */
export type ComponentFactory<T = unknown> =
  | ClassComponentFactory<T>
  | FunctionComponentFactory<T>
  | AsyncComponentFactory<T>;
