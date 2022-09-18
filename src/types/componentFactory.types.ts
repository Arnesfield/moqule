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
   * The component, name, or symbol to match.
   */
  ref: string | symbol | ClassComponent<T>;
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
   * The component, name, or symbol to match.
   */
  ref: string | symbol | FunctionComponent<T>;
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
   * The component, name, or symbol to match.
   */
  ref: string | symbol | AsyncComponent<T>;
  /**
   * Factory function.
   * @returns The component value or instance.
   */
  factory(): Promise<T>;
}

/**
 * Value component factory.
 * @template T The component value or instance type.
 */
export interface ValueComponentFactory<T = unknown> {
  /**
   * Component type.
   */
  readonly type: 'value';
  /**
   * The component, name, or symbol to match.
   */
  ref: string | symbol;
  /**
   * Factory function.
   * @returns The component value or instance.
   */
  factory(): T;
}

/**
 * Component factory.
 */
export type ComponentFactory<T = unknown> =
  | ClassComponentFactory<T>
  | FunctionComponentFactory<T>
  | AsyncComponentFactory<T>
  | ValueComponentFactory<T>;
