#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File for storing data
const DATA_FILE = path.join(__dirname, 'mandays.json');
const HOURS_PER_DAY = 8;

// Load data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error.message);
  }
  return { tasks: {}, activeTask: 'default' };
}

// Save data
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving data:', error.message);
  }
}

// Parse time from H:MM format to minutes
function parseTime(timeStr) {
  const match = timeStr.match(/^(\d+):(\d+)$/);
  if (!match) {
    throw new Error('Invalid time format. Use H:MM or HH:MM');
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (minutes >= 60) {
    throw new Error('Minutes must be between 0-59');
  }
  return hours * 60 + minutes;
}

// Format minutes to H:MM
function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// Calculate mandays
function calculateMandays(totalMinutes) {
  const totalHours = totalMinutes / 60;
  const mandays = totalHours / HOURS_PER_DAY;
  return mandays;
}

// Add time to a task
function addTime(data, taskName, timeStr) {
  const minutesToAdd = parseTime(timeStr);

  if (!(taskName in data.tasks)) {
    data.tasks[taskName] = 0;
  }

  data.tasks[taskName] += minutesToAdd;
  data.activeTask = taskName;

  saveData(data);

  const totalMinutes = data.tasks[taskName];
  const mandays = calculateMandays(totalMinutes);

  console.log(`✓ Added ${timeStr} to task "${taskName}"`);
  console.log(`  Total time: ${formatTime(totalMinutes)}`);
  console.log(`  Mandays: ${mandays.toFixed(3)} MD (${mandays.toFixed(2)} MD)`);
}

// Show summary of all tasks
function showSummary(data) {
  if (Object.keys(data.tasks).length === 0) {
    console.log('No tasks recorded yet.');
    return;
  }

  console.log('\n=== TASK OVERVIEW ===\n');

  let totalMinutes = 0;

  for (const [taskName, minutes] of Object.entries(data.tasks)) {
    const mandays = calculateMandays(minutes);
    const isActive = taskName === data.activeTask ? ' <- ACTIVE' : '';

    console.log(`${taskName}${isActive}`);
    console.log(`  Time: ${formatTime(minutes)}`);
    console.log(`  Mandays: ${mandays.toFixed(3)} MD (${mandays.toFixed(2)} MD)`);
    console.log('');

    totalMinutes += minutes;
  }

  if (Object.keys(data.tasks).length > 1) {
    const totalMandays = calculateMandays(totalMinutes);
    console.log('--- TOTAL ---');
    console.log(`  Time: ${formatTime(totalMinutes)}`);
    console.log(`  Mandays: ${totalMandays.toFixed(3)} MD (${totalMandays.toFixed(2)} MD)`);
  }
}

// Switch active task
function switchTask(data, taskName) {
  data.activeTask = taskName;
  saveData(data);

  if (taskName in data.tasks) {
    const minutes = data.tasks[taskName];
    const mandays = calculateMandays(minutes);
    console.log(`✓ Switched to task "${taskName}"`);
    console.log(`  Current time: ${formatTime(minutes)}`);
    console.log(`  Mandays: ${mandays.toFixed(3)} MD`);
  } else {
    console.log(`✓ Switched to new task "${taskName}"`);
    console.log(`  No time recorded yet`);
  }
}

// Reset task data
function resetData(data, taskName) {
  if (taskName) {
    // Reset a specific task
    if (taskName in data.tasks) {
      data.tasks[taskName] = 0;
      saveData(data);
      console.log(`✓ Task "${taskName}" has been reset to 0:00`);
    } else {
      console.log(`Task "${taskName}" does not exist`);
    }
  } else {
    // Reset all tasks
    data.tasks = {};
    data.activeTask = 'default';
    saveData(data);
    console.log('✓ All tasks have been reset');
  }
}

// Delete a task
function deleteTask(data, taskName) {
  if (!taskName) {
    console.error('Error: Provide a task name to delete');
    console.log('Usage: md delete <name>');
    process.exit(1);
  }

  if (taskName in data.tasks) {
    const minutes = data.tasks[taskName];
    const mandays = calculateMandays(minutes);

    delete data.tasks[taskName];

    // If the deleted task was active, switch to first available or default
    if (data.activeTask === taskName) {
      const remainingTasks = Object.keys(data.tasks);
      data.activeTask = remainingTasks.length > 0 ? remainingTasks[0] : 'default';
    }

    saveData(data);
    console.log(`✓ Task "${taskName}" has been deleted`);
    console.log(`  Deleted time: ${formatTime(minutes)} (${mandays.toFixed(2)} MD)`);
  } else {
    console.log(`Task "${taskName}" does not exist`);
  }
}

// Show help
function showHelp() {
  console.log(`
MANDAY TRACKER - Help
=====================

Usage:
  md <time>             Add time to the active task
  md                    Show summary of all tasks
  md switch <name>      Switch to a different task
  md delete <name>      Delete a task from the list
  md reset              Reset all tasks to zero
  md reset <name>       Reset a specific task to 0:00
  md help               Show this help message

Examples:
  md 2:15               Add 2 hours 15 minutes to the active task
  md 0:30               Add 30 minutes
  md                    Show summary
  md switch PROJ-123    Switch to task PROJ-123
  md switch dev         Switch to task dev
  md delete PROJ-123    Delete task PROJ-123 from the list
  md reset              Clear all tasks and start fresh
  md reset PROJ-123     Reset task PROJ-123 to 0:00 (keeps it in the list)

Notes:
  - Time format is H:MM or HH:MM
  - 1 manday = ${HOURS_PER_DAY} hours
  - Data is stored in: ${DATA_FILE}
  - Difference between delete and reset:
      delete  removes the task entirely
      reset   only zeroes out the time (task remains in list)
`);
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const data = loadData();

  try {
    if (args.length === 0) {
      // No arguments - show summary
      showSummary(data);
    } else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
      showHelp();
    } else if (args[0] === 'switch') {
      // Switch task
      if (args.length < 2) {
        console.error('Error: Provide a task name to switch to');
        console.log('Usage: md switch <name>');
        process.exit(1);
      }
      switchTask(data, args[1]);
    } else if (args[0] === 'delete' || args[0] === 'del' || args[0] === 'rm') {
      // Delete task
      deleteTask(data, args[1]);
    } else if (args[0] === 'reset') {
      // Reset tasks (args[1] may be undefined to reset all)
      resetData(data, args[1]);
    } else if (args[0].match(/^\d+:\d+$/)) {
      // Add time to active task
      addTime(data, data.activeTask, args[0]);
    } else {
      console.error(`Error: Unknown command "${args[0]}"`);
      console.log('Run "md help" for usage information');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
