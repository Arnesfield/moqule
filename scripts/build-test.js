import { exec } from './exec.js';

const args = process.argv.slice(2);
const index = args.indexOf('-w');
const WATCH = index > -1;
if (WATCH) args.splice(index, 1);

exec([
  'esbuild',
  ...args,
  '--format=esm',
  '--outbase=src',
  '--outdir=.test',
  WATCH && '--watch'
]);
