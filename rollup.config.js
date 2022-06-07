import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const name = pkg.name.slice(pkg.name.lastIndexOf('/') + 1);
const input = 'src/index.ts';
const inputUmd = 'src/index.umd.ts';
const plugins = [esbuild()];

function umd(options) {
  return {
    file: pkg.browser,
    format: 'umd',
    name,
    sourcemap: true,
    exports: 'default',
    ...options
  };
}

export default args => [
  {
    input,
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named' },
      { file: pkg.module, format: 'esm', sourcemap: true, exports: 'named' }
    ],
    plugins
  },
  {
    input: inputUmd,
    output: [
      umd(),
      umd({
        file: pkg.browser.replace(/\.js$/, '.min.js'),
        plugins: [terser()]
      })
    ],
    plugins
  },
  { input, output: { file: pkg.types, format: 'esm' }, plugins: [dts()] },
  // type checking only
  {
    input,
    output: !args.watch ? { file: '/dev/null' } : undefined,
    plugins: [typescript({ noEmit: true, sourceMap: false })],
    watch: { skipWrite: true }
  }
];
