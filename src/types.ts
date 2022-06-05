import { ModuleWithMetadata, ModuleWithRegister } from './internal.types';

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
 * Module component.
 * @template T The component value or instance type.
 */
export type Component<T = unknown> =
  | ClassComponent<T>
  | FunctionComponent<T>
  | AsyncComponent<T>
  | { [K in string]?: FunctionComponent<T> }
  | { [K in string]?: AsyncComponent<T> };

/**
 * Component class, function, async function, or name.
 * @template T The component value or instance type.
 */
export type ComponentId<T = unknown> =
  | string
  | ClassComponent<T>
  | FunctionComponent<T>
  | AsyncComponent<T>;

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

/**
 * Registered module.
 * @template T The register options type.
 */
export interface RegisteredModule<T = unknown> {
  /**
   * The registered module.
   */
  readonly module: Module<T>;
  /**
   * The register options.
   */
  readonly options: T;
}

/**
 * Module declaration.
 * @template T The register options type.
 */
export type Module<T = unknown> = ModuleWithMetadata | ModuleWithRegister<T>;

/**
 * Module components.
 */
export interface ModuleComponents {
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
  components?: ClassComponent[] | ModuleComponents;
  /**
   * Modules, components, or name strings to export.
   */
  exports?: (Module | ComponentId)[];
  /**
   * Components, submodule components, or
   * component name strings to provide for submodules.
   */
  provide?: (Module | ComponentId)[];
  /**
   * Accept provided components from ancestor modules.
   * Set to `true` to inject all provided components.
   */
  inject?: boolean | ComponentId[];
}
