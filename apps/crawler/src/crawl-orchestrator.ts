/**
 * Crawl orchestrator — manages parallel market crawls with a fixed concurrency.
 * Keeps MAX_PARALLEL markets running at all times; when one finishes, starts the next.
 * After all markets complete, waits CYCLE_PAUSE then starts a new cycle (continuous mode).
 *
 * Usage:
 *   npx ts-node --transpile-only src/crawl-orchestrator.ts              # default: 4 parallel, continuous
 *   npx ts-node --transpile-only src/crawl-orchestrator.ts 6            # custom concurrency
 *   npx ts-node --transpile-only src/crawl-orchestrator.ts --once       # single cycle, then exit
 *   npx ts-node --transpile-only src/crawl-orchestrator.ts 4 ID RU MX  # only specific markets
 *   npx ts-node --transpile-only src/crawl-orchestrator.ts --once 6 TR US  # single cycle, 6 parallel
 */
import './config';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const ALL_MARKETS = [
  'TR', 'US', 'UK', 'DE',
  'IN', 'BR', 'ID', 'RU',
  'MX', 'JP', 'PH', 'TH',
  'CA', 'AU', 'FR', 'IT',
  'ES', 'EG', 'SA', 'KR', 'AR',
];

// Parse args
const rawArgs = process.argv.slice(2);
let MAX_PARALLEL = 4;
let onceMode = false;
let selectedMarkets: string[] | null = null;

// Filter out flags
const positionalArgs: string[] = [];
for (const arg of rawArgs) {
  if (arg === '--once') {
    onceMode = true;
  } else {
    positionalArgs.push(arg);
  }
}

if (positionalArgs.length > 0) {
  const first = parseInt(positionalArgs[0], 10);
  if (!isNaN(first)) {
    MAX_PARALLEL = first;
    if (positionalArgs.length > 1) {
      selectedMarkets = positionalArgs.slice(1).map(m => m.toUpperCase());
    }
  } else {
    selectedMarkets = positionalArgs.map(m => m.toUpperCase());
  }
}

const marketList = selectedMarkets
  ? ALL_MARKETS.filter(m => selectedMarkets!.includes(m))
  : [...ALL_MARKETS];

/** Pause between cycles (30 minutes) */
const CYCLE_PAUSE_MS = 30 * 60 * 1000;

let cycleNumber = 0;
let queue: string[] = [];
const running = new Map<string, ChildProcess>();
const startTimes = new Map<string, number>();
let cycleResults = new Map<string, { code: number | null; duration: number }>();
let cycleStartTime = 0;

// Ensure logs directory
const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function ts(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const STAGGER_DELAY_MS = 15000; // 15s between starting markets to avoid DB pool exhaustion
let lastStartTime = 0;

function startCycle(): void {
  cycleNumber++;
  cycleStartTime = Date.now();
  cycleResults = new Map();
  queue = [...marketList];
  lastStartTime = 0;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  CYCLE #${cycleNumber} — ${new Date().toISOString()}`);
  console.log(`  Markets: ${marketList.join(', ')} (${marketList.length})`);
  console.log(`  Max parallel: ${MAX_PARALLEL}`);
  console.log(`  Mode: ${onceMode ? 'single run' : 'continuous'}`);
  console.log(`${'='.repeat(50)}\n`);

  startNext();
}

function startNext(): void {
  if (queue.length > 0 && running.size < MAX_PARALLEL) {
    const now = Date.now();
    const timeSinceLast = now - lastStartTime;
    if (lastStartTime > 0 && timeSinceLast < STAGGER_DELAY_MS) {
      const wait = STAGGER_DELAY_MS - timeSinceLast;
      setTimeout(() => startNext(), wait);
      return;
    }

    const market = queue.shift()!;
    lastStartTime = Date.now();
    console.log(`[${ts()}] Starting ${market} (${running.size + 1}/${MAX_PARALLEL} slots, ${queue.length} queued)`);

    startTimes.set(market, Date.now());

    const logFile = fs.createWriteStream(path.join(logsDir, `crawl-${market}.log`), { flags: 'a' });
    logFile.write(`\n--- Cycle #${cycleNumber} start: ${new Date().toISOString()} ---\n`);

    const child = spawn(
      'npx',
      ['ts-node', '--transpile-only', 'src/crawl-all-market.ts', market],
      {
        cwd: path.resolve(__dirname, '..'),
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      },
    );

    child.stdout?.pipe(logFile);
    child.stderr?.pipe(logFile);

    // Print key events to console
    child.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed.includes('SUMMARY') ||
          trimmed.includes('GRAND SUMMARY') ||
          trimmed.includes('categories crawled') ||
          trimmed.includes('ERROR') ||
          trimmed.includes('Fatal')
        ) {
          console.log(`  [${market}] ${trimmed}`);
        }
      }
    });

    running.set(market, child);

    // If more slots available, schedule the next start (with stagger delay)
    if (queue.length > 0 && running.size < MAX_PARALLEL) {
      setTimeout(() => startNext(), STAGGER_DELAY_MS);
    }

    child.on('exit', (code) => {
      const duration = Date.now() - (startTimes.get(market) || 0);
      const durationMin = (duration / 60000).toFixed(1);
      const icon = code === 0 ? 'OK' : 'FAIL';
      console.log(
        `[${ts()}] ${icon} ${market} finished (code=${code}, ${durationMin}min). ` +
          `${running.size - 1} running, ${queue.length} queued`,
      );

      cycleResults.set(market, { code, duration });
      running.delete(market);
      logFile.end();

      // Start next market from queue
      startNext();

      // Cycle complete?
      if (running.size === 0 && queue.length === 0) {
        printCycleSummary();

        if (onceMode) {
          process.exit(0);
        } else {
          // Continuous mode: wait, then start next cycle
          const pauseMin = Math.round(CYCLE_PAUSE_MS / 60000);
          console.log(`\n[${ts()}] Cycle #${cycleNumber} done. Next cycle in ${pauseMin} minutes...\n`);
          setTimeout(() => startCycle(), CYCLE_PAUSE_MS);
        }
      }
    });
  }
}

function printCycleSummary(): void {
  const cycleDuration = Date.now() - cycleStartTime;
  const cycleDurationMin = (cycleDuration / 60000).toFixed(0);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  CYCLE #${cycleNumber} SUMMARY (${cycleDurationMin} min wall time)`);
  console.log(`${'='.repeat(50)}`);
  for (const market of marketList) {
    const r = cycleResults.get(market);
    if (r) {
      const min = (r.duration / 60000).toFixed(1);
      console.log(`  ${market}: ${r.code === 0 ? 'OK' : 'FAIL (code=' + r.code + ')'} — ${min} min`);
    } else {
      console.log(`  ${market}: NOT RUN`);
    }
  }
  const totalCpuMin = (
    Array.from(cycleResults.values()).reduce((s, r) => s + r.duration, 0) / 60000
  ).toFixed(0);
  const failed = Array.from(cycleResults.values()).filter(r => r.code !== 0).length;
  console.log(`\n  Total CPU time: ${totalCpuMin} min, Failed: ${failed}/${marketList.length}`);
  console.log(`${'='.repeat(50)}\n`);
}

// Handle Ctrl+C — kill all child processes
process.on('SIGINT', () => {
  console.log('\nStopping all crawls...');
  for (const [market, child] of running) {
    console.log(`  Killing ${market} (pid=${child.pid})`);
    child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(1), 3000);
});

// Start first cycle
startCycle();
