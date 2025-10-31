import { createServer } from 'http';
import { createApp, setupErrorHandling } from './config/app';
import { database } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import { AuthService } from './services/AuthService';
import { SocketService } from './services/SocketService';
import { initializeSocket } from './config/socket';
import './utils/createUploadsDir';
import path from 'path';
import express from 'express';

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await database.connect();

    // Create Express app and HTTP server
    const app = createApp();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const socketManager = initializeSocket(httpServer);
    const socketService = new SocketService();
    logger.info('Socket.IO initialized successfully');

    // Import and setup routes after initialization
    const authRoutes = require('./routes/authRoutes').default;
    const userRoutes = require('./routes/userRoutes').default;
    const bookRoutes = require('./routes/bookRoutes').default;
    const adminRoutes = require('./routes/adminRoutes').default;
    const bookingRoutes = require('./routes/bookingRoutes').default;
    const socketRoutes = require('./routes/socketRoutes').default;
    const dashboardRoutes = require('./routes/dashboardRoutes').default;
    const eventsAndAnnouncementsRoutes = require('./routes/eventsAndAnnouncementsRoutes').default;

    app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
    app.use(`/api/${env.API_VERSION}/users`, userRoutes);
    app.use(`/api/${env.API_VERSION}/books`, bookRoutes);
    app.use(`/api/${env.API_VERSION}/admin`, adminRoutes);
    app.use(`/api/${env.API_VERSION}/bookings`, bookingRoutes);
    app.use(`/api/${env.API_VERSION}/socket`, socketRoutes);
    app.use(`/api/${env.API_VERSION}/dashboard`, dashboardRoutes);
    app.use(`/api/${env.API_VERSION}/events-announcements`, eventsAndAnnouncementsRoutes);

    // Serve frontend static files
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    // Handle SPA routing
    app.get('*', (req, res) => {
      if (!req.originalUrl.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
      }
    });

    // Setup error handling
    setupErrorHandling(app);

    // Create default admin user
    const authService = new AuthService();
    authService.setSocketService(socketService);
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
