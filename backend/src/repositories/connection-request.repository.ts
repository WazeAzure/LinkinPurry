import { BaseRepository } from "./base.repository.js";
import { ConnectionRequest } from "../entities/connection-request.entity.js";

export class ConnectionRequestRepository extends BaseRepository<ConnectionRequest> {
  constructor() {
    super(ConnectionRequest);
  }

  async deleteRequest(fromId: string, toId: string) {
    return this.repository
      .createQueryBuilder("connection_request")
      .delete()
      .where("from_id = :fromId AND to_id = :toId", { fromId, toId })
      .execute();
  }

  async findByUserId(userId: string) {
    return this.repository
      .createQueryBuilder("connection_request")
      .leftJoinAndSelect("connection_request.from", "fromUser")
      .leftJoinAndSelect("connection_request.to", "toUser")
      .where("connection_request.to_id = :userId", { userId })
      .orderBy("connection_request.created_at", "DESC")
      .getMany();
  }

  async findByFromUserId(userId: string) {
    return this.repository
      .createQueryBuilder("connection_request")
      .leftJoinAndSelect("connection_request.from", "fromUser")
      .leftJoinAndSelect("connection_request.to", "toUser")
      .where("connection_request.from_id = :userId", { userId })
      .orderBy("connection_request.created_at", "DESC")
      .getMany();
  }

  async findRequest(fromId: string, toId: string) {
    return this.repository
      .createQueryBuilder("connection_request")
      .where("from_id = :fromId AND to_id = :toId", { fromId, toId })
      .getOne();
  }
}
