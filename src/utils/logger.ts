import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { env, isDevelopment } from '../config/env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Ensure log directory exists
const logDir = path.dirname(env.LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    if (info instanceof Error) {
      return `${info.timestamp} ${info.level}: ${info.stack}`;
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    level: isDevelopment ? 'debug' : 'info',
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: env.LOG_FILE,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logger
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    context,
  });
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};
