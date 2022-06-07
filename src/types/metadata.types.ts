import {
  AsyncComponent,
  ClassComponent,
  Component,
  FunctionComponent
} from './component.types';
import { Module, RegisteredModule } from './module.types';

/**
 * Module components.
 */
export interface Components {
  /**
   * Class components to register for this module.
   */
  class?: ClassComponent[];
  /**
   * Function components to register for this module.
   */
  function?: (FunctionComponent | { [K in string]?: FunctionComponent })[];
  /**
   * Async function components to register for this module.
   */
  async?: (AsyncComponent | { [K in string]?: AsyncComponent })[];
}

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
  components?: ClassComponent[] | Components;
  /**
   * Modules, components, or name strings to export.
   */
  exports?: (string | Module | Component)[];
  /**
   * Components, submodule components, or name strings to provide for submodules.
   */
  provide?: (string | Module | Component)[];
  /**
   * Accept provided components from ancestor modules.
   * Set to `true` to inject all provided components.
   */
  inject?: boolean | (string | Component)[];
}
