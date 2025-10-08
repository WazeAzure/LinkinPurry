import { BaseRepository } from "./base.repository.js";
import { Chat } from "../entities/chat.entity.js";
import { FindOptionsWhere } from 'typeorm';

export class ChatRepository extends BaseRepository<Chat> {
  constructor() {
    super(Chat);
  }
  
  // Find chats involving a specific user
  async findChatsByUser(userId: string) {
    return this.repository
      .createQueryBuilder("chat")
      .leftJoinAndSelect("chat.from", "fromUser")
      .leftJoinAndSelect("chat.to", "toUser")
      .where("chat.from_id = :userId OR chat.to_id = :userId", { userId })
      .orderBy("chat.timestamp", "ASC")
      .distinct(true) // Ensure distinct rows
      .getMany();
  }

  async save(chat: Chat): Promise<Chat> {
    return await this.repository.save(chat);
  }
}
