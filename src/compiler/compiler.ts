import { ComponentList, createModuleRef, ResolvedComponent } from '../module';
import {
  ComponentId,
  Module,
  ModuleMetadata,
  ModuleRef,
  RegisteredModule
} from '../types';
import { compare } from '../utils';

export interface CompiledModule<T = unknown> {
  readonly module: Module<T>;
  readonly moduleRef: ModuleRef;
  readonly metadata: ModuleMetadata;
  readonly components: ComponentList;
  readonly injectSources: Module[];
}

export interface CompileModuleResult<T = unknown> {
  readonly compiled: CompiledModule<T>;
  readonly modules: CompiledModule[];
}

export function compile<T = unknown>(
  root: RegisteredModule<T>
): CompileModuleResult<T> {
  const compiledModules: CompiledModule[] = [];

  const isRegisteredModule = <T = unknown>(
    module: Module<T> | RegisteredModule<T>
  ): module is RegisteredModule<T> => {
    return typeof (module as any).module !== 'undefined';
  };

  const findByModule = (module: Module | RegisteredModule) => {
    const value = isRegisteredModule(module) ? module.module : module;
    return compiledModules.find(compiled => compiled.module === value);
  };

  const createCompiledModule = <T = unknown>(
    module: Module<T>,
    metadata: ModuleMetadata
  ): CompiledModule<T> => {
    const components: ComponentList = { exported: [], module: [], self: [] };
    const moduleRef = createModuleRef(module.name, components);
    return { module, moduleRef, metadata, components, injectSources: [] };
  };

  const compileModule = (declaration: Module | RegisteredModule) => {
    // skip if in compiled modules
    const existingCompiled = findByModule(declaration);
    if (existingCompiled) {
      return existingCompiled;
    }
    // get module metadata
    const registered = isRegisteredModule(declaration)
      ? declaration
      : declaration.register(undefined);
    const { module } = registered;
    const metadata = module.metadata(registered.options);
    // save to compiled modules
    const compiledModule = createCompiledModule(module, metadata);
    compiledModules.push(compiledModule);
    // handle components and submodules
    resolveComponents(compiledModule);
    compileSubmodules(compiledModule);
    return compiledModule;
  };

  // resolve registered components of self
  const resolveComponents = (compiledModule: CompiledModule) => {
    const { components, metadata, module, moduleRef } = compiledModule;
    // only export non-modules
    const exports = (metadata.exports || []).filter(
      (id): id is ComponentId => !!id && typeof id !== 'object'
    );

    const saveComponent = (component: ResolvedComponent) => {
      components.self.push(component);
      components.module.push(component);
      const index = exports.findIndex(value => compare(value, component.ref));
      if (index > -1) {
        components.exported.push(component);
        exports.splice(index, 1);
      }
    };

    for (const ref of metadata.components || []) {
      if (typeof ref === 'function') {
        saveComponent({ type: 'class', resolved: false, moduleRef, ref });
        continue;
      }
      for (const name in ref) {
        const fn = ref[name];
        if (typeof fn !== 'function') {
          continue;
        }
        saveComponent({
          type: 'function',
          resolved: false,
          moduleRef,
          ref: fn
        });
      }
    }

    if (exports.length === 0) {
      return;
    }
    // handle not exported
    const label = exports
      .map(value => {
        const name = typeof value === 'string' ? value : value.name;
        return `"${name}"`;
      })
      .join(', ');
    throw new Error(
      `Cannot export missing or duplicate components [${label}] from module "${module.name}".`
    );
  };

  // compile submodules and save exported to current
  const compileSubmodules = (compiledModule: CompiledModule) => {
    // compile all imported modules and get components
    const { exports = [], imports = [] } = compiledModule.metadata;
    for (const imported of imports) {
      const compiled = compileModule(imported);
      // get all exported components from imported module
      const components = compiled.components.exported;
      const shouldExport = exports.some(value => {
        return typeof value === 'object' && compare(value, compiled.module);
      });
      for (const component of components) {
        compiledModule.components.module.push(component);
        // re-export components from exported modules
        if (shouldExport) {
          compiledModule.components.exported.push(component);
        }
      }
    }
  };

  const getProvidedComponents = (compiledModule: CompiledModule) => {
    const { components, metadata, module } = compiledModule;
    // get all components to inject first
    const providedComponents: ResolvedComponent[] = [];
    for (const value of metadata.provide || []) {
      // if module, save its components
      if (typeof value === 'object') {
        // assume to always find
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        providedComponents.push(...findByModule(value)!.components.exported);
        continue;
      }
      // otherwise, find component to provide from self
      const component = components.self.find(component => {
        return compare(value, component.ref);
      });
      if (!component) {
        const name = typeof value === 'string' ? value : value.name;
        throw new Error(
          `Cannot provide missing component "${name}" from module "${module.name}".`
        );
      }
      providedComponents.push(component);
    }
    return providedComponents;
  };

  const inject = (
    compiledSource: CompiledModule,
    providedComponents: ResolvedComponent[],
    targets: Exclude<ModuleMetadata['imports'], undefined>
  ) => {
    if (providedComponents.length === 0 || targets.length === 0) {
      return;
    }
    const source = compiledSource.module;
    for (const imported of targets) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const module = findByModule(imported)!;
      const { components, metadata, injectSources } = module;
      // skip if already injected to avoid circular injects
      if (injectSources.includes(source)) {
        continue;
      }
      injectSources.push(source);
      // include only if in inject options and not yet injected
      const injectOpts = metadata.inject || false;
      for (const component of providedComponents) {
        const shouldInject =
          typeof injectOpts === 'boolean'
            ? injectOpts
            : injectOpts.some(value => compare(value, component.ref));
        if (shouldInject && !components.module.includes(component)) {
          components.module.push(component);
        }
      }
      // inject components to submodules
      inject(compiledSource, providedComponents, module.metadata.imports || []);
    }
  };

  // compile all modules first
  const compiledRoot = compileModule(
    root as RegisteredModule
  ) as CompiledModule<T>;
  // handle provided components
  for (const compiled of compiledModules) {
    const components = getProvidedComponents(compiled);
    inject(compiled, components, compiled.metadata.imports || []);
  }
  return { compiled: compiledRoot, modules: compiledModules };
}
