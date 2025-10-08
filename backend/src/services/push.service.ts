import webpush from 'web-push';
import { WebPushConfig } from '../config/webpush.js';
import { PushSubscription } from '../entities/push-subscription.entity.js';
import { ConnectionRepository } from '../repositories/connection.repository.js';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushService {
  // In-memory storage (replace with database in production)
  private static userSubscriptions: Map<string, PushSubscription[]> = new Map();

  // Add a new subscription
  static addSubscription(userId: string, subscription: PushSubscription): boolean {
    console.log("============ EDBERT PUSH SUBSCRIPTION ============");
    console.log(PushService.userSubscriptions);
    
    const subscriptions = this.userSubscriptions.get(userId) || [];
    const exists = subscriptions.some((sub) => sub.endpoint === subscription.endpoint);

    if (!exists) {
      subscriptions.push(subscription);
      this.userSubscriptions.set(`${userId}`, subscriptions);
      return true;
    }
    return false;
  }

  // Remove a subscription
  static removeSubscription(userId: string, endpoint: string): boolean {
    const subscriptions = this.userSubscriptions.get(userId) || [];
    const updatedSubscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);

    if (updatedSubscriptions.length > 0) {
      this.userSubscriptions.set(userId, updatedSubscriptions);
    } else {
      this.userSubscriptions.delete(userId);
    }

    return updatedSubscriptions.length < subscriptions.length;
  }

  // send notification chat
  static async sendNotificationChat(
    userId: string,
    payload: webpush.PushMessageData,
    options?: webpush.SendOptions
  ): Promise<{success: number; failed: number}> {
    WebPushConfig.configure();
    console.log("================");
    console.log(userId);
    console.log(this.userSubscriptions);
    const subscriptions = this.userSubscriptions.get(`${userId}`);
    let successCount = 0;
    let failedCount = 0;

    console.log("INI DARI CHAT ENDPOINT")
    console.log(subscriptions);
    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        let payload2 = {
          ...payload,
          url: '/messaging'
        }
        await webpush.sendNotification(subscription, JSON.stringify(payload2), options);
        successCount++;
      } catch (error) {
        this.removeSubscription(userId, subscription.endpoint);
        failedCount++;
        console.log(userId, JSON.stringify(payload));
        console.error(`Failed to send notification to ${userId}:`, error);
      }
    });

    await Promise.allSettled(notificationPromises);

    return { success: successCount, failed: failedCount };
  }

  static async sendNotificationToAll(
    payload: webpush.PushMessageData, 
    options?: webpush.SendOptions
  ): Promise<{ success: number; failed: number }> {
    // Ensure web push is configured
    WebPushConfig.configure();

    let successCount = 0;
    let failedCount = 0;

    const notificationPromises = Array.from(this.userSubscriptions.entries()).map(async ([key, subscription]) => {
      try {
        console.log("ISI DARI MAP ===== ");
        console.log(subscription)
        await webpush.sendNotification(
          {
            title: payload.title,
            body: payload.body,
            endpoint: subscription[0].endpoint,
            keys: {
              p256dh: subscription[0].keys.p256dh,
              auth: subscription[0].keys.auth,
            },
          },
          JSON.stringify(payload),
          options
        );
        successCount++;
      } catch (error) {
        // Remove failed subscriptions using both key and endpoint
        this.removeSubscription(key, subscription.endpoint);
        failedCount++;
        console.error("Failed to send notification:", error);
      }
    });
    

    await Promise.allSettled(notificationPromises);

    return { success: successCount, failed: failedCount };
  }

  static async sendNotificationToConnections(
    userId: string,
    payload: webpush.PushMessageData, 
    options?: webpush.SendOptions
  ): Promise<{ success: number; failed: number }> {
    // Ensure web push is configured
    WebPushConfig.configure();

    let successCount = 0;
    let failedCount = 0;

    const conRep = new ConnectionRepository();
    const listOfUser = await conRep.getConnections(userId);

    let userIdList = new Set();

    listOfUser.forEach((connection) => {
      if (connection.fromId == userId) {
          // Do something when fromId equals x
          userIdList.add(connection.toId);
        }
        
        if (connection.toId == userId) {
          // Do something when toId equals x
          userIdList.add(connection.fromId);
      }
    });

    const notificationPromises = Array.from(userIdList).map( async uId => {
      if (!uId){  // if undefined
        return; 
      }

      const subscription = this.userSubscriptions.get(`${uId}`);
      if(!subscription){
        return;
      }

      try {

        console.log("ISI DARI MAP ===== " + uId);
        console.log(subscription)

        let payload2 = {
          ...payload,
          url: '/feeds'
        };
        await webpush.sendNotification(
          subscription[0],
          JSON.stringify(payload2),
          options
        );
        successCount++;
      } catch (error) {
        console.log("ERROR : " + error);
        // Remove failed subscriptions using both key and endpoint
        this.removeSubscription(uId, subscription[0].endpoint);
        failedCount++;
        console.error("Failed to send notification: " + error);
      }
    });
    

    await Promise.allSettled(notificationPromises);

    return { success: successCount, failed: failedCount };
  }

  // Get total number of subscribers
  static getSubscriberCount(): number {
    return this.userSubscriptions.size || 0;
  }

  // Get public VAPID key for frontend
  static getPublicKey(): string {
    return WebPushConfig.publicKey;
  }
}