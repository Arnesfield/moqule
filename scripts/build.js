import runAll from 'npm-run-all';

const args = process.argv.slice(2);
const WATCH = args.includes('-w');
const PROD = !WATCH || args.includes('-p');

const esbuildOpts = [WATCH && '--watch', PROD && '--sourcemap'];
const lint = !WATCH ? ['lint', '--max-warnings 0'] : [];
const ts = !WATCH ? ['ts'] : [];
const cjs = ['build:cjs', ...esbuildOpts];
const esm = ['build:esm', WATCH && '--log-level=silent', ...esbuildOpts];
const rollup = [
  'build:rollup',
  WATCH && '--watch --no-watch.clearScreen',
  PROD && '--environment NODE_ENV:production'
];

const commands = [lint, ts, cjs, esm, rollup]
  .map(c => {
    c = c.filter(arg => arg);
    c = c.length > 1 ? c.slice(0, 1).concat('--', c.slice(1)) : c;
    return c.join(' ');
  })
  .filter(c => c);

runAll(commands, {
  parallel: true,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
}).catch(() => {});
