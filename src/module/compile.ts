import { register } from '../core/register';
import { Component } from '../types/component.types';
import { ComponentFactory } from '../types/componentFactory.types';
import {
  ComponentInstance,
  ComponentList,
  ModuleInstance
} from '../types/instance.types';
import { ModuleComponent } from '../types/metadata.types';
import { Module, RegisteredModule } from '../types/module.types';
import { ModuleRef } from '../types/moduleRef.types';
import { compare } from '../utils/compare';
import { isRegisteredModule } from '../utils/isRegisteredModule';
import { getMetadata } from './metadata';
import { createModuleRef } from './moduleRef';

/**
 * Compile and setup the components of the module declaration and its submodules.
 * @param declaration The module declaration.
 * @param instances The module instances.
 * @param onInit Callback to add module init listeners.
 * @param components The override components.
 * @returns The created module instance.
 */
export function compile<T = unknown>(
  declaration: Module<T> | RegisteredModule<T>,
  instances: ModuleInstance[],
  onInit: ModuleRef['onInit'],
  components: ComponentFactory[]
): ModuleInstance<T> {
  return new Compiler(instances, onInit, components).compile(declaration);
}

class Compiler {
  constructor(
    private readonly instances: ModuleInstance[],
    private readonly onInit: ModuleRef['onInit'],
    private readonly overrides: ComponentFactory[]
  ) {}

  compile<T = unknown>(
    declaration: Module<T> | RegisteredModule<T>
  ): ModuleInstance<T> {
    const isRegistered = isRegisteredModule(declaration);
    const { module, options } = isRegistered
      ? declaration
      : register(declaration, undefined);
    // skip if already compiled
    const existingInstance = this.instances.find(
      (instance): instance is ModuleInstance<T> => instance.module === module
    );
    if (existingInstance) {
      if (!isRegistered) {
        return existingInstance;
      }
      // make sure consumer cannot be registered more than once
      throw new Error(
        `Module "${module.name}" was already compiled and cannot be registered with options.`
      );
    }

    // create module instance
    const instance = this.createInstance(module, options);
    this.instances.push(instance);
    // handle components and submodules
    this.setupComponents(instance);
    // compile all imported modules and get components
    // also save its descendants for injection later
    const descendants: ModuleInstance[] = [];
    const { exports = [], imports = [] } = instance.metadata;
    for (const imported of imports) {
      const compiled = this.compile(imported);
      descendants.push(compiled, ...compiled.descendants);
      const shouldExport = exports.some(value => {
        return (
          (typeof value === 'string' || typeof value === 'object') &&
          compare(value, compiled.module)
        );
      });
      // get all exported components from imported module
      for (const component of compiled.components.exported) {
        instance.components.imported.push(component);
        // re-export components from exported modules
        if (shouldExport) {
          instance.components.exported.push(component);
        }
      }
    }

    // make sure descendants are unique
    if (descendants.length > 0) {
      instance.descendants.push(...new Set(descendants));
    }
    // make sure instance descendants do not contain itself
    const index = instance.descendants.indexOf(instance);
    if (index > -1) {
      instance.descendants.splice(index, 1);
    }
    return instance;
  }

  private createInstance<T = unknown>(
    module: Module<T>,
    options: T | undefined
  ): ModuleInstance<T> {
    const metadata = getMetadata(module, options);
    const components: ComponentList = {
      exported: [],
      imported: [],
      injected: [],
      self: []
    };
    const moduleRef = createModuleRef(module.name, components, this.onInit);
    return { module, moduleRef, metadata, components, descendants: [] };
  }

  private setupComponents(instance: ModuleInstance): void {
    const { components, metadata, moduleRef } = instance;
    // only export non-modules
    const exports = (metadata.exports || []).filter(
      (id): id is string | symbol | Component => typeof id !== 'object'
    );
    for (const c of metadata.components || []) {
      const component = this.createComponent(
        typeof c === 'function' ? { class: c } : c,
        moduleRef
      );
      // save component
      components.self.push(component);
      const index = exports.findIndex(value => compare(value, component.refs));
      if (index > -1) {
        // save referenced export to component
        if (!Array.isArray(component.exportRefs)) {
          component.exportRefs = [];
        }
        component.exportRefs.push(exports[index] as any);
        components.exported.push(component);
        exports.splice(index, 1);
      }
    }
    if (exports.length === 0) {
      return;
    }
    // handle not exported
    const label = exports
      .map(value => {
        const name =
          typeof value === 'function' ? value.name : value.toString();
        return `"${name}"`;
      })
      .join(', ');
    throw new Error(
      `Module "${moduleRef.name}" cannot export missing or duplicate components [${label}].`
    );
  }

  private createComponent<T = unknown>(
    value: ModuleComponent<T>,
    moduleRef: ModuleRef
  ): ComponentInstance<T> {
    const [type, ref] = value.class
      ? (['class', value.class] as const)
      : value.function
      ? (['function', value.function] as const)
      : value.async
      ? (['async', value.async] as const)
      : (['value', value.value] as const);
    const allRefs = Array.isArray(value.ref)
      ? value.ref
      : typeof value.ref !== 'undefined' && value.ref !== null
      ? [value.ref]
      : [];
    // include self in refs
    const refs = type === 'value' ? allRefs : [ref, ...allRefs];
    const component = (
      type === 'value'
        ? { type, refs, value: ref }
        : type === 'async'
        ? { type, ref, refs }
        : { type, ref, refs, moduleRef }
    ) as ComponentInstance<T>;
    const override = this.overrides.find(
      (item): item is ComponentFactory<T> => {
        return item.type === type && compare(item.ref, refs);
      }
    );
    if (override) {
      component.factory = override.factory;
    }
    return component;
  }
}
