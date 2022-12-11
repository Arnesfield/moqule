import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent
} from './component.types';
import { Module, RegisteredModule } from './module.types';
import { Ref } from './ref.types';

/**
 * Base module component.
 * @template T The component value or instance type.
 */
export interface BaseModuleComponent<T = unknown> {
  /**
   * Value or array of values to reference the component.
   */
  ref?: Ref<T> | Ref<T>[];
}

/**
 * Class component to register for the module.
 * @template T The component value or instance type.
 */
export interface ClassModuleComponent<T = unknown>
  extends BaseModuleComponent<T> {
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
 * @template T The component value or instance type.
 */
export interface FunctionModuleComponent<T = unknown>
  extends BaseModuleComponent<T> {
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
 * @template T The component value or instance type.
 */
export interface AsyncModuleComponent<T = unknown>
  extends BaseModuleComponent<T> {
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
 * @template T The component value or instance type.
 */
export interface ValueModuleComponent<T = unknown>
  extends BaseModuleComponent<T> {
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
 * @template T The component value or instance type.
 */
export type ModuleComponent<T = unknown> =
  | ClassModuleComponent<T>
  | FunctionModuleComponent<T>
  | AsyncModuleComponent<T>
  | ValueModuleComponent<T>;

/**
 * Module metadata.
 */
export interface ModuleMetadata {
  /**
   * Modules to import into this module (treated as submodules).
   */
  imports?: (Module | RegisteredModule)[];
  /**
   * Components to register for this module.
   */
  components?: (ClassComponent | ModuleComponent)[];
  /**
   * Modules, components, name, or symbol to export.
   */
  exports?: (Module | Ref)[];
  /**
   * Components, submodule components, name, or symbol to provide for submodules.
   */
  provide?: (Module | Ref)[];
  /**
   * Accept provided components from ancestor modules.
   * Set to `true` to inject all provided components.
   */
  inject?: boolean | Ref[];
}
