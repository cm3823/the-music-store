import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeDatabase } from './database/init.js';
import albumRoutes from './routes/albums.js';
import searchRoutes from './routes/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Fastify server
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS plugin
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // Add your Render frontend URL here after deployment
  process.env.FRONTEND_URL || 'https://the-music-store-frontend.onrender.com'
];

await fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
});

// Initialize database
try {
  initializeDatabase();
  fastify.log.info('Database initialized successfully');
} catch (error) {
  fastify.log.error('Failed to initialize database:', error);
  process.exit(1);
}

// Register routes
await fastify.register(albumRoutes, { prefix: '/api/albums' });
await fastify.register(searchRoutes, { prefix: '/api/search' });

// Health check endpoint
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    error: 'Internal Server Error',
    message: error.message,
  });
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0'; // Changed for Render deployment
    
    await fastify.listen({ port, host });
    fastify.log.info(`🎵 The Music Store API is running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();