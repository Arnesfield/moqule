import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const name = pkg.name.slice(pkg.name.lastIndexOf('/') + 1);
const input = 'src/index.ts';
const inputUmd = 'src/index.umd.ts';
// skip sourcemap and umd unless production
const PROD = !process.env.ROLLUP_WATCH;

function out(options) {
  return { sourcemap: PROD, exports: 'named', ...options };
}

function umd(options) {
  return out({ format: 'umd', name, exports: 'default', ...options });
}

const configs = [
  {
    input,
    output: [
      out({ file: pkg.main, format: 'cjs' }),
      out({ file: pkg.module, format: 'esm' })
    ],
    plugins: [esbuild()]
  },
  { input, output: { file: pkg.types, format: 'esm' }, plugins: [dts()] },
  // type checking only
  {
    input,
    output: PROD ? { file: '/dev/null' } : undefined,
    plugins: [typescript({ noEmit: true, sourceMap: false })],
    watch: { skipWrite: true }
  }
];

if (PROD) {
  const bundle = {
    input: inputUmd,
    output: [
      umd({ file: pkg.unpkg.replace(/\.min\.js$/, '.js') }),
      umd({ file: pkg.unpkg, plugins: [terser()] })
    ],
    plugins: [esbuild()]
  };
  configs.splice(1, 0, bundle);
}

export default configs;
