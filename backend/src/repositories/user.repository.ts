import { BaseRepository } from './base.repository.js';
import { User } from '../entities/user.entity.js';
import { FindOptionsWhere } from 'typeorm';
import { ConnectionRepository } from './connection.repository.js';
import { FeedRepository } from './feed.repository.js';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async checkConnection(authUserId: string, requestedUserId: string): Promise<boolean> {
    const connectionRepository = new ConnectionRepository();
    return connectionRepository.checkConnection(authUserId, requestedUserId);
  }
  
  async getRelevantPosts(userId: string): Promise<any[]> {
    const feedRepository = new FeedRepository();
    return feedRepository.findFeedsByUserId(userId);
  }  

  async getConnectionCount(userId: string): Promise<number> {
    const connectionRepository = new ConnectionRepository();
    const count = await connectionRepository.getConnectionCount(userId);
    console.log("COUNT PAGOOGOG: ", count);
    return count;
  }

  async findUserById(userId: string) {
    const user = await this.findById(userId);
    console.log("User found by id:", user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as FindOptionsWhere<User>);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username } as FindOptionsWhere<User>);
  }
  
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const where: FindOptionsWhere<User> = { email };
    if (excludeUserId) {
      Object.assign(where, { id: { $ne: excludeUserId } });
    }
    const count = await this.count(where);
    return count > 0;
  }

  async isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
    const where: FindOptionsWhere<User> = { username };
    if (excludeUserId) {
      Object.assign(where, { id: { $ne: excludeUserId } });
    }
    const count = await this.count(where);
    return count > 0;
  }

  async getAllUsersRepo() {
    return this.repository
      .createQueryBuilder("users")
      .orderBy("users.username", "ASC")
      .getMany();
  }
}