import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import pkg from './package.json';

const input = 'src/index.ts';
const inputUmd = 'src/index.umd.ts';
const plugins = [esbuild()];

function output(...formats) {
  return formats.map(format => {
    return {
      dir: `lib/${format}`,
      format,
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      exports: 'named'
    };
  });
}

export default [
  { input, output: output('cjs', 'esm'), plugins },
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
  {
    input,
    output: {
      dir: pkg.types.slice(0, pkg.types.lastIndexOf('/')),
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    plugins: [dts()]
  }
];
