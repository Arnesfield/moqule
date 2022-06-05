# moqule

A simple and minimal modularity system.

## Installation

```sh
npm install moqule
```

Use the module:

```javascript
// ES6
import moqule from 'moqule';

// CommonJS
const { moqule } = require('moqule');
```

Use the [UMD](https://github.com/umdjs/umd) build:

```html
<script src="https://unpkg.com/moqule/lib/index.umd.min.js"></script>
```

```javascript
const moduleRef = window.moqule(AppModule, options?);
```

## Usage

### Module Declaration

A module declaration is a simple object that contains the `name` of the module and its metadata.

```typescript
import { Module } from 'moqule';

const MyModule: Module = {
  // required name
  name: 'MyModule',
  // metadata (all optional properties)
  imports: [],
  components: [],
  exports: [],
  provide: [],
  inject: []
};
```

> **Tip**: Using [TypeScript](https://www.typescriptlang.org/), you can import `Module` from the package to include type checking for the module data.

There will be cases where you would need to configure the module with custom options (or you want to wrap the metadata within a function). In that case, you can use the `register` property callback:

```typescript
type Options = {}; // module options type/interface

const MyModule: Module<Options> = {
  name: 'MyModule',
  // register metadata (all optional properties)
  register: (options: Options) => ({
    imports: [],
    components: [],
    exports: [],
    provide: [],
    inject: []
  })
};
```

From there, you can register custom options later when importing the module.

For now, let's talk about the **module metadata**.

### Module Metadata

The **module metadata** is an object that contains the information of the module and its components.

```typescript
export interface ModuleMetadata {
  imports?: (Module | RegisteredModule)[];
  components?: ClassComponent[] | Components;
  exports?: (Module | ComponentId)[];
  provide?: (Module | ComponentId)[];
  inject?: boolean | ComponentId[];
}
```

The metadata is stored within the module declaration.

- `imports` - Import other modules to the module. The module will gain access to the exported components of the imported modules.
- `components` - Components to call or instantiate when the module declaration is resolved. Can be an array of `ClassComponent`s or a `Components` object with the following properties:
  - `class` - Class components array to register to the module.
  - `function` - Function components array to register to the module.
  - `async` - Async function components array to register to the module.
- `exports` - Export registered components or imported modules' components. Exported components will be accessible for consuming modules that import that module.
- `provide` - Provides registered components or imported modules' components to its descendants.
- `inject` - Array of components which will determine if a provided component will be injected to the module. Set to `true` to accept all `provided` components and inject it to the module.

These properties can be dynamic or changed through **register options** or **factory modules**.

### Dynamic Modules

> A **work in progress**.

### Resolve Module Declaration

Start calling/instantiating the module declaration's components by resolving the module using the `moqule` function.

```javascript
import moqule from 'moqule';
```

You can either resolve the module synchronously or asynchronously depending on whether your module includes async components or not.

- Resolve synchronously with `moqule(module, options?)`:

  ```javascript
  const moduleRef = moqule(MyModule);
  ```

  This will immediately return the **module reference** and async components will load asynchronously.

- Resolve asynchronously with `moqule.async(module, options?)`:

  ```javascript
  const moduleRef = await moqule.async(MyModule);
  ```

  This will wait for async components to load first before resolving the promise.

Depending on your use case, you can resolve the same module more than once. This will call or instantiate its components again that is accessible to the **module reference** that it returns.

### Module Reference

> A **work in progress**.

### Components

> A **work in progress**.

## Basic Example

```typescript
import moqule, { Module, ModuleRef } from 'moqule';

class HelloService {
  constructor(private moduleRef: ModuleRef) {}
  hello() {
    console.log('[%s] Hello World!', this.moduleRef.name);
  }
}

const AppModule: Module = {
  name: 'AppModule',
  components: [HelloService]
};

const moduleRef = moqule(AppModule);
const helloService = moduleRef.get(HelloService);
helloService.hello();
```

Output:

```text
[AppModule] Hello World!
```

## License

Licensed under the [MIT License](LICENSE).
