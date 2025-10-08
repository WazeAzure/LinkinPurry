import { FastifyInstance } from 'fastify';
import { userRoutes } from './v1/user.routes.js';
import { feedRoutes } from './v1/feed.routes.js';
import { connectionRoutes } from './v1/connection.routes.js';
import { connectionRequestRoutes } from './v1/connection-request.routes.js';
import { chatRoutes } from './v1/chat.routes.js';
import { pushSubscriptionRoutes } from './v1/push-subscription.routes.js';
import { authRoutes } from './v1/auth.routes.js';

export async function setupRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/api' });
  fastify.register(userRoutes, { prefix: '/api/profile' });
  fastify.register(feedRoutes, { prefix: '/api/feed' });
  fastify.register(connectionRoutes, { prefix: '/api/connection' });
  fastify.register(connectionRequestRoutes, { prefix: '/api/request' });
  fastify.register(chatRoutes, { prefix: '/api/chat' });
  fastify.register(pushSubscriptionRoutes, { prefix: '/api/subscription' });

}