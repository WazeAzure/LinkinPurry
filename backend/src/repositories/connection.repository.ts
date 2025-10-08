import { BaseRepository } from "./base.repository.js";
import { Connection } from "../entities/connection.entity.js";
import { UserRepository } from './user.repository.js';
import { FindOptionsWhere, FindManyOptions } from "typeorm";

export class ConnectionRepository extends BaseRepository<Connection> {
    constructor() {
        super(Connection);
    }

    async checkConnection(userId1: string, userId2: string): Promise<boolean> {
        const connections = await this.repository.find({
            where: [
                { fromId: userId1, toId: userId2 },
                { fromId: userId2, toId: userId1 },
            ],
        });

        console.log("Connection check result:", connections);
        return connections.length > 0;
    }

    async getConnectionCount(userId: string): Promise<number> {
        return this.repository.count({
            where: [
                { fromId: userId }
            ],
        });
    }

    async findConnection(userId1: string, userId2: string): Promise<Connection | null> {
        const connections = await this.repository.find({
            where: [
                { fromId: userId1, toId: userId2 },
                { fromId: userId2, toId: userId1 },
            ],
        });

        return connections.length > 0 ? connections[0] : null;
    }

    async getConnections1(userId: string): Promise<Connection[]> {
        return this.findAll({
            where: [
                { fromId: userId },
                { toId: userId },
            ],
            relations: ["from", "to"], 
        });
    }

    async getConnections(userId: string) {
        return this.repository
          .createQueryBuilder("connection")
          .leftJoinAndSelect("connection.from", "fromUser")
          .leftJoinAndSelect("connection.to", "toUser")
          .where("connection.from_id = :userId", { userId })
          .orderBy("connection.created_at", "ASC").cache(true)
          .getMany();
    }

    async createConnection(fromId: string, toId: string) {
        const userRepository = new UserRepository();
    
        const from_user = await userRepository.findUserById(fromId);
        if (!from_user) {
            return null; // sender not found
        }
        console.log("SENDER FOUND: ", from_user);
    
        const to_user = await userRepository.findUserById(toId);
        if (!to_user) {
            return null; // receiver not found
        }
        console.log("RECEIVER FOUND: ", to_user);
    
        const createdAt = new Date();
        const result = await this.repository
        .createQueryBuilder("connection")
        .insert()
        .values([
            { fromId, toId, createdAt },
            { fromId: toId, toId: fromId, createdAt },
        ])
        .execute();

        return result.identifiers;
    }
    
    async deleteConnection(fromId: string, toId: string): Promise<boolean> {
        const result = await this.repository
        .createQueryBuilder("connection")
        .delete()
        .where("(from_id = :fromId AND to_id = :toId) OR (from_id = :toId AND to_id = :fromId)", { fromId, toId })
        .execute();

        return result.affected > 0;
    }


    async deleteAllConnections(userId: string): Promise<boolean> {
        const result = await this.repository.delete({
            fromId: userId,
        });

        return result.affected > 0;
    }
} 