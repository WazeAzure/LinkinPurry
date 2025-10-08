import { FastifyInstance } from "fastify";
import { ChatController } from "../../controllers/chat.controller.js";
import { ChatService } from "../../services/chat.service.js";
import { ChatRepository } from "../../repositories/chat.repository.js";
import { authMiddleware } from '../../middlewares/auth.middleware.js';


export async function chatRoutes(fastify: FastifyInstance) {


  const chatRepository = new ChatRepository();
  const chatService = new ChatService(chatRepository);
  const chatController = new ChatController(chatService);

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

fastify.get(
    "/:user_id",
    {
      preHandler: [authMiddleware], // Apply the auth middleware
    },
    async (request, reply) => {
      // Access userId from the request object
      const userId = request.user.id; 
      
      // If userId is not found (shouldn't happen with proper middleware), respond with unauthorized
      if (!userId) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }

      // Pass the userId to the controller
      return chatController.getChats(request, reply);
    }
  );

  const userConnections = new Map<string, Set<any>>();

  fastify.get("/ws", { websocket: true }, (connection, req) => {
    const authToken = req.query.authToken;

    if (!authToken) {
      connection.close();
      return;
    }

    const decoded = decodeToken(authToken);
    if (!decoded || !decoded.userId) {
      connection.close();
      return;
    }

    const userId = String(decoded.userId);

    // Use a Set to store multiple connections for the same user
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    
    const userConnectionSet = userConnections.get(userId)!;
    userConnectionSet.add(connection);

    console.log(`User ${userId} connected. Total connections: ${userConnectionSet.size}`);

    connection.on("message", async (message) => {
      try {
        const { recipientId, content, timestamp } = JSON.parse(message.toString());
        const normalizedRecipientId = String(recipientId);

        // Find recipient connections
        const recipientConnectionSet = userConnections.get(normalizedRecipientId);
        if (recipientConnectionSet && recipientConnectionSet.size > 0) {
          const messageToSend = JSON.stringify({
            senderId: userId,
            recipientId,
            content,
            // timestamp: savedMessage.timestamp,
            timestamp: new Date().toISOString(),
          });

          // Send to recipient connections
          let messageSent = false; // Flag to track if the message has already been sent
          recipientConnectionSet.forEach(conn => {
            try {
              if (!messageSent) {
                conn.send(messageToSend); // Send only once
                messageSent = true; // Set the flag to true
                console.log(`Message sent to recipient connection`);
              }
            } catch (sendError) {
              console.error(`Error sending to a recipient connection: ${sendError}`);
              recipientConnectionSet.delete(conn); // Remove broken connections
            }
          });
          if (!messageSent) {
            console.warn(`No successful sends to recipient ${normalizedRecipientId}`);
          }
        } else {
          console.warn(`No active connections for recipient ${normalizedRecipientId}`);
        }

        await chatService.saveMessage(
          userId, recipientId, content, new Date(timestamp)
        );

      } catch (err) {
        console.error("Error handling WebSocket message:", err);
      }
    });

    connection.on("close", () => {
      userConnectionSet.delete(connection);
      
      if (userConnectionSet.size === 0) {
        userConnections.delete(userId);
      }

      console.log(`Connection closed for user: ${userId}. Remaining connections: ${userConnectionSet.size}`);
    });
  });
    
}
