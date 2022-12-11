import { Component } from './component.types';

export interface Type<T = unknown> extends Function {
  new (...args: any[]): T;
}

/**
 * Reference value.
 */
export type Ref<T = unknown> = string | symbol | Component<T> | Type<T>;
