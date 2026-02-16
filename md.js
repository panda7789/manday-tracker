#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Soubor pro ukládání dat
const DATA_FILE = path.join(__dirname, 'mandays.json');
const HOURS_PER_DAY = 8;

// Načtení dat
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Chyba při načítání dat:', error.message);
  }
  return { tasks: {}, activeTask: 'default' };
}

// Uložení dat
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Chyba při ukládání dat:', error.message);
  }
}

// Převod času z formátu H:MM na minuty
function parseTime(timeStr) {
  const match = timeStr.match(/^(\d+):(\d+)$/);
  if (!match) {
    throw new Error('Neplatný formát času. Použijte formát H:MM nebo HH:MM');
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (minutes >= 60) {
    throw new Error('Minuty musí být mezi 0-59');
  }
  return hours * 60 + minutes;
}

// Převod minut na formát H:MM
function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// Výpočet mandayů
function calculateMandays(totalMinutes) {
  const totalHours = totalMinutes / 60;
  const mandays = totalHours / HOURS_PER_DAY;
  return mandays;
}

// Přidání času k tasku
function addTime(data, taskName, timeStr) {
  const minutesToAdd = parseTime(timeStr);
  
  if (!data.tasks[taskName]) {
    data.tasks[taskName] = 0;
  }
  
  data.tasks[taskName] += minutesToAdd;
  data.activeTask = taskName;
  
  saveData(data);
  
  const totalMinutes = data.tasks[taskName];
  const mandays = calculateMandays(totalMinutes);
  
  console.log(`✓ Přidáno ${timeStr} k tasku "${taskName}"`);
  console.log(`  Celkový čas: ${formatTime(totalMinutes)}`);
  console.log(`  Mandayů: ${mandays.toFixed(3)} MD (${mandays.toFixed(2)} MD)`);
}

// Zobrazení přehledu
function showSummary(data) {
  if (Object.keys(data.tasks).length === 0) {
    console.log('Zatím nejsou zaznamenány žádné tasky.');
    return;
  }
  
  console.log('\n=== PŘEHLED TASKŮ ===\n');
  
  let totalMinutes = 0;
  
  for (const [taskName, minutes] of Object.entries(data.tasks)) {
    const mandays = calculateMandays(minutes);
    const isActive = taskName === data.activeTask ? ' ← AKTIVNÍ' : '';
    
    console.log(`${taskName}${isActive}`);
    console.log(`  Čas: ${formatTime(minutes)}`);
    console.log(`  Mandayů: ${mandays.toFixed(3)} MD (${mandays.toFixed(2)} MD)`);
    console.log('');
    
    totalMinutes += minutes;
  }
  
  if (Object.keys(data.tasks).length > 1) {
    const totalMandays = calculateMandays(totalMinutes);
    console.log('--- CELKEM ---');
    console.log(`  Čas: ${formatTime(totalMinutes)}`);
    console.log(`  Mandayů: ${totalMandays.toFixed(3)} MD (${totalMandays.toFixed(2)} MD)`);
  }
}

// Přepnutí aktivního tasku
function switchTask(data, taskName) {
  data.activeTask = taskName;
  saveData(data);
  
  if (data.tasks[taskName]) {
    const minutes = data.tasks[taskName];
    const mandays = calculateMandays(minutes);
    console.log(`✓ Přepnuto na task "${taskName}"`);
    console.log(`  Aktuální čas: ${formatTime(minutes)}`);
    console.log(`  Mandayů: ${mandays.toFixed(3)} MD`);
  } else {
    console.log(`✓ Přepnuto na nový task "${taskName}"`);
    console.log(`  Zatím žádný zaznamenaný čas`);
  }
}

// Vynulování dat
function resetData(data, taskName) {
  if (taskName) {
    // Reset konkrétního tasku
    if (taskName in data.tasks) {
      data.tasks[taskName] = 0;
      saveData(data);
      console.log(`✓ Task "${taskName}" byl vynulován na 0:00`);
    } else {
      console.log(`Task "${taskName}" neexistuje`);
    }
  } else {
    // Reset všech tasků
    data.tasks = {};
    data.activeTask = 'default';
    saveData(data);
    console.log('✓ Všechny tasky byly vynulovány');
  }
}

// Smazání tasku
function deleteTask(data, taskName) {
  if (!taskName) {
    console.error('Chyba: Zadejte název tasku ke smazání');
    console.log('Použití: md delete <název>');
    process.exit(1);
  }
  
  if (taskName in data.tasks) {
    const minutes = data.tasks[taskName];
    const mandays = calculateMandays(minutes);
    
    delete data.tasks[taskName];
    
    // Pokud byl smazaný task aktivní, přepneme na default nebo první dostupný
    if (data.activeTask === taskName) {
      const remainingTasks = Object.keys(data.tasks);
      data.activeTask = remainingTasks.length > 0 ? remainingTasks[0] : 'default';
    }
    
    saveData(data);
    console.log(`✓ Task "${taskName}" byl smazán`);
    console.log(`  Smazaný čas: ${formatTime(minutes)} (${mandays.toFixed(2)} MD)`);
  } else {
    console.log(`Task "${taskName}" neexistuje`);
  }
}

// Zobrazení nápovědy
function showHelp() {
  console.log(`
MANDAY TRACKER - Nápověda
=========================

Použití:
  md <čas>              Přidá čas k aktivnímu tasku
  md                    Zobrazí přehled všech tasků
  md switch <název>     Přepne na jiný task
  md delete <název>     Smaže task ze seznamu
  md reset              Vynuluje všechny tasky
  md reset <název>      Vynuluje konkrétní task na 0:00
  md help               Zobrazí tuto nápovědu

Příklady:
  md 2:15               Přidá 2 hodiny 15 minut k aktivnímu tasku
  md 0:30               Přidá 30 minut
  md                    Zobrazí přehled
  md switch PROJ-123    Přepne na task PROJ-123
  md switch dev         Přepne na task dev
  md delete PROJ-123    Smaže task PROJ-123 ze seznamu
  md reset              Vymaže všechny tasky a začne od nuly
  md reset PROJ-123     Vynuluje task PROJ-123 na 0:00 (ale ponechá v seznamu)

Poznámky:
  - Čas se zadává ve formátu H:MM nebo HH:MM
  - 1 manday = ${HOURS_PER_DAY} hodin
  - Data jsou uložena v: ${DATA_FILE}
  - Rozdíl mezi delete a reset: delete odstraní task úplně, reset pouze vynuluje čas na 0:00
`);
}

// Hlavní funkce
function main() {
  const args = process.argv.slice(2);
  const data = loadData();
  
  try {
    if (args.length === 0) {
      // Bez parametrů - zobrazit přehled
      showSummary(data);
    } else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
      // Nápověda
      showHelp();
    } else if (args[0] === 'switch') {
      // Přepnutí tasku
      if (args.length < 2) {
        console.error('Chyba: Zadejte název tasku pro přepnutí');
        console.log('Použití: md switch <název>');
        process.exit(1);
      }
      switchTask(data, args[1]);
    } else if (args[0] === 'delete' || args[0] === 'del' || args[0] === 'rm') {
      // Smazání tasku
      deleteTask(data, args[1]);
    } else if (args[0] === 'reset') {
      // Vynulování tasků
      resetData(data, args[1]); // args[1] může být undefined pro reset všeho
    } else if (args[0].match(/^\d+:\d+$/)) {
      // Přidání času k aktivnímu tasku
      addTime(data, data.activeTask, args[0]);
    } else {
      console.error(`Chyba: Neznámý příkaz "${args[0]}"`);
      console.log('Použijte "md help" pro nápovědu');
      process.exit(1);
    }
  } catch (error) {
    console.error('Chyba:', error.message);
    process.exit(1);
  }
}

main();
