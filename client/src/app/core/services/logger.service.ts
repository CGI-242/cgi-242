import { Injectable, isDevMode } from '@angular/core';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly isProduction = !isDevMode();
  private readonly logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 100;

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    if (this.isProduction) return;
    this.log('debug', message, context, data);
  }

  /**
   * Log info message
   */
  info(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('info', message, context, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('warn', message, context, data);
  }

  /**
   * Log error message
   */
  error(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('error', message, context, data);
  }

  private log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
    };

    // Store in buffer for potential remote logging
    this.addToBuffer(entry);

    // In production, only log errors and warnings
    if (this.isProduction && level !== 'error' && level !== 'warn') {
      return;
    }

    // Format and output
    const prefix = context ? `[${context}]` : '';
    const formattedMessage = `${prefix} ${message}`;

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

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  /**
   * Get buffered logs (useful for error reporting)
   */
  getBufferedLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer.length = 0;
  }
}
