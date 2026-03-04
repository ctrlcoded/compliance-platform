const { spawnSync } = require('child_process');
const fs = require('fs');

const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', 'src/index.ts'],
    {
        cwd: __dirname,
        encoding: 'utf-8',
        timeout: 8000,
        env: { ...process.env, NODE_OPTIONS: '' },
    }
);

const output = [
    '=== STDOUT ===',
    result.stdout || '(empty)',
    '=== STDERR ===',
    result.stderr || '(empty)',
    '=== STATUS ===',
    String(result.status),
    '=== SIGNAL ===',
    String(result.signal),
].join('\n');

fs.writeFileSync('crash_log.txt', output, 'utf-8');
console.log('Written to crash_log.txt');
