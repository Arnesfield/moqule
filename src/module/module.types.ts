import { ClassComponent, FunctionComponent } from '../types';

export interface ResolvedComponent<T = unknown> {
  value: T;
  ref: ClassComponent | FunctionComponent;
}

export type ComponentList = Readonly<
  Record<'exported' | 'module' | 'self', ResolvedComponent[]>
>;
