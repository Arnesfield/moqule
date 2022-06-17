import { Component } from './component.types';

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
  get<T = unknown>(id: string | Component<T>): Awaited<T>;
  /**
   * Get the module component.
   * @param id The component class, function, or name.
   * @returns The component if found.
   */
  getOptional<T = unknown>(id: string | Component<T>): Awaited<T> | undefined;
  /**
   * Set event listener that triggers when module is initialized.
   * @param listener The listener.
   */
  onInit(listener: () => void): void;
}
