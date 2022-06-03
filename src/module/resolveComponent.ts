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
} & (
  | {
      readonly type: 'class';
      readonly moduleRef: ModuleRef;
      readonly ref: ClassComponent<T>;
    }
  | {
      readonly type: 'function';
      readonly moduleRef: ModuleRef;
      readonly ref: FunctionComponent<T>;
    }
  | { readonly type: 'async'; readonly ref: AsyncComponent<T> }
);

export function resolveComponent<T = unknown>(
  value: ResolvedComponent<T>
): Awaited<T> {
  if (value.resolved) {
    return value.value as Awaited<T>;
  }
  value.resolved = true;
  const { ref, type } = value;
  if (type !== 'async') {
    const { moduleRef } = value;
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
