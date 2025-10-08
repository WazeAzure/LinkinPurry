import { ChatRepository } from "../repositories/chat.repository.js";
import { PushService } from "./push.service.js";

export class ChatService {
  private chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  // Fetch all chats for a specific user
  async getChatsForUser(userId: string) {
    return this.chatRepository.findChatsByUser(userId);
  }

  async saveMessage(fromId: string, toId: string, content: string, timestamp: Date): Promise<Chat> {
    const message = await this.chatRepository.create({
      from: { id: fromId },
      to: { id: toId },
      message: content,
      timestamp,
    });

    // send notif to target
    const temp = content.slice(0,20) + "...";
    const result = await PushService.sendNotificationChat(
      toId, {
        notification: {
          title: "New Message!",
          body: temp,
          data: {}
        }
      }
    )
    return await this.chatRepository.save(message);
  }
}
