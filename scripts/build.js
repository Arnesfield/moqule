import { exec } from './exec.js';

const args = process.argv.slice(2);
const WATCH = args.includes('-w');
const PROD = !WATCH || args.includes('-p');

const input = 'src/index.ts';
const esbuildOpts = [
  '--bundle',
  '--outdir=lib',
  WATCH && '--watch',
  PROD && '--sourcemap'
];

exec(
  [
    'esbuild',
    input,
    '--format=cjs',
    '--out-extension:.js=.cjs',
    ...esbuildOpts
  ],
  [
    'esbuild',
    input,
    '--format=esm',
    '--out-extension:.js=.mjs',
    WATCH && '--log-level=silent',
    ...esbuildOpts
  ],
  [
    'rollup',
    '-c',
    WATCH && '--watch',
    WATCH && '--no-watch.clearScreen',
    PROD && '--environment',
    PROD && 'NODE_ENV:production'
  ]
);
