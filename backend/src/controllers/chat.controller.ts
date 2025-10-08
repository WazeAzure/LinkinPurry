import { FastifyRequest, FastifyReply } from "fastify";
import { ChatService } from "../services/chat.service.js";

export class ChatController {
  private chatService: ChatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  // Handle fetching chats for a user
  async getChats(request: FastifyRequest, reply: FastifyReply) {
    try {
    // TO-DO-DENISE: THIS IS STILL TEMP, SHUDVE GOT THIS FROM TOKEN?
    //   const userId = request.params['user_id']// Extract user ID from token (set by auth middleware)
    const userId = request.user.id; 
      if (!userId) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }

      const chats = await this.chatService.getChatsForUser(userId);
      return reply.send({ success: true, data: chats });
    } catch (error) {
      console.error("Error fetching chats:", error);
      return reply.status(500).send({ success: false, message: "Server error" });
    }
  }
}
