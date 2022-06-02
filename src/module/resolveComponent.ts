import { ClassComponent, FunctionComponent, ModuleRef } from '../types';

export type ResolvedComponent<T = unknown> = {
  value?: T;
  resolved?: boolean;
  readonly moduleRef: ModuleRef;
} & (
  | { readonly type: 'class'; readonly ref: ClassComponent<T> }
  | { readonly type: 'function'; readonly ref: FunctionComponent<T> }
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
