/**
 * Logger professionnel avec Winston
 * - Fichiers avec rotation quotidienne
 * - Format JSON pour parsing
 * - Niveaux de log configurables
 * - Context tracking pour debugging
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from '../config/environment.js';

// Répertoire des logs
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'context'] })
);

// Format JSON pour les fichiers
const jsonFormat = winston.format.combine(
  customFormat,
  winston.format.json()
);

// Format console coloré pour le développement
const consoleFormat = winston.format.combine(
  customFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, context, metadata }) => {
    const ctx = context ? `[${context}]` : '';
    const meta = metadata && Object.keys(metadata).length > 0
      ? `\n${JSON.stringify(metadata, null, 2)}`
      : '';
    return `${timestamp} ${level} ${ctx} ${message}${meta}`;
  })
);

// Transport fichier pour les erreurs
const errorFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: jsonFormat,
  zippedArchive: true,
});

// Transport fichier pour tous les logs
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '14d',
  format: jsonFormat,
  zippedArchive: true,
});

// Transport fichier pour les accès HTTP
const accessFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '7d',
  format: jsonFormat,
  zippedArchive: true,
});

// Transport console
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

// Création du logger principal
const winstonLogger = winston.createLogger({
  level: config.logLevel || 'info',
  defaultMeta: {
    service: 'cgi-engine',
    env: config.nodeEnv,
    serverId: process.env.SERVER_ID || 'default',
  },
  transports: [
    errorFileTransport,
    combinedFileTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: jsonFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: jsonFormat,
    }),
  ],
});

// Ajouter console en développement
if (config.isDevelopment) {
  winstonLogger.add(consoleTransport);
}

// Logger pour les accès HTTP (séparé)
const accessLogger = winston.createLogger({
  level: 'info',
  format: jsonFormat,
  transports: [accessFileTransport],
});

/**
 * Classe Logger compatible avec l'ancienne API
 * Wrap Winston pour maintenir la compatibilité
 */
class Logger {
  private context?: string;
  private winstonLogger: winston.Logger;

  constructor(context?: string, customLogger?: winston.Logger) {
    this.context = context;
    this.winstonLogger = customLogger || winstonLogger;
  }

  private log(level: string, message: string, data?: unknown): void {
    const logData: Record<string, unknown> = {};

    if (this.context) {
      logData.context = this.context;
    }

    if (data !== undefined) {
      if (data instanceof Error) {
        logData.error = {
          message: data.message,
          stack: data.stack,
          name: data.name,
        };
      } else if (typeof data === 'object' && data !== null) {
        Object.assign(logData, data);
      } else {
        logData.data = data;
      }
    }

    this.winstonLogger.log(level, message, logData);
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
    return new Logger(childContext, this.winstonLogger);
  }

  // Log HTTP request (pour le middleware)
  http(message: string, meta?: Record<string, unknown>): void {
    accessLogger.info(message, { context: this.context, ...meta });
  }
}

// Logger par défaut
export const logger = new Logger();

// Factory pour créer des loggers avec contexte
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// Logger d'accès HTTP pour Morgan
export const httpLogger = {
  write: (message: string) => {
    accessLogger.info(message.trim(), { type: 'http-access' });
  },
};

/**
 * Récupérer les statistiques des logs
 */
export function getLogStats(): {
  level: string;
  logDir: string;
  transports: string[];
} {
  return {
    level: winstonLogger.level,
    logDir: LOG_DIR,
    transports: winstonLogger.transports.map(t => t.constructor.name),
  };
}

/**
 * Changer le niveau de log dynamiquement
 */
export function setLogLevel(level: string): void {
  winstonLogger.level = level;
  logger.info(`Log level changed to: ${level}`);
}

/**
 * Flush les logs (utile avant shutdown)
 */
export async function flushLogs(): Promise<void> {
  return new Promise((resolve) => {
    winstonLogger.on('finish', resolve);
    winstonLogger.end();
  });
}

export default logger;
