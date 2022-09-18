import {
  AsyncComponent,
  ClassComponent,
  Component,
  FunctionComponent
} from './component.types';
import { Module, RegisteredModule } from './module.types';

/**
 * Class component to register for the module.
 */
export interface ModuleClassComponent<T = unknown> {
  /**
   * Value or array of values to reference the component.
   */
  ref?: string | symbol | ClassComponent | (string | symbol | ClassComponent)[];
  /**
   * The class component.
   */
  class: ClassComponent<T>;
  function?: never;
  async?: never;
  value?: never;
}

/**
 * Function component to register for the module.
 */
export interface ModuleFunctionComponent<T = unknown> {
  /**
   * Value or array of values to reference the component.
   */
  ref?:
    | string
    | symbol
    | FunctionComponent
    | (string | symbol | FunctionComponent)[];
  class?: never;
  /**
   * The function component.
   */
  function: FunctionComponent<T>;
  async?: never;
  value?: never;
}

/**
 * Async function component to register for the module.
 */
export interface ModuleAsyncComponent<T = unknown> {
  /**
   * Value or array of values to reference the component.
   */
  ref?: string | symbol | AsyncComponent | (string | symbol | AsyncComponent)[];
  class?: never;
  function?: never;
  /**
   * The async function component.
   */
  async: AsyncComponent<T>;
  value?: never;
}

/**
 * Value component to register for the module.
 */
export interface ModuleValueComponent<T = unknown> {
  /**
   * Value or array of values to reference the component.
   */
  ref: string | symbol | (string | symbol)[];
  class?: never;
  function?: never;
  async?: never;
  /**
   * The value component.
   */
  value: T;
}

/**
 * Module component.
 */
export type ModuleComponent<T = unknown> =
  | ModuleClassComponent<T>
  | ModuleFunctionComponent<T>
  | ModuleAsyncComponent<T>
  | ModuleValueComponent<T>;

/**
 * Module metadata.
 */
export interface ModuleMetadata {
  /**
   * Imported modules (treated as submodules).
   */
  imports?: (Module | RegisteredModule)[];
  /**
   * Components to register for this module.
   */
  components?: (ClassComponent | ModuleComponent)[];
  /**
   * Modules, components, name, or symbol to export.
   */
  exports?: (string | symbol | Module | Component)[];
  /**
   * Components, submodule components, name, or symbol to provide for submodules.
   */
  provide?: (string | symbol | Module | Component)[];
  /**
   * Accept provided components from ancestor modules.
   * Set to `true` to inject all provided components.
   */
  inject?: boolean | (string | symbol | Component)[];
}
