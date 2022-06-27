import { promisify } from 'util';
import _glob from 'glob';
import { exec } from './exec.js';
const glob = promisify(_glob);

const args = process.argv.slice(2);
const index = args.indexOf('-w');
const WATCH = index > -1;
if (WATCH) args.splice(index, 1);

async function main() {
  const files = await glob('src/**/*.ts');
  exec([
    'esbuild',
    ...files,
    '--format=esm',
    '--outbase=src',
    '--outdir=.test',
    WATCH && '--watch'
  ]);
}

main().catch(() => process.exit(1));
