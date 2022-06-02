export interface ClassComponent<T = unknown> {
  new (moduleRef: ModuleRef): T;
}

export type FunctionComponent<T = unknown> = (moduleRef: ModuleRef) => T;

export type Component<T = unknown> =
  | ClassComponent<T>
  | { [K in string]?: FunctionComponent<T> };

export type AsyncComponent<T = unknown> = () => Promise<T>;

export type ComponentId<T = unknown> =
  | string
  | ClassComponent<T>
  | FunctionComponent<T>;

export interface ModuleRef {
  readonly name: string;
  get<T = unknown>(id: ComponentId<T>): Awaited<T>;
  getOptional<T = unknown>(id: ComponentId<T>): Awaited<T> | undefined;
}

export interface RegisteredModule<T = unknown> {
  readonly options: T;
  readonly module: Module<T>;
}

/** Module declaration. */
export interface Module<T = unknown> {
  readonly name: string;
  metadata(options?: T): ModuleMetadata;
  register(options: T): RegisteredModule<T>;
  resolve(options?: T): Promise<ModuleRef>;
  resolveSync(options?: T): ModuleRef;
}

export interface ModuleMetadata {
  imports?: (Module | RegisteredModule)[];
  components?: Component[];
  asyncComponents?: { [K in string]?: AsyncComponent }[];
  exports?: (Module | ComponentId)[];
  provide?: (Module | ComponentId)[];
  inject?: boolean | ComponentId[];
}
