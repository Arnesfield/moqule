# moqule

A simple and minimal modularity system.

## Installation

```sh
npm install moqule
```

Use the module:

```javascript
// ES6
import * as moqule from 'moqule';

// CommonJS
const moqule = require('moqule');
```

Use the [UMD](https://github.com/umdjs/umd) build:

```html
<script src="https://unpkg.com/moqule/lib/index.umd.min.js"></script>
```

```javascript
const moduleRef = window.moqule.init(AppModule);
```

## Usage

### Module Declaration

A **module declaration** is an object that contains the `name` of the module and its [metadata](#module-metadata).

```javascript
const AppModule = {
  // required name
  name: 'AppModule',
  // metadata (all optional properties)
  imports: [],
  components: [],
  exports: [],
  provide: [],
  inject: []
};
```

> **Tip**: Using [TypeScript](https://www.typescriptlang.org/), you can import the `Module` type from the package to include type checking for the module object. Example:
>
> ```typescript
> import { Module } from 'moqule';
>
> const AppModule: Module = {
>   name: 'AppModule'
>   // ...
> };
> ```

The **module declaration** also accepts a `register` property callback that returns the [metadata](#module-metadata):

```javascript
const AppModule = {
  name: 'AppModule',
  // register metadata (all optional properties)
  register: () => ({
    imports: [],
    components: [],
    exports: [],
    provide: [],
    inject: []
  })
};
```

The `register` callback can be used for handling circular dependencies/imports, but its main use case is for registering options ([dynamic modules](#dynamic-modules)) when we use or import the module for later.

```typescript
// module options type/interface
interface Options {
  // ...
}

const AppModule: Module<Options> = {
  name: 'AppModule',
  register: (options: Options) => ({
    // register metadata (all optional properties)
    imports: [],
    components: [],
    exports: [],
    provide: [],
    inject: []
  })
};
```

From there, we can use the registered options to update the [module metadata](#module-metadata).

### Module Metadata

The **module metadata** is an object that contains the information of the module and its [components](#components).

```typescript
interface ModuleMetadata {
  imports?: (Module | RegisteredModule)[];
  components?: (ClassComponent | ModuleComponent)[];
  exports?: (string | symbol | Module | Component)[];
  provide?: (string | symbol | Module | Component)[];
  inject?: boolean | (string | symbol | Component)[];
}
```

The **module metadata** is stored within the [module declaration](#module-declaration), either together with the module object or returned by the module's `register` callback.

> **Tip**: The **module metadata** properties can be changed through **register options** or **factory modules**.

#### `metadata.imports`

The `metadata.imports` property is an array of modules to import for the module. This module will gain access to the exported [components](#components) ([`metadata.exports`](#metadataexports)) of the imported modules.

```javascript
// my.module.js
const MyModule = {
  name: 'MyModule'
  // ...
};

// app.module.js
// import `MyModule` to `AppModule`
const AppModule = {
  name: 'AppModule',
  imports: [MyModule]
};
```

With the example above, `AppModule` will gain access to exported components of `MyModule`.

#### `metadata.components`

The `metadata.components` property is an array where **components** will be registered.

> **Note**: For now, let's focus on registering components to the **module metadata**. [Components](#components) will have their own section and will be discussed separately.

There are 2 ways to register components.

1. You can pass in an array of `class` components like so:

   ```javascript
   // app.component.js
   class AppComponent {}

   // app.module.js
   const AppModule = {
     name: 'AppModule',
     components: [AppComponent]
   };
   ```

2. Register components as objects depending on their component type (`class`, `function`, `async function`, `value`).

   ```javascript
   // assume components are imported from their own respective files
   class ClassComponent {}
   function FunctionComponent() {}
   async function AsyncComponent() {}

   // app.module.js
   const AppModule = {
     name: 'AppModule',
     components: [
       { class: ClassComponent },
       { function: FunctionComponent },
       { async: AsyncComponent },
       { ref: 'APP_VALUE', value: {} } // any value
     ]
   };
   ```

These registered components will now be accessible by the [module reference](#module-reference), like so:

```javascript
const component = moduleRef.get(ClassComponent);
```

> **Note**: The [module reference](#module-reference) will also be discussed in a separate section.

When registering module components as objects, they can also accept a `ref` property. This `ref` property can be a `string`, `symbol`, the same type as the component, or an array of those together.

```javascript
// assume components are imported from their own respective files
class ClassComponent {}
function FunctionComponent() {}
async function AsyncComponent() {}

const FN_SYMBOL = Symbol('APP_FUNCTION');

// app.module.js
const AppModule = {
  name: 'AppModule',
  components: [
    { ref: 'APP_CLASS', class: ClassComponent },
    { ref: [FN_SYMBOL, 'APP_FUNCTION'], function: FunctionComponent },
    { ref: ['APP_ASYNC'], async: AsyncComponent },
    { ref: 'APP_VALUE', value: {} } // any value
  ]
};
```

You can use these `ref`s to reference the component via the [module reference](#module-reference).

```typescript
// classComponent1 === classComponent2
const classComponent1 = moduleRef.get(ClassComponent);
const classComponent2 = moduleRef.get<ClassComponent>('APP_CLASS');

const functionComponentValue =
  moduleRef.get<ReturnType<typeof FunctionComponent>>(FN_SYMBOL);

const asyncComponentValue = moduleRef.get(AsyncComponent);

const value = moduleRef.get<Record<string, any>>('APP_VALUE');
```

Also, it is important to note that the `ref` property is **required** for `value` components.

Here are valid refs for each component type:

| Component Type | Valid Refs                                       |
| -------------- | ------------------------------------------------ |
| `class`        | `string`, `symbol`, any Class component          |
| `function`     | `string`, `symbol`, any Function component       |
| `async`        | `string`, `symbol`, any Async function component |
| `value`        | `string`, `symbol`                               |

#### `metadata.exports`

The `metadata.exports` property is an array of registered components, refs, or imported modules' components.

```javascript
const AppModule = {
  name: 'AppModule',
  components: [AppComponent],
  exports: [AppComponent]
};
```

Exported components will be accessible through the [module reference](#module-reference) of consuming modules that import that module.

```javascript
const component = moduleRef.get(AppComponent);
```

You can also export the component by using its refs.

```javascript
const AppModule = {
  name: 'AppModule',
  components: [{ ref: 'APP_CLASS', class: AppComponent }],
  exports: ['APP_CLASS']
};
```

Using the example above, modules that import `AppModule` will be able to access `AppComponent` through `'APP_CLASS'` but not `AppComponent` itself.

```typescript
moduleRef.get(AppComponent); // error
moduleRef.get<AppComponent>('APP_CLASS'); // ok
```

#### `metadata.provide`

The `metadata.provide` property is an array that accepts registered components, refs, or imported modules' components. Components or refs included here are provided to the module's descendants.

```javascript
const AppModule = {
  name: 'AppModule',
  imports: [MyModule, OtherModule1, OtherModule2],
  components: [AppComponent],
  provide: [MyModule, AppComponent]
};
```

In the example above, the `AppComponent` component and the exported components of `MyModule` will be provided to `MyModule`, `OtherModule1`, `OtherModule2`, and their descendants.

> **Tip**: Depending on how it is used, using `provide` can act like a global provider for the module and distribute those components to its **submodules**. Note that [`metadata.imports`](#metadataimports) are treated as **submodules**.

You can also use the module name or the component refs like so:

```javascript
const AppModule = {
  name: 'AppModule',
  imports: [MyModule, OtherModule1, OtherModule2],
  components: [{ ref: 'APP_CLASS', class: AppComponent }],
  provide: [MyModule.name, 'APP_CLASS']
};
```

Provided components won't be injected to the submodules unless they are defined in their [`metadata.inject`](#metadatainject) property.

#### `metadata.inject`

The `metadata.inject` property is an array of components or refs which will determine if a provided component will be injected to the module.

```javascript
const OtherModule1 = {
  name: 'OtherModule1',
  inject: [AppComponent]
};
```

Set `inject` to `true` to accept all `provided` components and inject it to the module.

```javascript
const OtherModule1 = {
  name: 'OtherModule1',
  inject: true
};
```

Using our previous [example](#metadataprovide) a while back, `OtherModule1` will inject and gain access to `AppComponent` and exported components from `MyModule`.

### Components

A **component** contains a part of your application. Components have different types: `class`, `function`, an `async function`, or any `value`.

#### Class Components

Class components are classes that require that their _first_ and _only required_ constructor parameter be a `ForwardRef`.

```typescript
import { ForwardRef } from 'moqule';

class AppComponent {
  constructor(forward: ForwardRef<AppComponent>) {
    const moduleRef = forward(this);
    // do stuff with moduleRef
  }
  hello() {
    console.log('Hello %s!', this.name);
  }
}
```

A `ForwardRef` is a callback function that accepts the value of the component (i.e. for class components, it is the instance or `this`) and returns the [module reference](#module-reference).

#### Function Components

Similar to [class components](#class-components), function components are functions that have the `ForwardRef` as their _first_ and _only required_ function parameter.

```typescript
import { ForwardRef } from 'moqule';

interface AppComponentValue {
  hello(): void;
}

function AppComponent(
  forward: ForwardRef<AppComponentValue>
): AppComponentValue {
  const value: AppComponentValue = {
    hello() {
      console.log('Hello World!');
    }
  };
  const moduleRef = forward(value);
  return value;
}
```

Notice that the `ForwardRef` function takes in the return value of the component.

If you do end up needing other required parameters for your components, you can use **function components** as a wrapper and register that function as the component instead.

```typescript
import { ForwardRef } from 'moqule';

class AppComponent {
  // notice required parameter "name"
  constructor(
    forward: ForwardRef<AppComponent>,
    private readonly name: string
  ) {
    const moduleRef = forward(this);
    // do stuff with moduleRef
  }
  hello() {
    console.log('Hello %s!', this.name);
  }
}

// a function component wrapper
function AppComponentWrapper(forward: ForwardRef<AppComponent>): AppComponent {
  return new AppComponent(forward, 'World');
}

// app.module.ts
const AppModule: Module = {
  name: 'AppModule',
  components: [{ ref: 'APP_COMPONENT', function: AppComponentWrapper }]
};
```

```typescript
// reference via moduleRef:
// type `AppComponent` is inferred
const component = moduleRef.get(AppComponentWrapper);
```

You can also register them directly into the [module](#module-declaration) like so:

```typescript
import { ForwardRef, Module } from 'moqule';

const AppModule: Module = {
  name: 'AppModule',
  components: [
    {
      ref: 'APP_COMPONENT',
      function: (forward: ForwardRef<AppComponent>): AppComponent => {
        return new AppComponent(forward, 'World');
      }
    }
  ]
};
```

```typescript
// reference via moduleRef:
const component = moduleRef.get<AppComponent>('APP_COMPONENT');
```

#### Async Function Components

> **TODO:** update section

#### Value Components

> **TODO:** update section

### Module Reference

> **TODO:** update section

### Initialize Module Declaration

> **TODO:** update section

### Dynamic Modules

> **TODO:** update section

## Basic Example

```javascript
const moqule = require('moqule');

class HelloComponent {
  constructor(forward) {
    this.moduleRef = forward(this);
  }
  hello() {
    console.log('[%s] Hello World!', this.moduleRef.name);
  }
}

const AppModule = {
  name: 'AppModule',
  components: [HelloComponent]
};

const moduleRef = moqule.init(AppModule);
const helloComponent = moduleRef.get(HelloComponent);
helloComponent.hello();
```

Output:

```text
[AppModule] Hello World!
```

## License

Licensed under the [MIT License](LICENSE).
