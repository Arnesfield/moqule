import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import pkg from './package.json';

const input = 'src/index.ts';
const inputUmd = 'src/index.umd.ts';
const plugins = [typescript(), esbuild()];

export default [
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
    output: {
      file: pkg.browser,
      format: 'umd',
      name: pkg.name.slice(pkg.name.lastIndexOf('/') + 1),
      sourcemap: true,
      exports: 'default'
    },
    plugins
  },
  { input, output: { file: pkg.types, format: 'esm' }, plugins: [dts()] }
];
