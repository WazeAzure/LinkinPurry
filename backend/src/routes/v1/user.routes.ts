import { FastifyInstance } from 'fastify';
import { UserController } from '../../controllers/user.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { UserService } from '../../services/user.service.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { updateProfileSchema, userProfileSchema } from '../../openapi/schemas/user.schema.js';
import { publicUserProfileSchema } from '../../openapi/schemas/public-user.schema.js';

export async function userRoutes(fastify: FastifyInstance) {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  fastify.get(
    '/:user_id',
    { 
      schema: userProfileSchema,
      preHandler: [authMiddleware] },
    userController.getProfile.bind(userController)
  );


  fastify.get(
    '/public/:user_id',
    { schema: publicUserProfileSchema },
    userController.getPublicProfile.bind(userController)
  );


  fastify.put(
    '/:user_id',
    {
      schema: updateProfileSchema,
      preHandler: [authMiddleware]
    },
    userController.updateProfile.bind(userController)
  );

}