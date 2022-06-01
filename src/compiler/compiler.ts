import {
  createModuleData,
  createModuleRef,
  ModuleData,
  ResolvedComponent
} from '../module';
import {
  ComponentId,
  Module,
  ModuleOptions,
  ModuleRef,
  RegisteredModule
} from '../types';
import { compare } from '../utils';

export interface CompiledModule<T = unknown> {
  instance?: any;
  data: ModuleData;
  options: ModuleOptions;
  module: Module<T>;
  moduleRef: ModuleRef;
  injectSources: Module[];
}

export interface CompileModuleResult<T = unknown> {
  compiled: CompiledModule<T>;
  modules: CompiledModule[];
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
    // assume to always find
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return compiledModules.find(compiled => compiled.module === value)!;
  };

  const compileModule = (declaration: Module | RegisteredModule) => {
    // skip if in compiled modules
    const existingCompiled = findByModule(declaration);
    if (existingCompiled) {
      return existingCompiled;
    }
    // get module options
    const registered: RegisteredModule = isRegisteredModule(declaration)
      ? declaration
      : { module: declaration, options: undefined };
    const { module } = registered;
    const options =
      typeof module.options === 'function'
        ? module.options(registered.options)
        : module.options;
    // save to compiled modules
    const data = createModuleData();
    const moduleRef = createModuleRef(module.name, data);
    const compiledModule: CompiledModule = {
      data,
      module,
      moduleRef,
      options,
      injectSources: []
    };
    compiledModules.push(compiledModule);
    // handle components and submodules
    resolveComponents(compiledModule);
    compileSubmodules(compiledModule);
    return compiledModule;
  };

  // resolve registered components of self
  const resolveComponents = (compiledModule: CompiledModule) => {
    const { data, options, module, moduleRef } = compiledModule;
    // only export non-modules
    const exports = (options.exports || []).filter(
      (id): id is ComponentId => !!id && typeof id !== 'object'
    );

    const saveComponent = (component: ResolvedComponent) => {
      data.components.self.push(component);
      data.components.module.push(component);
      const index = exports.findIndex(value => compare(value, component.ref));
      if (index > -1) {
        data.components.exported.push(component);
        exports.splice(index, 1);
      }
    };

    for (const ref of options.components || []) {
      if (typeof ref === 'function') {
        saveComponent({ ref, value: new ref(moduleRef) });
        continue;
      }
      for (const name in ref) {
        saveComponent({ ref: ref[name], value: ref[name](moduleRef) });
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
    const { data, options } = compiledModule;
    // compile all imported modules and get components
    const { exports = [], imports = [] } = options;
    for (const imported of imports) {
      const compiled = compileModule(imported);
      // get all exported components from imported module
      const components = compiled.data.components.exported;
      const shouldExport = exports.some(value => {
        return typeof value === 'object' && compare(value, compiled.module);
      });
      for (const component of components) {
        data.components.module.push(component);
        // re-export components from exported modules
        if (shouldExport) {
          data.components.exported.push(component);
        }
      }
    }
  };

  const getProvidedComponents = (compiledModule: CompiledModule) => {
    const { data, module, options } = compiledModule;
    // get all components to inject first
    const components: ResolvedComponent[] = [];
    for (const value of options.provide || []) {
      // if module, save its components
      if (typeof value === 'object') {
        components.push(...findByModule(value).data.components.exported);
        continue;
      }
      // otherwise, find component to provide from self
      const component = data.components.self.find(component => {
        return compare(value, component.ref);
      });
      if (!component) {
        const name = typeof value === 'string' ? value : value.name;
        throw new Error(
          `Cannot provide missing component "${name}" from module "${module.name}".`
        );
      }
      components.push(component);
    }
    return components;
  };

  const inject = (
    compiledSource: CompiledModule,
    components: ResolvedComponent[],
    targets: Exclude<ModuleOptions['imports'], undefined>
  ) => {
    if (components.length === 0 || targets.length === 0) {
      return;
    }
    const source = compiledSource.module;
    for (const imported of targets) {
      const module = findByModule(imported);
      const { data, options, injectSources } = module;
      // skip if already injected to avoid circular injects
      if (injectSources.includes(source)) {
        continue;
      }
      injectSources.push(source);
      // include only if in inject options and not yet injected
      const injectOpts = options.inject || [];
      for (const component of components) {
        const shouldInject =
          typeof injectOpts === 'boolean'
            ? injectOpts
            : injectOpts.some(value => compare(value, component.ref));
        if (shouldInject && !data.components.module.includes(component)) {
          data.components.module.push(component);
        }
      }
      // inject components to submodules
      inject(compiledSource, components, module.options.imports || []);
    }
  };

  // compile all modules first
  const compiledRoot = compileModule(
    root as RegisteredModule
  ) as CompiledModule<T>;
  // handle provided components
  for (const compiled of compiledModules) {
    const components = getProvidedComponents(compiled);
    inject(compiled, components, compiled.options.imports || []);
  }
  // set as compiled since every module is set up
  for (const compiled of compiledModules) {
    compiled.data.compiled = true;
  }
  return { compiled: compiledRoot, modules: compiledModules };
}
