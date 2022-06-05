import { ModuleRef } from './module-ref.types';

/**
 * Class component.
 * @template T The component value or instance type.
 */
export interface ClassComponent<T = unknown> {
  /**
   * @param moduleRef The module reference.
   * @returns The component value or instance.
   */
  new (moduleRef: ModuleRef): T;
}

/**
 * Function component.
 * @template T The component value or instance type.
 * @param moduleRef The module reference.
 * @returns The component value or instance.
 */
export type FunctionComponent<T = unknown> = (moduleRef: ModuleRef) => T;

/**
 * Async component.
 * @template T The component value or instance type.
 * @returns The async component value or instance.
 */
export type AsyncComponent<T = unknown> = () => Promise<T>;

/**
 * Component class, function, async function, or name.
 * @template T The component value or instance type.
 */
export type ComponentId<T = unknown> =
  | string
  | ClassComponent<T>
  | FunctionComponent<T>
  | AsyncComponent<T>;
