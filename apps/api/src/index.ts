import { startServer } from './server.js';
import { logger } from './utils/logger.js';

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled rejection');
  process.exit(1);
});

// Start server
startServer().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
