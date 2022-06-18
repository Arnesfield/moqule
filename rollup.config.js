import eslint from '@rollup/plugin-eslint';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const name = pkg.name.slice(pkg.name.lastIndexOf('/') + 1);
const input = 'src/index.ts';
const inputUmd = 'src/index.umd.ts';
// skip sourcemap and umd unless production
const WATCH = process.env.ROLLUP_WATCH;
const PROD = !WATCH || process.env.NODE_ENV === 'production';

function out(options) {
  return { sourcemap: PROD, exports: 'named', ...options };
}

function umd(options) {
  return out({ format: 'umd', name, exports: 'default', ...options });
}

function dev(options) {
  return {
    input,
    output: !WATCH ? { file: '/dev/null' } : undefined,
    watch: { skipWrite: true },
    ...options
  };
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
  // lint and type checking
  dev({ plugins: [eslint(), esbuild()] }),
  dev({ plugins: [typescript({ noEmit: true, sourceMap: false })] })
];

if (PROD) {
  const config = {
    input: inputUmd,
    output: [
      umd({ file: pkg.unpkg.replace(/\.min\.js$/, '.js') }),
      umd({ file: pkg.unpkg, plugins: [terser()] })
    ],
    plugins: [esbuild()]
  };
  configs.splice(1, 0, config);
}

export default configs;
