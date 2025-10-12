import dotenv from 'dotenv';

// Define the EnvConfig interface
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: number;
  JWT_REFRESH_EXPIRES_IN: number;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  LOG_FILE: string;
  SOCKET_CORS_ORIGIN: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}

// Load environment variables
dotenv.config();

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (name: string, defaultValue?: number): number => {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

export const env: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3001),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),
  
  // Database
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  MONGODB_TEST_URI: getEnvVar('MONGODB_TEST_URI', 'mongodb://localhost:27017/digital-library-test'),
  
  // JWT
  JWT_ACCESS_SECRET: getEnvVar('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: getEnvNumber('JWT_ACCESS_EXPIRES_IN', 900),
  JWT_REFRESH_EXPIRES_IN: getEnvNumber('JWT_REFRESH_EXPIRES_IN', 604800),
  
  // CORS
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  
  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_FILE: getEnvVar('LOG_FILE', 'logs/app.log'),
  
  // Socket.IO
  SOCKET_CORS_ORIGIN: getEnvVar('SOCKET_CORS_ORIGIN', 'http://localhost:3000'),
  
  // Admin
  ADMIN_EMAIL: getEnvVar('ADMIN_EMAIL'),
  ADMIN_PASSWORD: getEnvVar('ADMIN_PASSWORD'),
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
