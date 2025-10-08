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

export class ConnectionController {
  private connectionService: ConnectionService;

  constructor(connectionService: ConnectionService) {
    this.connectionService = connectionService;
  }

  // Create a new connection
  async createConnection(request, reply) {
    const { from_id, to_id } = request.body;

    try {
      const connection = await this.connectionService.addConnection(from_id, to_id);
      reply.send({
        success: true,
        message: "Connection created!",
        body: connection,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all connections for the authenticated user
  async getConnections(request, reply) {
    const userId = request.user.id;

    try {
      const connections = await this.connectionService.getUserConnections(userId);
      reply.send({
        success: true,
        data: connections,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all connections for the authenticated user
  async getAllUser(request, reply) {
    // const userId = request.user.id;

    try {
      const connections = await this.connectionService.getAllUsersService();
      return reply.send({
        success: true,
        data: connections,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete a specific connection
  async deleteConnection(request, reply) {
    try {
      const { delete_requester, delete_receiver } = request.body;

      const token = request.cookies.authToken;
    
      let userId: string | null = null;
      if (token) {
        const decoded = decodeToken(token);
        userId = decoded?.userId || null;
      }
  
      if (!userId) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }

      const result = await this.connectionService.removeConnection(String(delete_requester), String(delete_receiver));

      if (!result) {
        return reply.status(404).send({ success: false, message: "Connection not found" });
      }

      return reply.status(200).send({ success: true, message: "Post deleted" });
    } catch (error) {
      return reply.status(500).send({ success: false, message: "Failed to delete post" });
    }
  }

  // Get all connections for a specific user by user_id
  async getUserConnectionsById(request, reply) {
    try {
      const userId = request.params.user_id; 
      // TO-DO ga parse dari url tapi dari cookie
      if (!userId) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }
      const connections = await this.connectionService.getUserConnections(userId);
      return reply.send({
        success: true,
        data: connections,
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
}
 