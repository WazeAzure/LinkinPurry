import { ConnectionRepository } from "../repositories/connection.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

export class ConnectionService {
  private connectionRepo: ConnectionRepository;
  private userRepo: UserRepository;

  constructor(connectionRepo: ConnectionRepository, userRepo : UserRepository) {
    this.connectionRepo = connectionRepo;
    this.userRepo = userRepo;
  }

  async addConnection(fromId: string, toId: string) {
    const existingConnections = await this.connectionRepo.getConnections(fromId);

    if (existingConnections.find(conn => conn.toId === toId)) {
      throw new Error("Connection already exists!");
    }

    return this.connectionRepo.createConnection(fromId, toId);
  }

  async getAllUsersService() {
    return this.userRepo.getAllUsersRepo();
  }

  async getUserConnections(userId: string) {
    return this.connectionRepo.getConnections(userId);
  }

  async removeConnection(fromId: string, toId: string) {
    return this.connectionRepo.deleteConnection(fromId, toId);
  }
}
 