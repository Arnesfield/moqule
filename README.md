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
import { init } from 'moqule';

// CommonJS
const moqule = require('moqule');
const { init } = require('moqule');
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

A **module declaration** is a simple object that contains the `name` of the module and its metadata.

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

Using [TypeScript](https://www.typescriptlang.org/), you can import the `Module` type from the package to include type checking for the module object.

```typescript
import { Module } from 'moqule';

const AppModule: Module = {
  name: 'AppModule'
  // ...
};
```

The module declaration also accepts a `register` property callback that returns the metadata.

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

The `register` callback can be used for handling circular dependencies, but its main use case is for registering options ([dynamic modules](#dynamic-modules)) when we use or import the module for later.

```typescript
interface Options {} // module options type/interface

const AppModule: Module<Options> = {
  name: 'AppModule',
  register: (options: Options) => ({
    imports: []
    // ...
  })
};
```

From there, we can use the registered options to update the **module metadata**.

### Module Metadata

The **module metadata** is an object that contains the information of the module and its components.

```typescript
interface ModuleMetadata {
  imports?: (Module | RegisteredModule)[];
  components?: ClassComponent[] | Components;
  exports?: (string | Module | Component)[];
  provide?: (string | Module | Component)[];
  inject?: boolean | (string | Component)[];
}
```

The metadata is stored within the module declaration.

- `imports`

  Import other modules to the module. The module will gain access to the exported components (`metadata.exports`) of the imported modules.

  ```javascript
  const MyModule = {
    name: 'MyModule'
    // ...
  };

  // import `MyModule` to `AppModule`
  const AppModule = {
    name: 'AppModule',
    imports: [MyModule]
  };
  ```

  With the example above, `AppModule` will gain access to exported components of `MyModule`.

- `components`

  This is where components will be registered. You can pass in an array of `class` components like so:

  ```javascript
  // app.service.ts
  class AppService {}

  // app.module.ts
  const AppModule = {
    name: 'AppModule',
    components: [AppService]
  };
  ```

  For now, let's focus on registering components to the module metadata. [Components](#components) will have their own section and be discussed separately.

  The `components` property can also be an object with the following properties:

  - `class` - Class components array to register to the module.
  - `function` - Function components array to register to the module.
  - `async` - Async function components array to register to the module.

  Example:

  ```javascript
  // assume components are imported from their own respective files
  class ClassService {}
  function FunctionService() {}
  async function AsyncService() {} // returns promise

  // app.module.ts
  const AppModule = {
    name: 'AppModule',
    components: {
      class: [ClassService],
      function: [FunctionService],
      async: [AsyncService]
    }
  };
  ```

- `exports`

  Export registered components or imported modules' components.

  ```javascript
  const AppModule = {
    name: 'AppModule',
    components: [AppService],
    exports: [AppService]
  };
  ```

  Exported components will be accessible through the **module reference** of consuming modules that import that module.

  You can also export the component by using its name.

  ```javascript
  const AppModule = {
    name: 'AppModule',
    components: [AppService],
    exports: ['AppService'] // or [AppService.name]
  };
  ```

  Although, depending on how you build your project, do take note that if there is some sort of minification step involved, it is possible your components' names may change. This may cause issues when using string names to reference the component.

- `provide`

  Provides registered components or imported modules' components to its descendants. Depending on how it is used, using `provide` can act like a global provider for a module's **submodules**.

  Note that `imports` are treated as **submodules**.

  ```javascript
  const AppModule = {
    name: 'AppModule',
    imports: [MyModule, OtherModule1, OtherModule2],
    components: [AppService],
    provide: [MyModule, AppService]
  };
  ```

  In the example above, the `AppService` component and the exported components of `MyModule` will be provided to `OtherModule1`, `OtherModule2`, and their descendants.

  You can also use the name strings like so:

  ```javascript
  const AppModule = {
    name: 'AppModule',
    imports: [MyModule, OtherModule1, OtherModule2],
    components: [AppService],
    provide: ['MyModule', 'AppService'] // or [MyModule.name, AppService.name]
  };
  ```

  Provided components won't be injected to the submodules unless they are defined in their `inject` property.

- `inject`

  Array of components which will determine if a provided component will be injected to the module.

  ```javascript
  const OtherModule1 = {
    name: 'OtherModule1',
    inject: [AppService]
  };
  ```

  You can also use the name strings:

  ```javascript
  const OtherModule1 = {
    name: 'OtherModule1',
    inject: ['AppService'] // or [AppService.name]
  };
  ```

  Set `inject` to `true` to accept all `provided` components and inject it to the module.

  ```javascript
  const OtherModule1 = {
    name: 'OtherModule1',
    inject: true
  };
  ```

  Using our previous example a while back, `OtherModule1` will inject `AppService` and exported modules from `MyModule`.

These properties can be [dynamic](#dynamic-modules) or changed through **register options** or **factory modules**. More importantly, what makes up a module is their **components**.

### Components

A **component** can be a `class`, `function`, or an `async function`. They contain your application logic, or at least subset of it.

Components, excluding `async` components, will have access to a **module reference** by **forward**ing itself.

---

Async function components are simply functions that return a promise.

```javascript
async function AsyncService() {
  // ... do something async
  return value;
}
```

You register them into `async` components:

```javascript
const AppModule = {
  name: 'AppModule',
  components: {
    async: [AsyncService]
  },
  exports: [AsyncService]
};
```

When the module is initialized, registered `async` components will resolve first before other components.

---

Class and function components are simply your typical classes and functions respectively.

- Class component:

  ```javascript
  class AppService {
    hello() {
      console.log('Hello World!');
    }
  }
  ```

- Function component:

  ```javascript
  function AppService() {
    return {
      hello() {
        console.log('Hello World!');
      }
    };
  }
  ```

These components can get registered to a module. This will give them access to a `ForwardRef` function that returns a **module reference**.

- Class component:

  ```typescript
  import { ForwardRef } from 'moqule';

  class AppService {
    constructor(forward: ForwardRef<AppService>) {
      const moduleRef = forward(this);
    }
    hello() {
      console.log('Hello World!');
    }
  }
  ```

- Function component:

  ```typescript
  import { ForwardRef } from 'moqule';

  interface AppServiceValue {
    hello(): void;
  }

  function AppService(forward: ForwardRef<AppServiceValue>): AppServiceValue {
    const value: AppServiceValue = {
      hello() {
        console.log('Hello World!');
      }
    };
    const moduleRef = forward(value);
    return value;
  }
  ```

Notice that the `ForwardRef` function takes in the return value of the component.

- `class` components reference themselves through `this`:

  ```javascript
  const moduleRef = forward(this);
  ```

- `function` components reference their return value:

  ```javascript
  const moduleRef = forward(value);
  ```

---

It should be noted that `moqule` requires that the _first_ and only _required_ parameter of the class component constructor and the function component to be a `ForwardRef`.

If you do end up needing other required parameters for your components, you can create a wrapper function and register that function as the component instead.

Example `app.service.ts`:

```typescript
import { ForwardRef } from 'moqule';

export class AppService {
  // notice required parameter "name"
  constructor(forward: ForwardRef<AppService>, private readonly name: string) {
    const moduleRef = forward(this);
    // do stuff with moduleRef
  }
  hello() {
    console.log('Hello %s!', this.name);
  }
}

// a function component wrapper
export function AppServiceWrapper(forward: ForwardRef<AppService>): AppService {
  return new AppService(forward, 'World');
}
```

And in `app.module.ts`:

```typescript
import { Module } from 'moqule';
import { AppServiceWrapper } from './app.service.ts';

const AppModule: Module = {
  name: 'AppModule',
  components: {
    function: [AppServiceWrapper]
  },
  exports: [AppServiceWrapper]
};
```

With this example, the `AppServiceWrapper` function component becomes the component instead of the `AppService` class.

The same idea applies to `function` components.

Also, for `class` components, you can create a static function that acts as the function component wrapper which then creates your class instance.

In any case, it is up to you how you want to setup and register your components. It is also up to you what components you would like to reference in your component using **module reference**.

### Module Reference

The **module reference** is an object that has a reference to the components of a module declaration.

Consider the following module:

```javascript
const AppModule = {
  name: 'AppModule',
  imports: [MyModule],
  components: [AppService, OtherService]
};
```

The module reference for the `AppModule` will be able to reference the `AppService` and `OtherService` components, as well as the exported components of `MyModule`.

```typescript
interface ModuleRef {
  name: string;
  get<T = unknown>(id: string | Component<T>): Awaited<T>;
  getOptional<T = unknown>(id: string | Component<T>): Awaited<T> | undefined;
  onInit(listener: () => void): void;
}
```

It is mainly used within the components (the return value of the `FowardRef` function).

- `name`

  This pertains to the module name. In our example module above, the name is `'AppModule'`.

- `get(id)`

  The `get` method is used to get the component value that is accessible to the module.

  ```typescript
  class AppService {
    constructor(forward: ForwardRef<AppService>) {
      const moduleRef = forward(this);
      const otherService = moduleRef.get(OtherService);
    }
  }
  ```

  You can also use the name strings:

  ```typescript
  class AppService {
    constructor(forward: ForwardRef<AppService>) {
      const moduleRef = forward(this);
      const otherService = moduleRef.get<OtherService>('OtherService');
    }
  }
  ```

  If the component is not found within the module (or it is `undefined`), an error is thrown. If the component is intended to be optional, you can use `moduleRef.getOptional(id)` instead.

- `getOptional(id)`

  The `getOptional` method has same usage as `get`. The only difference is that it will not throw an error if the component was not found or `undefined`.

  ```javascript
  class AppService {
    constructor(forward) {
      const moduleRef = forward(this);
      // "otherService" type is `OtherService | undefined`
      const otherService = moduleRef.getOptional(OtherService);
    }
  }
  ```

- `onInit(listener)`

  The registered listener will be called once the module has been initialized.

  ```javascript
  class AppService {
    constructor(forward) {
      const moduleRef = forward(this);
      const otherService = moduleRef.get(OtherService);
      moduleRef.onInit(() => {
        otherService.method();
      });
    }
  }
  ```

  If you are certain that your components have circular dependencies, it is recommended that you only access component properties or call its methods after the module has been initialized. In other words, access the properties or call the methods within the `onInit` listener.

  The reason is that a component may not be fully initialized yet if you have circular dependencies (e.g. class methods not yet included, etc.).

Depending on where and what module the component is registered, it will receive a different **module reference** that has a reference to its module's available components.

However, the **module reference** is not only accessible through the components, but also when a module is initialized.

### Initialize Module Declaration

Start calling/instantiating the module declaration's components by initializing the module.

```javascript
import * as moqule from 'moqule';
// or
const moqule = require('moqule');
```

You can either initialize the module synchronously or asynchronously depending on whether your module includes async components or not.

- `moqule.init(module, options?)`

  This will initialize synchronously and will immediately return the **module reference**.

  ```javascript
  const moduleRef = moqule.init(MyModule);
  ```

  Async components will load asynchronously and most may not be resolved yet which could cause issues when a component tries to reference them via the **module reference**.

- `moqule.initAsync(module, options?)`

  This will initialize asynchronously and will wait for async components to load first before resolving the promise.

  ```javascript
  const moduleRef = await moqule.initAsync(MyModule);
  ```

Depending on your use case, you can initialize the same module more than once. This will call or instantiate its components again that is accessible to the **module reference** that it returns.

```javascript
class MyComponent {}

const MyModule = {
  name: 'MyModule',
  components: [MyComponent],
  exports: [MyComponent]
};

const AppModule = {
  name: 'AppModule',
  imports: [MyModule]
};

// each init() call will call/instantiate components
const appRef = moqule.init(AppModule);
const appRef2 = moqule.init(AppModule);
const myRef = moqule.init(MyModule);

// get MyComponent from different module refs
const c1 = appRef.get(MyComponent);
const c2 = appRef2.get(MyComponent);
const c3 = myRef.get(MyComponent);

// different instances
console.log(c1 !== c2); // true
console.log(c1 !== c3); // true
console.log(c2 !== c3); // true
```

### Dynamic Modules

> A **work in progress**.

## Basic Example

```javascript
const moqule = require('moqule');

class HelloService {
  constructor(forward) {
    this.moduleRef = forward(this);
  }
  hello() {
    console.log('[%s] Hello World!', this.moduleRef.name);
  }
}

const AppModule = {
  name: 'AppModule',
  components: [HelloService]
};

const moduleRef = moqule.init(AppModule);
const helloService = moduleRef.get(HelloService);
helloService.hello();
```

Output:

```text
[AppModule] Hello World!
```

## License

Licensed under the [MIT License](LICENSE).
