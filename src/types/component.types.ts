import { ModuleRef } from './module-ref.types';

/**
 * Forward the component value and retrieve the module reference.
 * @template T The component value or instance type.
 * @param value The component value.
 * @returns The module reference.
 */
export type ForwardRef<T> = (value: T) => ModuleRef;

/**
 * Class component.
 * @template T The component value or instance type.
 */
export interface ClassComponent<T = unknown> {
  /**
   * Class component constructor.
   * @param forwardRef Forward the component value and retrieve the module reference.
   * @returns The component value or instance.
   */
  new (forwardRef: ForwardRef<T>): T;
}

/**
 * Function component.
 * @template T The component value or instance type.
 * @param forwardRef Forward the component value and retrieve the module reference.
 * @returns The component value or instance.
 */
export type FunctionComponent<T = unknown> = (forwardRef: ForwardRef<T>) => T;

/**
 * Async component.
 * @template T The component value or instance type.
 * @returns The async component value or instance.
 */
export type AsyncComponent<T = unknown> = () => Promise<T>;

/**
 * Component class, function, or async function.
 * @template T The component value or instance type.
 */
export type Component<T = unknown> =
  | ClassComponent<T>
  | FunctionComponent<T>
  | AsyncComponent<T>;
