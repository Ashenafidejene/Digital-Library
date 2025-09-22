import { createServer } from 'http';
import { createApp, setupErrorHandling } from './config/app';
import { database } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import { AuthService } from './services/AuthService';
import { initializeSocket } from './config/socket';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import adminRoutes from './routes/adminRoutes';
import bookingRoutes from './routes/bookingRoutes';
import socketRoutes from './routes/socketRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await database.connect();

    // Create Express app and HTTP server
    const app = createApp();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const socketManager = initializeSocket(httpServer);
    logger.info('Socket.IO initialized successfully');

    // Setup routes
    app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
    app.use(`/api/${env.API_VERSION}/users`, userRoutes);
    app.use(`/api/${env.API_VERSION}/books`, bookRoutes);
    app.use(`/api/${env.API_VERSION}/admin`, adminRoutes);
    app.use(`/api/${env.API_VERSION}/bookings`, bookingRoutes);
    app.use(`/api/${env.API_VERSION}/socket`, socketRoutes);
    app.use(`/api/${env.API_VERSION}/dashboard`, dashboardRoutes);

    // Setup error handling
    setupErrorHandling(app);

    // Create default admin user
    const authService = new AuthService();
    await authService.createDefaultAdmin();

    // Start server
    const server = httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📚 Digital Library API v${env.API_VERSION} is ready!`);
      logger.info(`🔗 Health check: http://localhost:${env.PORT}/health`);
      logger.info(`📖 API docs: http://localhost:${env.PORT}/api-docs`);
      logger.info(`⚡ Socket.IO enabled for real-time features`);
      logger.info(`👥 Connected users: ${socketManager.getConnectedUsersCount()}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed.');
        
        try {
          await database.disconnect();
          logger.info('Database connection closed.');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
