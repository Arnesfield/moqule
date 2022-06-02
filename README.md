# moqule

A simple and minimal module system.

```javascript
import moqule from 'moqule';

function HelloService(moduleRef) {
  return { hello: () => console.log('[%s] Hello World!', moduleRef.name) };
}

const app = moqule('AppModule', {
  components: [{ HelloService }]
});

const moduleRef = app.resolveSync();
const helloService = moduleRef.get(HelloService);
helloService.hello();
```

Output:

```
[AppModule] Hello World!
```

## Usage

> A **work in progress**.

## License

Licensed under the [MIT License](LICENSE).
