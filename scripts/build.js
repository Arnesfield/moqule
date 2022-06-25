import { spawn } from 'child_process';

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

const builds = [
  {
    cmd: 'esbuild',
    options: [input, '--format=cjs', '--out-extension:.js=.cjs', ...esbuildOpts]
  },
  {
    cmd: 'esbuild',
    options: [
      input,
      '--format=esm',
      '--out-extension:.js=.mjs',
      WATCH && '--log-level=silent',
      ...esbuildOpts
    ]
  },
  {
    cmd: 'rollup',
    options: [
      '-c',
      WATCH && '--watch',
      WATCH && '--no-watch.clearScreen',
      PROD && '--environment',
      PROD && 'NODE_ENV:production'
    ]
  }
];

/** @type {import('child_process').SpawnOptions} */
const spawnOptions = {
  stdio: 'inherit',
  detached: true,
  cwd: process.cwd(),
  env: { FORCE_COLOR: true, PATH: process.env.PATH + ':node_modules/.bin' }
};

const processes = builds.map(build => {
  const options = Array.isArray(build.options)
    ? build.options.filter(option => !!option)
    : [];
  console.log('>', build.cmd, ...options);
  console.log();
  /** @type {import('child_process').ChildProcess} */
  const childProcess = spawn(build.cmd, options, spawnOptions);
  return childProcess;
});

function kill(arg) {
  for (const childProcess of processes) {
    childProcess.kill(arg);
  }
}

process.on('SIGINT', kill);
process.on('exit', kill);
