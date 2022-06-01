export interface ClassComponent<T = any> {
  new (moduleRef: ModuleRef): T;
}

export type FunctionComponent<T = any> = (moduleRef: ModuleRef) => T;

export type Component<T = unknown> =
  | ClassComponent<T>
  | Record<string, FunctionComponent<T>>;

export type ComponentId<T = any> =
  | string
  | ClassComponent<T>
  | FunctionComponent<T>;

export interface ModuleRef {
  readonly name: string;
  get<T = unknown>(id: ComponentId<T>): T;
  getOptional<T = unknown>(id: ComponentId<T>): T | undefined;
}

export interface RegisteredModule<T = unknown> {
  readonly options: T;
  readonly module: Module<T>;
}

/** Module declaration. */
export interface Module<T = unknown> {
  readonly name: string;
  readonly options:
    | ModuleOptions
    | ((registerOptions: T | undefined) => ModuleOptions);
  register(options: T): RegisteredModule<T>;
  resolve(options?: T): ModuleRef;
}

export interface ModuleOptions {
  imports?: (Module | RegisteredModule)[];
  components?: Component[];
  exports?: (Module | ComponentId)[];
  provide?: (Module | ComponentId)[];
  inject?: boolean | ComponentId[];
}
