import { ClassComponent, FunctionComponent, ModuleRef } from '../types';

export type ResolvedComponent<T = unknown> = {
  value?: T;
  resolved: boolean;
  moduleRef: ModuleRef;
} & (
  | { type: 'class'; ref: ClassComponent<T> }
  | { type: 'function'; ref: FunctionComponent<T> }
);

export function resolveComponent<T = unknown>(value: ResolvedComponent<T>): T {
  if (value.resolved) {
    return value.value as T;
  }
  value.resolved = true;
  value.value =
    value.type === 'class'
      ? new value.ref(value.moduleRef)
      : value.ref(value.moduleRef);
  return value.value;
}
