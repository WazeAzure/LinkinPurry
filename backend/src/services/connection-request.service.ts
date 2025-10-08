import { ConnectionRequestRepository } from "../repositories/connection-request.repository.js";
import { ConnectionRepository } from "../repositories/connection.repository.js";
// import { UserRepository } from "../repositories/user.repository.js";

export class ConnectionRequestService {
  private connectionRequestRepo: ConnectionRequestRepository;
  private connectionRepo: ConnectionRepository;
  // private userRepo: UserRepository;
  

  constructor (connectionRequestRepo: ConnectionRequestRepository, connectionRepo: ConnectionRepository) {
    this.connectionRequestRepo = connectionRequestRepo;
    this.connectionRepo = connectionRepo;
    // this.userRepo = userRepo
  }

  async sendRequest(fromId: number, toId: number) {
    const existingRequest = await this.connectionRequestRepo.findRequest(String(fromId), String(toId));
    if (existingRequest) {
      return { success: false, message: "Request already exists" };
    }

    const newRequest = await this.connectionRequestRepo.create({ 
      fromId, 
      toId, 
      createdAt : new Date() });
    return { success: true, message: "Request sent", body: newRequest };
  }

  async handleDecision(fromId: number, toId: number, decision: string) {
    const request = await this.connectionRequestRepo.findRequest(String(fromId), String(toId));

    if (!request) {
      return { success: false, message: "Request not found" };
    }

    if (decision === "accepted") {
      await this.connectionRepo.createConnection(String(fromId), String(toId));
      await this.connectionRequestRepo.deleteRequest(String(fromId), String(toId));
      return { success: true, message: "Request accepted" };
    } else if (decision === "declined") {
      await this.connectionRequestRepo.deleteRequest(String(fromId), String(toId));
      return { success: true, message: "Request declined" };
    } else {
      return { success: false, message: "Invalid decision" };
    }
  }

  async getRequestsForUser(userId: string) {
    // const requests = await this.connectionRequestRepo.findByUserId(userId);
    // return { success: true, data: requests };
    return this.connectionRequestRepo.findByUserId(userId);
  }

  async getRequestsFromUser(userId: string) {
    // const requests = await this.connectionRequestRepo.findByUserId(userId);
    // return { success: true, data: requests };
    return this.connectionRequestRepo.findByFromUserId(userId);
  }

  async isPendingRequest(fromId: number, toId: number) {
    const request = await this.connectionRequestRepo.findRequest(String(fromId), String(toId));
    return request ? true : false;
  }
}