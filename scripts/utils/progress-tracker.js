// Progress tracker utility for terminal operations
class ProgressTracker {
  constructor(total, description = 'Processing') {
    this.total = total;
    this.current = 0;
    this.description = description;
    this.startTime = Date.now();
    this.lastUpdate = 0;
  }

  update(increment = 1, customMessage = null) {
    this.current += increment;
    const now = Date.now();
    
    // Update every 100ms or on completion to avoid too many console writes
    if (now - this.lastUpdate > 100 || this.current >= this.total) {
      this.render(customMessage);
      this.lastUpdate = now;
    }
  }

  render(customMessage = null) {
    const percentage = Math.min(100, Math.round((this.current / this.total) * 100));
    const elapsed = Date.now() - this.startTime;
    const rate = this.current / (elapsed / 1000);
    const eta = this.current < this.total ? Math.round((this.total - this.current) / rate) : 0;
    
    // Create progress bar
    const barLength = 30;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    // Format time
    const formatTime = (seconds) => {
      if (seconds < 60) return `${seconds}s`;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    };

    const message = customMessage || this.description;
    const statusLine = `${message}: [${bar}] ${percentage}% (${this.current}/${this.total})`;
    const timeLine = eta > 0 ? ` | ETA: ${formatTime(eta)} | Rate: ${rate.toFixed(1)}/s` : ` | Completed in ${formatTime(Math.round(elapsed / 1000))}`;
    
    // Clear previous line and write new progress
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
    process.stdout.write(statusLine + timeLine);
    
    if (this.current >= this.total) {
      process.stdout.write('\n');
    }
  }

  complete(message = 'Completed') {
    this.current = this.total;
    this.render(message);
  }

  fail(message = 'Failed') {
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
    console.log(`❌ ${message} (${this.current}/${this.total} processed)`);
  }
}

// Utility functions for colored console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function logStep(step, title, status = 'info') {
  const icons = {
    info: '🔍',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    progress: '⏳'
  };
  
  const stepColors = {
    info: 'cyan',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    progress: 'blue'
  };

  const icon = icons[status] || '•';
  const color = stepColors[status] || 'white';
  
  console.log(`\n${icon} ${colorize(`Step ${step}: ${title}`, color)}`);
}

function logResult(title, value, unit = '') {
  console.log(`   ${colorize('→', 'dim')} ${title}: ${colorize(value + unit, 'bright')}`);
}

function logError(message, error = null) {
  console.log(`\n❌ ${colorize(message, 'red')}`);
  if (error) {
    console.log(`   ${colorize(error.message || error, 'dim')}`);
  }
}

function logSuccess(message) {
  console.log(`\n✅ ${colorize(message, 'green')}`);
}

function logWarning(message) {
  console.log(`\n⚠️ ${colorize(message, 'yellow')}`);
}

function logInfo(message) {
  console.log(`\n💡 ${colorize(message, 'cyan')}`);
}

// Prompt utility for user input
async function prompt(question, defaultValue = null) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const promptText = defaultValue 
      ? `${question} (${defaultValue}): `
      : `${question}: `;
    
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function confirmAction(message, defaultValue = false) {
  const defaultText = defaultValue ? '[Y/n]' : '[y/N]';
  const answer = await prompt(`${message} ${defaultText}`);
  
  if (!answer) return defaultValue;
  
  return answer.toLowerCase().startsWith('y');
}

module.exports = {
  ProgressTracker,
  colorize,
  logStep,
  logResult,
  logError,
  logSuccess,
  logWarning,
  logInfo,
  prompt,
  confirmAction
};