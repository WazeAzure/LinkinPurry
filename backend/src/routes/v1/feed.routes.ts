import { FastifyInstance } from 'fastify';
import { FeedController } from '../../controllers/feed.controller.js';
import { FeedService } from '../../services/feed.service.js';
import { FeedRepository } from '../../repositories/feed.repository.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export async function feedRoutes(fastify: FastifyInstance) {
    const feedRepository = new FeedRepository();
    const feedService = new FeedService(feedRepository);
    const feedController = new FeedController(feedService);

    fastify.get('/all', async (request, reply) => {
        return feedController.getPublicFeeds(request, reply);
    });

    fastify.get(
        '/all/:user_id',
        { preHandler: [authMiddleware] },
        async (request, reply) => {
            return feedController.getAuthenticatedFeeds(request, reply);
        }
      );

    fastify.get('/:user_id', async (request, reply) => {
        await feedController.getFeedsByUserId(request, reply);
    });
    
    fastify.post(
        '/',
        {
            preHandler: [authMiddleware]
        },
        async (request, reply) => {
            await feedController.addNewPost(request, reply);
        }
    );

    fastify.put(
        '/:post_id',
        { preHandler: [authMiddleware] },
        async (request, reply) => {
          await feedController.editPost(request, reply);
        }
    );     
    
    fastify.delete(
        '/:post_id',
        { preHandler: [authMiddleware] },
        async (request, reply) => {
          await feedController.deletePost(request, reply);
        }
      );
      

}
