import { FastifyRequest, FastifyReply } from "fastify";
import { ConnectionRequestService } from "../services/connection-request.service.js";
import { ConnectionService } from "../services/connection.service.js";
 
interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
}

const decodeToken = (token: string): DecodedToken | null => {
  try {
    if (!token) {
      console.warn("No token provided");
      return null;
    }

    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      throw new Error("Invalid token format");
    }

    const paddedPayload = payloadBase64 + '=='.slice(0, (4 - payloadBase64.length % 4) % 4);

    const decodedPayload = JSON.parse(
      decodeURIComponent(
          atob(paddedPayload)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );

    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email,
      exp: decodedPayload.exp,
    };
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

export class ConnectionRequestController {
  private connectionRequestService: ConnectionRequestService;
  private connectionService: ConnectionService;

  constructor(connectionRequestService: ConnectionRequestService, connectionService: ConnectionService) {
    this.connectionRequestService = connectionRequestService;
    this.connectionService = connectionService;
  }

  async sendRequest(request: FastifyRequest<{Body: {from_id: number, to_id: number}}>, reply: FastifyReply) {
    try {
      const { from_id, to_id } = request.body as {
        from_id: number;
        to_id: number;
      };

      const token = request.cookies.authToken;

      let userId: string | null = null;
      if (token) {
          const decoded = decodeToken(token);
          userId = decoded?.userId || null;
      }

      console.log('User ID who recently accept invitation:', userId);

      if (!userId) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }

      const result = await this.connectionRequestService.sendRequest(from_id, to_id);
      return reply.status(201).send({ success: true, data: result});
    } catch (error) {
      console.error("Error in sendRequest:", error);
      return reply.status(500).send({ success: false, message: "Server error" });
    }
  }

  async acceptDecision(request: FastifyRequest<{Body: {from_id: number, to_id: number}}>, reply: FastifyReply) {
    try {
      const { from_id, to_id } = request.body as {
        from_id: number;
        to_id: number;
      };

      const token = request.cookies.authToken;

      let userId: string | null = null;
      if (token) {
          const decoded = decodeToken(token);
          userId = decoded?.userId || null;
      }

      console.log('User ID who recently accept invitation:', userId);

      if (!userId) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }

      const result = await this.connectionRequestService.handleDecision(from_id, to_id, "accepted");
      // const newDataConnection = await this.connectionService.createConnection(from_id, to_id, userId);
      return reply.status(201).send({ success: true, data: result});
    } catch (error) {
      console.error("Error in acceptDecision:", error);
      return reply.status(500).send({ success: false, message: "Server error" });
    }
  }

  async declineDecision(request: FastifyRequest<{Body: {from_id: number, to_id: number}}>, reply: FastifyReply) {
    try {
      const { from_id, to_id} = request.body as {
        from_id: number;
        to_id: number;
      };

      const token = request.cookies.authToken;

      let userId: string | null = null;
      if (token) {
          const decoded = decodeToken(token);
          userId = decoded?.userId || null;
      }

      console.log('User ID who recently decline invitation:', userId);

      if (!userId) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }

      const result = await this.connectionRequestService.handleDecision(from_id, to_id, "declined");
      return reply.status(201).send({ success: true, data: result});
    } catch (error) {
      console.error("Error in declineDecision:", error);
      return reply.status(500).send({ success: false, message: "Server error" });
    }
  }

  async getRequestsForUser(request, reply) {
    try {
        const userId = request.params.user_id; 

        if (!userId) {
            return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const result = await this.connectionRequestService.getRequestsForUser(userId);
        return reply.send({
            success: true,
            data: result,
        });
    } catch (error) {
      console.error("Error in getRequestsForUser:", error);
      return reply.status(500).send({ success: false, message: error.message });
    }
  }

  async getRequestsFromUser(request, reply) {
    try {
        const userId = request.params.user_id; 

        if (!userId) {
            return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const result = await this.connectionRequestService.getRequestsFromUser(userId);
        return reply.send({
            success: true,
            data: result,
        });
    } catch (error) {
      console.error("Error in getRequestsForUser:", error);
      return reply.status(500).send({ success: false, message: error.message });
    }
  }
}
