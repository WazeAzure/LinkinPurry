import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PushService } from '../../services/push.service.js';

// Subscription request body type
interface SubscriptionBody {
    userId: string;
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
  
  // Notification request body type
  interface NotificationBody {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    type: string;
    id: string;
  }

export async function pushSubscriptionRoutes(fastify: FastifyInstance){
    // Get VAPID public key
  fastify.get('/vapid-public-key', async () => {
    return { 
      publicKey: PushService.getPublicKey() 
    };
  });

  // Subscribe endpoint
  fastify.post<{ Body: SubscriptionBody }>(
    '/subscribe', 
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const subscription = request.body.subscription;

        // Validate subscription
        if (!subscription.endpoint || !subscription.keys) {
          return reply.status(400).send({ 
            error: 'Invalid subscription format' 
          });
        }
        const userId = request.body.userId;
        // Add to subscriptions
        const added = PushService.addSubscription(userId, subscription);

        return reply.status(added ? 201 : 200).send({ 
          message: added ? 'Subscription successful' : 'Subscription already exists',
          subscribers: PushService.getSubscriberCount()
        });
      } catch (error) {
        fastify.log.error('Subscription error:', error);
        return reply.status(500).send({ 
          error: 'Failed to process subscription' 
        });
      }
    }
  );

  // Unsubscribe endpoint
  fastify.post<{ Body: { endpoint: string } }>(
    '/unsubscribe', 
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { endpoint } = request.body;

        if (!endpoint) {
          return reply.status(400).send({ 
            error: 'Endpoint is required' 
          });
        }

        const removed = PushService.removeSubscription(endpoint);

        return reply.status(200).send({ 
          message: removed ? 'Unsubscribed successfully' : 'Subscription not found',
          subscribers: PushService.getSubscriberCount()
        });
      } catch (error) {
        fastify.log.error('Unsubscription error:', error);
        return reply.status(500).send({ 
          error: 'Failed to process unsubscription' 
        });
      }
    }
  );

  // Send notification endpoint (for testing/admin)
  fastify.post<{ Body: NotificationBody }>(
    '/send-notification', 
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { title, body, data } = request.body;

        if (!title || !body) {
          return reply.status(400).send({ 
            error: 'Title and body are required' 
          });
        }

        const result = await PushService.sendNotificationToAll({
          notification: {
            title,
            body,
            data: data || {}
          }
        });

        return reply.status(200).send({ 
          message: 'Notifications sent successfully',
          ...result,
          totalSubscribers: PushService.getSubscriberCount()
        });
      } catch (error) {
        fastify.log.error('Notification send error:', error);
        return reply.status(500).send({ 
          error: 'Failed to send notifications' 
        });
      }
    }
  );

  // Send notification to specific user chat
  fastify.post<{ Body: NotificationBody }>(
    '/chat', 
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { title, body, data, userId } = request.body;
        console.log(request.body);
        if (!title || !body) {
          return reply.status(400).send({ 
            error: 'Title and body are required' 
          });
        }

        const result = await PushService.sendNotificationChat(
          userId, {
          notification: {
            title,
            body,
            data: data || {}
          }
        });

        return reply.status(200).send({ 
          message: 'Notifications sent successfully',
          ...result,
          totalSubscribers: PushService.getSubscriberCount()
        });
      } catch (error) {
        fastify.log.error('Notification send error:', error);
        return reply.status(500).send({ 
          error: 'Failed to send notifications' 
        });
      }
    }
  );

  // send notification to feeds all connection
  fastify.post<{ Body: NotificationBody }>(
    '/feed', 
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { title, body, data, userId } = request.body;
        console.log(request.body);
        if (!title || !body) {
          return reply.status(400).send({ 
            error: 'Title and body are required' 
          });
        }

        const result = await PushService.sendNotificationToConnections(
          userId, {
          notification: {
            title,
            body,
            data: data || {}
          }
        });

        return reply.status(200).send({ 
          message: 'Notifications sent successfully',
          ...result,
          totalSubscribers: PushService.getSubscriberCount()
        });
      } catch (error) {
        fastify.log.error('Notification send error:', error);
        return reply.status(500).send({ 
          error: 'Failed to send notifications' 
        });
      }
    }
  );
}