import { ForwardRef } from './component.types';
import { Ref } from './ref.types';

export interface BaseComponentFactory<T = unknown> {
  /**
   * The component, name, or symbol to match.
   */
  ref: Ref<T>;
}

/**
 * Class component factory.
 * @template T The component value or instance type.
 */
export interface ClassComponentFactory<T = unknown>
  extends BaseComponentFactory<T> {
  /**
   * Component type.
   */
  readonly type: 'class';
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
export interface FunctionComponentFactory<T = unknown>
  extends BaseComponentFactory<T> {
  /**
   * Component type.
   */
  readonly type: 'function';
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
export interface AsyncComponentFactory<T = unknown>
  extends BaseComponentFactory<T> {
  /**
   * Component type.
   */
  readonly type: 'async';
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
export interface ValueComponentFactory<T = unknown>
  extends BaseComponentFactory<T> {
  /**
   * Component type.
   */
  readonly type: 'value';
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
