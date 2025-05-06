
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function createLogger(name) {
  const logFile = path.join(logsDir, `${name}.log`);
  
  function formatDate(date) {
    return date.toISOString();
  }
  
  function writeLog(level, message, ...args) {
    const timestamp = formatDate(new Date());
    
    // Format additional arguments
    let argsText = '';
    if (args.length > 0) {
      argsText = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg);
        }
        return String(arg);
      }).join(' ');
    }
    
    // Combine log message
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${argsText}`.trim() + '\n';
    
    // Write to file
    fs.appendFileSync(logFile, logMessage);
    
    // Also log to console
    console.log(`[${name}] ${logMessage.trim()}`);
  }
  
  return {
    info: (message, ...args) => writeLog('info', message, ...args),
    warn: (message, ...args) => writeLog('warn', message, ...args),
    error: (message, ...args) => writeLog('error', message, ...args),
    debug: (message, ...args) => writeLog('debug', message, ...args)
  };
}

export { createLogger };
