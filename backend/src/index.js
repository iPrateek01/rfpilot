import app from './app.js';
import { config } from './config/env.js';
import logger from './config/logger.js';
import { prisma } from './lib/prisma.js';
import { startEmailPolling } from './services/email/receiver.js';

const PORT = config.port;

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    // Test database
    await testDatabaseConnection();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📧 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      
      // Start email polling after server starts
      if (config.imap.host && config.imap.user) {
        logger.info('📨 Starting email polling service...');
        startEmailPolling(2); // Check every 2 minutes
      } else {
        logger.warn('⚠️  Email polling disabled - IMAP credentials not configured');
      }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await prisma.$disconnect();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await prisma.$disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();