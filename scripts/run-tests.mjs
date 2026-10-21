// Runs every tests/*.test.cjs suite (real SQLite via node:sqlite) and the Python schema check.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const suites = readdirSync('tests').filter((f) => f.endsWith('.test.cjs')).sort();
const failed = [];
for (const file of suites) {
  const run = spawnSync(process.execPath, ['--no-warnings', 'tests/' + file], { encoding: 'utf8' });
  const last = (run.stdout + run.stderr).trim().split('\n').pop();
  if (run.status === 0) console.log('✓', file, '—', last.slice(0, 140));
  else {
    failed.push(file);
    console.error('✗', file + '\n' + run.stdout + run.stderr);
  }
}
const py = spawnSync('python3', ['tests/database.py'], { encoding: 'utf8' });
if (py.error) console.log('- tests/database.py skipped (python3 not found)');
else if (py.status === 0) console.log('✓ tests/database.py');
else {
  failed.push('database.py');
  console.error('✗ tests/database.py\n' + py.stdout + py.stderr);
}
console.log(`\n${suites.length + 1 - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
