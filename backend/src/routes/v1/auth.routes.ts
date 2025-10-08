import { FastifyInstance } from 'fastify';
import { AuthController } from '../../controllers/auth.controller.js';
import { AuthService } from '../../services/auth.service.js';
import { registerSchema, loginSchema } from '../../openapi/schemas/auth.schema.js';
import { UserRepository } from '../../repositories/user.repository.js';

export async function authRoutes(fastify: FastifyInstance) {
  const userRepository = new UserRepository();
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  fastify.post(
    '/login',
    {
      schema: loginSchema,
      preHandler: [],
      // onRequest: (request, reply, done) => {
      //   console.log('Request headers:', request.headers);
      //   done();
      // },
      // onResponse: (request, reply, done) => {
      //   console.log('Response headers:', reply.getHeaders());
      //   done();
      // },
    },
    authController.login.bind(authController)
  );

  fastify.post(
    '/signup',
    {
      schema: registerSchema,
      preHandler: []
    },
    authController.register.bind(authController)
  );

}