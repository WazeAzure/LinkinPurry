import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt.util';
import { redisClient } from '../config/redis';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.cookies.authToken;
    console.log(authHeader);
    if (!authHeader) {
      throw new Error('No token provided');
    }

    const token = authHeader;
    const decoded = verifyToken(token);
    console.log(decoded);
    // Verify session in Redis
    // const storedToken = await redisClient.get(`session:${decoded.userId}`);
    // if (!storedToken || storedToken !== token) {
    //   throw new Error('Invalid session');
    // }

    request.user = { id: decoded.userId };
  } catch (error) {
    reply.code(401).send({ success: false, message: 'Unauthorized', error: error });
  }
}