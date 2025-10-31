import mongoose from 'mongoose';
import { env, isTest } from './env';
import { logger } from '../utils/logger';

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      const uri = isTest ? env.MONGODB_TEST_URI : env.MONGODB_URI;
      
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        bufferCommands: false,
      };

      await mongoose.connect(uri, options);
      
      this.isConnected = true;
      logger.info(`Database connected successfully to ${isTest ? 'test' : 'production'} database`);
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('Database connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Database disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('Database reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('Database connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  public async clearDatabase(): Promise<void> {
    if (!isTest) {
      throw new Error('Database clearing is only allowed in test environment');
    }

    try {
      const collections = mongoose.connection.collections;
      
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      
      logger.info('Test database cleared successfully');
    } catch (error) {
      logger.error('Error clearing test database:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (!this.isConnected) {
        return { status: 'error', message: 'Database not connected' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return { 
        status: 'healthy', 
        message: `Database connection is healthy. ReadyState: ${mongoose.connection.readyState}` 
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const database = Database.getInstance();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Gracefully shutting down database connection...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Gracefully shutting down database connection...');
  await database.disconnect();
  process.exit(0);
});
