import {
  AsyncComponent,
  ClassComponent,
  FunctionComponent,
  ModuleRef
} from '../types';

export type ResolvedComponent<T = unknown> = {
  value?: T;
  resolved?: boolean;
  asyncValue?: Promise<T>;
  readonly moduleRef: ModuleRef;
} & (
  | { readonly type: 'class'; readonly ref: ClassComponent<T> }
  | { readonly type: 'async'; readonly ref: AsyncComponent<T> }
  | { readonly type: 'function'; readonly ref: FunctionComponent<T> }
);

export function resolveComponent<T = unknown>(
  value: ResolvedComponent<T>
): Awaited<T> {
  if (value.resolved) {
    return value.value as Awaited<T>;
  }
  value.resolved = true;
  const { ref, type, moduleRef } = value;
  if (type !== 'async') {
    value.value = type === 'class' ? new ref(moduleRef) : ref(moduleRef);
  } else {
    // handle async
    const promise = (value.asyncValue = Promise.resolve(ref()));
    promise.then(result => {
      value.value = result;
      delete value.asyncValue;
    });
  }
  return value.value as Awaited<T>;
}
