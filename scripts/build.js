import runAll from 'npm-run-all';

const args = process.argv.slice(2);
const isNode = false;
const WATCH = args.includes('-w');
const PROD = !WATCH || args.includes('-p');

const esbuildOpts = [
  '--bundle --outdir=lib',
  isNode && '--platform=node',
  WATCH && '--watch',
  PROD && '--sourcemap'
];
const cjs = [
  'build:js',
  '--format=cjs --out-extension:.js=.cjs',
  ...esbuildOpts
];
const esm = [
  'build:js',
  '--format=esm --out-extension:.js=.mjs',
  WATCH && '--log-level=silent',
  ...esbuildOpts
];
const rollup = [
  'build:rollup',
  WATCH && '--watch --no-watch.clearScreen',
  PROD && '--environment NODE_ENV:production'
];

const scripts = [cjs, esm, rollup].map(s => {
  s = s.filter(arg => arg);
  s = s.length > 1 ? s.slice(0, 1).concat('--', s.slice(1)) : s;
  return s.join(' ');
});
!WATCH && scripts.unshift('check');

runAll(scripts, {
  parallel: true,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
}).catch(error => process.exit(error.code));
