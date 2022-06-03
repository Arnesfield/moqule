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
 * Module component (class or function).
 * @template T The component value or instance type.
 */
export type Component<T = unknown> =
  | ClassComponent<T>
  | { [K in string]?: FunctionComponent<T> };

/**
 * Async component.
 * @template T The component value or instance type.
 * @returns The async component value or instance.
 */
export type AsyncComponent<T = unknown> = () => Promise<T>;

/**
 * Component class, function, or name.
 * @template T The component value or instance type.
 */
export type ComponentId<T = unknown> =
  | string
  | ClassComponent<T>
  | FunctionComponent<T>;

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
   * The register options.
   */
  readonly options: T;
  /**
   * The registered module.
   */
  readonly module: Module<T>;
}

/**
 * Module declaration.
 * @template T The register options type.
 */
export interface Module<T = unknown> {
  /**
   * The module name.
   */
  readonly name: string;
  /**
   * Get the module metadata.
   * @param options The register options.
   * @returns The module metadata.
   */
  metadata(options?: T): ModuleMetadata;
  /**
   * Set options to register for module.
   * @param options The register options.
   * @returns The registered module.
   */
  register(options: T): RegisteredModule<T>;
  /**
   * Resolve all modules and components.
   *
   * All `asyncComponents` are resolved before the promise is fulfilled.
   *
   * You may use `resolveSync(options)` if no module is using `asyncComponents`.
   * @param options The register options.
   * @returns The module reference.
   */
  resolve(options?: T): Promise<ModuleRef>;
  /**
   * Resolve all modules and components.
   *
   * All `asyncComponents` are resolved asynchronously.
   *
   * You may use `resolve(options)` if at least one module is using `asyncComponents`.
   * @param options The register options.
   * @returns The module reference.
   */
  resolveSync(options?: T): ModuleRef;
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
  components?: Component[];
  /**
   * Async components to register for this module.
   */
  asyncComponents?: (AsyncComponent | { [K in string]?: AsyncComponent })[];
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
