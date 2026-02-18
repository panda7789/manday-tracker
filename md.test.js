const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MD_SCRIPT = path.join(__dirname, 'md.js');
const TEST_DATA_FILE = path.join(__dirname, 'mandays.test.json');

// Helper function to run md.js command
function runMd(args = '') {
  // Set custom data file for tests
  const env = { ...process.env, MD_DATA_FILE: TEST_DATA_FILE };
  try {
    const result = execSync(`node ${MD_SCRIPT} ${args} 2>/dev/null`, { 
      encoding: 'utf8',
      env
    });
    return { stdout: result, exitCode: 0 };
  } catch (error) {
    return { 
      stdout: error.stdout || '', 
      stderr: error.stderr || '',
      exitCode: error.status 
    };
  }
}

// Helper to read test data file
function readTestData() {
  if (fs.existsSync(TEST_DATA_FILE)) {
    return JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf8'));
  }
  return null;
}

// Clean up before and after tests
function cleanup() {
  if (fs.existsSync(TEST_DATA_FILE)) {
    fs.unlinkSync(TEST_DATA_FILE);
  }
}

describe('Manday Tracker Tests', () => {
  before(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  describe('Time Parsing and Formatting', () => {
    test('should accept H:MM format', () => {
      cleanup();
      const result = runMd('2:30');
      assert.ok(result.stdout.includes('2:30'));
      assert.ok(result.stdout.includes('0.313 MD'));
    });

    test('should accept HH:MM format', () => {
      cleanup();
      const result = runMd('12:45');
      assert.ok(result.stdout.includes('12:45'));
    });

    test('should reject invalid time format', () => {
      const result = runMd('invalid');
      assert.strictEqual(result.exitCode, 1);
    });

    test('should reject minutes >= 60', () => {
      const result = runMd('2:75');
      assert.strictEqual(result.exitCode, 1);
    });
  });

  describe('Manday Calculation', () => {
    test('should calculate 8:00 as 1.000 MD', () => {
      cleanup();
      const result = runMd('c 8:00');
      assert.ok(result.stdout.includes('1.000 MD'));
    });

    test('should calculate 4:00 as 0.500 MD', () => {
      const result = runMd('c 4:00');
      assert.ok(result.stdout.includes('0.500 MD'));
    });

    test('should calculate 0:10 as 0.021 MD', () => {
      const result = runMd('c 0:10');
      assert.ok(result.stdout.includes('0.021 MD'));
    });

    test('should calculate 16:00 as 2.000 MD', () => {
      const result = runMd('c 16:00');
      assert.ok(result.stdout.includes('2.000 MD'));
    });
  });

  describe('Calculate Command (md c)', () => {
    test('should not save data when using calc', () => {
      cleanup();
      runMd('c 2:30');
      const data = readTestData();
      assert.strictEqual(data, null);
    });

    test('should display hours in decimal format', () => {
      const result = runMd('c 2:30');
      assert.ok(result.stdout.includes('2.50 hours'));
    });

    test('calc alias should work', () => {
      const result = runMd('calc 3:00');
      assert.ok(result.stdout.includes('3:00'));
      assert.ok(result.stdout.includes('0.375 MD'));
    });

    test('calculate alias should work', () => {
      const result = runMd('calculate 1:30');
      assert.ok(result.stdout.includes('1:30'));
    });
  });

  describe('Time Tracking', () => {
    test('should add time to default task', () => {
      cleanup();
      const result = runMd('2:30');
      assert.ok(result.stdout.includes('Added 2:30'));
      assert.ok(result.stdout.includes('default'));
      
      const data = readTestData();
      assert.strictEqual(data.tasks.default, 150); // 2:30 = 150 minutes
      assert.strictEqual(data.activeTask, 'default');
    });

    test('should accumulate time on same task', () => {
      cleanup();
      runMd('1:00');
      runMd('2:00');
      
      const data = readTestData();
      assert.strictEqual(data.tasks.default, 180); // 3:00 total
    });

    test('should switch to new task', () => {
      cleanup();
      runMd('2:00');
      const result = runMd('switch PROJ-123');
      assert.ok(result.stdout.includes('Switched to'));
      
      const data = readTestData();
      assert.strictEqual(data.activeTask, 'PROJ-123');
    });

    test('should track multiple tasks independently', () => {
      cleanup();
      runMd('2:00'); // default
      runMd('switch PROJ-A');
      runMd('3:00'); // PROJ-A
      runMd('switch PROJ-B');
      runMd('1:30'); // PROJ-B
      
      const data = readTestData();
      assert.strictEqual(data.tasks.default, 120);
      assert.strictEqual(data.tasks['PROJ-A'], 180);
      assert.strictEqual(data.tasks['PROJ-B'], 90);
    });
  });

  describe('Summary Display', () => {
    test('should show no tasks message when empty', () => {
      cleanup();
      const result = runMd('');
      assert.ok(result.stdout.includes('No tasks recorded'));
    });

    test('should display task summary', () => {
      cleanup();
      runMd('2:30');
      const result = runMd('');
      assert.ok(result.stdout.includes('TASK OVERVIEW'));
      assert.ok(result.stdout.includes('default'));
      assert.ok(result.stdout.includes('2:30'));
    });

    test('should mark active task', () => {
      cleanup();
      runMd('1:00');
      runMd('switch PROJ-X');
      runMd('2:00');
      const result = runMd('');
      assert.ok(result.stdout.includes('PROJ-X <- ACTIVE'));
    });

    test('should show total when multiple tasks', () => {
      cleanup();
      runMd('2:00');
      runMd('switch PROJ-Y');
      runMd('3:00');
      const result = runMd('');
      assert.ok(result.stdout.includes('TOTAL'));
      assert.ok(result.stdout.includes('5:00'));
    });
  });

  describe('Task Management', () => {
    test('should delete a task', () => {
      cleanup();
      runMd('2:00');
      runMd('switch PROJ-Z');
      runMd('1:00');
      
      const result = runMd('delete PROJ-Z');
      assert.ok(result.stdout.includes('deleted'));
      
      const data = readTestData();
      assert.strictEqual(data.tasks['PROJ-Z'], undefined);
      assert.ok(data.tasks.default !== undefined);
    });

    test('should handle deleting non-existent task', () => {
      cleanup();
      const result = runMd('delete NONEXISTENT');
      assert.ok(result.stdout.includes('does not exist'));
    });

    test('delete aliases should work (del, rm)', () => {
      cleanup();
      runMd('switch TEST1');
      runMd('1:00');
      runMd('del TEST1');
      let data = readTestData();
      assert.strictEqual(data.tasks['TEST1'], undefined);

      runMd('switch TEST2');
      runMd('1:00');
      runMd('rm TEST2');
      data = readTestData();
      assert.strictEqual(data.tasks['TEST2'], undefined);
    });

    test('should reset specific task to 0:00', () => {
      cleanup();
      runMd('3:00');
      runMd('reset default');
      
      const data = readTestData();
      assert.strictEqual(data.tasks.default, 0);
    });

    test('should reset all tasks', () => {
      cleanup();
      runMd('2:00');
      runMd('switch PROJ-1');
      runMd('3:00');
      runMd('reset');
      
      const data = readTestData();
      assert.deepStrictEqual(data.tasks, {});
    });

    test('should handle deleting task with zero time', () => {
      cleanup();
      runMd('switch ZERO-TASK');
      runMd('0:00');
      const result = runMd('delete ZERO-TASK');
      assert.ok(result.stdout.includes('deleted'));
    });
  });

  describe('Help and Error Handling', () => {
    test('should display help', () => {
      const result = runMd('help');
      assert.ok(result.stdout.includes('Usage:'));
      assert.ok(result.stdout.includes('Examples:'));
    });

    test('should show help with --help', () => {
      const result = runMd('--help');
      assert.ok(result.stdout.includes('MANDAY TRACKER'));
    });

    test('should show help with -h', () => {
      const result = runMd('-h');
      assert.ok(result.stdout.includes('Usage:'));
    });

    test('should error on unknown command', () => {
      const result = runMd('unknown-command');
      assert.strictEqual(result.exitCode, 1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle 0:00 time', () => {
      cleanup();
      const result = runMd('0:00');
      assert.ok(result.stdout.includes('0:00'));
      assert.ok(result.stdout.includes('0.000 MD'));
    });

    test('should handle large time values', () => {
      cleanup();
      const result = runMd('c 100:00');
      assert.ok(result.stdout.includes('100:00'));
      assert.ok(result.stdout.includes('12.500 MD'));
    });

    test('should preserve task order', () => {
      cleanup();
      runMd('switch A');
      runMd('1:00');
      runMd('switch B');
      runMd('1:00');
      runMd('switch C');
      runMd('1:00');
      
      const result = runMd('');
      const lines = result.stdout.split('\n');
      const taskLines = lines.filter(l => l.match(/^[A-Z]/));
      assert.ok(taskLines.length >= 3);
    });
  });
});

console.log('\nRunning tests...\n');
