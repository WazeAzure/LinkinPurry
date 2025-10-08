import { FeedRepository } from '../repositories/feed.repository.js';
import { Feed } from '../entities/feed.entity.js';
import { PushService } from './push.service.js';

export class FeedService {
    private feedRepository: FeedRepository;

    constructor(feedRepository: FeedRepository) {
        this.feedRepository = feedRepository;
    }

    async getAllFeeds() {
        return this.feedRepository.findAllFeeds();
    }

    async getFeedsByUserId(userId: string) {
        return this.feedRepository.findFeedsByUserId(userId);
    }

    async addNewPost(userId: string, content: string) {
        console.log("INI DARI ADDNEWPOST ================");
        const temp = content.slice(0,20) + "...";
        const result = await PushService.sendNotificationToConnections(
            userId,
            {
                notification: {
                    title: "New Post!",
                    body: temp,
                    data: {}
                }
            }
        )
        return this.feedRepository.createPost(userId, content);
    }

    async editPost(postId: string, userId: string, content: string) {
        return this.feedRepository.updatePost(postId, userId, content);
    }

    async getPostById(postId: string) {
        return this.feedRepository.findPostById(postId);
    }

    async deletePost(postId: string, userId: string) {
        return this.feedRepository.deletePost(postId, userId);
    }

    async getPaginatedFeeds(cursor: number | null, limit: number, userId?: string) {
        return this.feedRepository.findPaginatedFeeds(cursor, limit, userId);
    }
      
}
