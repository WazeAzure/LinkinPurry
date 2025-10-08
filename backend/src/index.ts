import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import 'reflect-metadata';

import { config } from './config/environment.js';
import { setupSwagger } from './config/swagger.js';
import { setupRoutes } from './routes';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import { AppDataSource } from './config/database.js';
import { redisClient } from './config/redis.js';
import { populateDB } from './init_db.js';
import { WebPushConfig } from './config/webpush.js';


import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = fastify({
  logger: {
    transport: config.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
  },
});

// Register plugins and routes
async function main() {
  try {
    await AppDataSource.initialize();
    app.log.info('ORM succeed initializled');
    
    // setup cookie plugin
    app.register(cookie, {
      hook: 'onRequest'
    });

    // initiate DB once only
    const flagFilePath = path.join(__dirname, 'db_populated.flag');

    if (!fs.existsSync(flagFilePath)) {
      await populateDB();
      fs.writeFileSync(flagFilePath, 'Database populated');
      app.log.info('Database population complete.');
    } else {
      app.log.info('Database population skipped. Flag exists.');
    }

    
    // setup websocket
    app.register(fastifyWebsocket);
    
    // Configure web push
    WebPushConfig.configure();

    // Security headers
    await app.register(helmet, {
      global: true,
      crossOriginResourcePolicy: {
        policy: 'cross-origin'
      }
    });

    // CORS setup
    await app.register(cors, {
      origin: config.NODE_ENV === 'development' 
        ? 'http://localhost:5173'  // Frontend URL
        : config.CORS_ORIGIN,
      // origin: true,
      credentials: true,
    });

    // Response compression
    await app.register(compress, { 
      encodings: ['gzip', 'deflate']
    });

    // Setup swagger for development
    if (config.NODE_ENV === 'development') {
      await setupSwagger(app);
    }
    
    // Register routes
    await setupRoutes(app);
    
    // Global error handler
    app.setErrorHandler(errorHandler);
    
    // Health check endpoint
    app.get('/health', async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: await checkDatabaseHealth(),
        redis: await checkRedisHealth(),
      }
    }));

    // Serve static files manually
    app.get('/uploads/:filename', (request, reply) => {
      const { filename } = request.params;

      // Build the file path
      const filePath = path.join(__dirname, 'uploads', filename);

      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Stream the file to the client
        reply.header('Content-Type', getContentType(filename)); // Dynamically determine content type
        return fs.createReadStream(filePath);
      } else {
        // File not found
        reply.status(404).send({ error: 'File not found' });
      }
    });

    function getContentType(filename: string): string {
      if (filename.endsWith('.png')) return 'image/png';
      if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
      return 'application/octet-stream';
}
    
    // Start server
    await app.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    });
    
    app.log.info(`Server listening on port ${config.PORT} in ${config.NODE_ENV} mode`);
  } catch (err) {
    app.log.error(err);
    await gracefulShutdown();
    process.exit(1);
  }
}

// Health check functions
async function checkDatabaseHealth() {
  try {
    await AppDataSource.query('SELECT NOW()');
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkRedisHealth() {
  try {
    await redisClient.ping();
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  app.log.info('Shutting down gracefully...');
  
  try {
    await app.close();
    await AppDataSource.destroy();
    await redisClient.quit();
    app.log.info('Shutdown completed');
  } catch (err) {
    app.log.error('Error during shutdown:', err);
    process.exit(1);
  }
}

// Handle unexpected errors
process.on('unhandledRejection', (reason, promise) => {
  app.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  app.log.error('Uncaught Exception:', error);
  gracefulShutdown().then(() => process.exit(1));
});

// Handle shutdown signals
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    app.log.info(`Received ${signal} signal`);
    await gracefulShutdown();
    process.exit(0);
  });
});

main();

export default app;