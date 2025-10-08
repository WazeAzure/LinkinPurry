import { FastifyInstance } from "fastify";
import { ConnectionRequestController } from "../../controllers/connection-request.controller.js";
import { ConnectionRequestService } from "../../services/connection-request.service.js";
import { ConnectionRequestRepository } from "../../repositories/connection-request.repository.js";
import { ConnectionService } from "../../services/connection.service.js";
import { ConnectionRepository } from "../../repositories/connection.repository.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export async function connectionRequestRoutes(fastify: FastifyInstance) {
  const helperRepo = new ConnectionRepository();
  const userRepo = new UserRepository();
  const repository = new ConnectionRequestRepository();
  const helperService = new ConnectionService(helperRepo, userRepo);
  const service = new ConnectionRequestService(repository, helperRepo);
  const controller = new ConnectionRequestController(service, helperService);

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

  fastify.post(
    "/sendrequest",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return controller.sendRequest(request, reply);
    }
  );

  fastify.post(
    "/accept",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return controller.acceptDecision(request, reply);
    } 
  );

  fastify.delete(
    "/decline",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return controller.declineDecision(request, reply) ;
    }
  );

  fastify.get(
    "/:user_id",
    { 
        preHandler: [authMiddleware] 
    },
    async (request, reply) => {
        // const userId = request.user.id; 

        // if (!userId) {
        //     return reply.status(401).send({ success: false, message: "Unauthorized" });
        // }

        return controller.getRequestsForUser(request, reply)
    }
  );

  fastify.get(
    "/from/:user_id",
    { 
        preHandler: [authMiddleware] 
    },
    async (request, reply) => {
        // const userId = request.user.id; 

        // if (!userId) {
        //     return reply.status(401).send({ success: false, message: "Unauthorized" });
        // }

        return controller.getRequestsFromUser(request, reply)
    }
  );

}