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
const appModule = window.moqule('AppModule', {});
```

## Usage

### Module Declaration

Create a module declaration using `moqule`.

```javascript
import moqule from 'moqule';
```

When you create a module, it only acts as a declaration and will not call or instantiate its components unless it is `resolved`.

There are 4 ways to create a module.

1. Module metadata:

   ```javascript
   const myModule = moqule('MyModule', metadata);
   ```

2. Callback that returns the module metadata:

   ```typescript
   const myModule = moqule<Options>(
     'MyModule',
     (options?: Options) => metadata
   );
   ```

3. Module options object (optional register options):

   ```typescript
   const myModule = moqule<Options>({
     name: 'MyModule',
     register: false,
     metadata: (options?: Options) => metadata
   });
   ```

4. Module options object (required register options):

   ```typescript
   const myModule = moqule<Options>({
     name: 'MyModule',
     register: true,
     metadata: (options: Options) => metadata
   });
   ```

In order to register components to the module, you would need to set its metadata.

### Module Metadata

The **module metadata** is an object that registers and/or provides components.

```typescript
export interface ModuleMetadata {
  imports?: (Module | RegisteredModule)[];
  components?: ClassComponent[] | ModuleComponents;
  exports?: (Module | ComponentId)[];
  provide?: (Module | ComponentId)[];
  inject?: boolean | ComponentId[];
}
```

The metadata is stored within the module declaration.

- `imports` - Import other modules to the module. The module will gain access to the exported components of the imported modules.
- `components` - Components to call or instantiate when the module declaration is resolved. Can be an array of `ClassComponent`s or a `ModuleComponents` object with the following properties:
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

Start calling/instantiating the module declaration's components by resolving the module.

Resolve asynchronously with `module.resolve(options?)`. This will wait for async components to load first before resolving the promise.

```javascript
const moduleRef = await myModule.resolve();
```

Resolve synchronously with `module.resolveSync(options?)`. This will immediately return the **module reference** and async components will load asynchronously.

```javascript
const moduleRef = myModule.resolveSync();
```

> **Tip**: Depending on your use case, you can resolve the same module more than once. This will call or instantiate its components again that is accessible to its **module reference**.

### Module Reference

> A **work in progress**.

### Components

> A **work in progress**.

## Basic Example

```typescript
import moqule from 'moqule';

class HelloService {
  constructor(private moduleRef) {}
  hello() {
    console.log('[%s] Hello World!', this.moduleRef.name);
  }
}

const app = moqule('AppModule', {
  components: [HelloService]
});

const moduleRef = app.resolveSync();
const helloService = moduleRef.get(HelloService);
helloService.hello();
```

Output:

```
[AppModule] Hello World!
```

## License

Licensed under the [MIT License](LICENSE).
