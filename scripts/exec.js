import { spawn } from 'child_process';

/** @type {import('child_process').SpawnOptions} */
const spawnOptions = {
  stdio: 'inherit',
  detached: true,
  cwd: process.cwd(),
  env: { FORCE_COLOR: true, PATH: process.env.PATH }
};

/**
 * Run commands.
 * @param {(string | false)[][]} commands
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function exec(...commands) {
  console.time('done');
  const processes = commands.map(command => {
    const cmd = command[0];
    /** @type {string[]} */
    const options = command.slice(1).filter(option => !!option);
    console.log('>', cmd, ...options);
    console.log();
    /** @type {import('child_process').ChildProcess} */
    const childProcess = spawn(cmd, options, spawnOptions);
    return childProcess;
  });

  const kill = signal => {
    for (const childProcess of processes) {
      childProcess.kill(signal);
    }
  };

  // handle exit
  for (const childProcess of processes) {
    childProcess.on('exit', code => {
      if (typeof code === 'number' && code !== 0) {
        process.exitCode = code;
        kill(code);
      }
    });
  }
  process.on('SIGINT', kill);
  process.on('exit', code => {
    console.timeEnd('done');
    if (typeof code === 'number' && code !== 0) {
      console.log('exit:', code);
    }
  });
}
