import { FastifyInstance } from "fastify";
import { ConnectionController } from "../../controllers/connection.controller.js";
import { ConnectionService } from "../../services/connection.service.js";
import { ConnectionRepository } from "../../repositories/connection.repository.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";


export async function connectionRoutes(fastify: FastifyInstance) {
  const connectionRepo = new ConnectionRepository();
  const userRepo = new UserRepository();
  const connectionService = new ConnectionService(connectionRepo, userRepo);
  const connectionController = new ConnectionController(connectionService);

  interface DecodedToken {
    userId: string;
    email: string;
    exp: number;
  }
   
  const decodeToken = (token: string): DecodedToken | null => {
    try {
      console.log(token);
      console.log("Decoding token...");
      const [, payload] = token.split(".");
      if (!payload) {
        throw new Error("Invalid token format");
      }
  
      const decodedPayload = atob(payload);
      console.log("Token decoded successfully:", decodedPayload);
      return JSON.parse(decodedPayload);
    } catch (err) {
      console.error("Failed to decode token:", err);
      return null;
    }
  }; 

  // Route for fetching all connections of the authenticated user
  fastify.get(
    "/",
    { 
      preHandler: [authMiddleware] 
    },
    async (request, reply) => {
      const userId = request.user.id;
      
      if (!userId) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }
      return connectionController.getAllUser(request, reply)
    }
  );

  fastify.get(
    "/public",
    async (request, reply) => {
      return connectionController.getAllUser(request, reply)
    }
  );

  // Route for fetching connections of a specific user by user_id
  fastify.get(
    "/:user_id",
    { 
      preHandler: [authMiddleware] 

    },
    async (request, reply) => {
      const userId = request.user.id; 
      
      // If userId is not found (shouldn't happen with proper middleware), respond with unauthorized
      if (!userId) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }
      return connectionController.getUserConnectionsById(request, reply)
    }
  );

  // Route for deleting a connection
  fastify.delete(
    "/:connection_id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return connectionController.deleteConnection(request, reply);
    }
  );

  // Route for creating a connection
  fastify.post(
    "/",
    { preHandler: [authMiddleware] },
    async (request, reply) => connectionController.createConnection(request, reply)
  );
}
  