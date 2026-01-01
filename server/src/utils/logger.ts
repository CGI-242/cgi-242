import { config } from '../config/environment.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/* eslint-disable no-console */
class Logger {
  private minLevel: number;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    this.minLevel = LOG_LEVELS[config.logLevel as LogLevel] || LOG_LEVELS.debug;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogMessage {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
    };
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const logMessage = this.formatMessage(level, message, data);
    const prefix = this.context ? `[${this.context}]` : '';
    const timestamp = `[${logMessage.timestamp}]`;
    const levelTag = `[${level.toUpperCase()}]`;

    const formattedMessage = `${timestamp} ${levelTag} ${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data ?? '');
        break;
      case 'info':
        console.info(formattedMessage, data ?? '');
        break;
      case 'warn':
        console.warn(formattedMessage, data ?? '');
        break;
      case 'error':
        console.error(formattedMessage, data ?? '');
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  // Créer un logger enfant avec un contexte spécifique
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(childContext);
  }
}

// Logger par défaut
export const logger = new Logger();

// Factory pour créer des loggers avec contexte
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export default logger;
