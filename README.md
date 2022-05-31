# template.ts

TypeScript template repository.

---

Run initial setup:

```sh
npm init
```

Install dependencies:

```sh
npm install --save-dev \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint rimraf rollup rollup-plugin-dts rollup-plugin-esbuild typescript
```

If Node module type declarations are required, include:

```sh
npm install --save-dev @types/node
```

---

Example for `package.json`:

```json
{
  // "sideEffects": false,
  "exports": {
    "import": "./lib/esm/index.js",
    "require": "./lib/cjs/index.js",
    "default": "./lib/esm/index.js"
  },
  "main": "lib/cjs/index.js",
  "module": "lib/esm/index.js",
  "browser": "lib/index.umd.js",
  "types": "lib/types/index.d.ts",
  "files": ["lib"],
  "scripts": {
    "prebuild": "rimraf lib",
    "build": "rollup -c",
    "lint": "eslint . --ext .js,.ts",
    "lint:fix": "npm run lint -- --fix",
    "start": "npm run build -- -w"
  }
}
```
