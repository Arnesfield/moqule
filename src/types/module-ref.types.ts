import { ComponentId } from './component.types';

/**
 * Module reference.
 */
export interface ModuleRef {
  /**
   * The module name.
   */
  readonly name: string;
  /**
   * Get the module component. Throws an error if no component was found.
   * @param id The component class, function, or name.
   * @returns The component.
   */
  get<T = unknown>(id: ComponentId<T>): Awaited<T>;
  /**
   * Get the module component.
   * @param id The component class, function, or name.
   * @returns The component if found.
   */
  getOptional<T = unknown>(id: ComponentId<T>): Awaited<T> | undefined;
}
