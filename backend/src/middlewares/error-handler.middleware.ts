import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
    });
  }

  // Handle other specific error types here

  reply.status(error.statusCode || 500).send({
    success: "false",
    // statusCode: error.statusCode || 500,
    message: error.name || 'Internal Server Error',
    error: error.message || 'An unknown error occurred',
  });
}