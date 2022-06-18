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
 * Component factory options.
 */
export interface FactoryOptions {
  /**
   * Class component factory.
   */
  class?: ClassComponentFactory[];
  /**
   * Function component factory.
   */
  function?: FunctionComponentFactory[];
  /**
   * Async function component factory.
   */
  async?: AsyncComponentFactory[];
}
