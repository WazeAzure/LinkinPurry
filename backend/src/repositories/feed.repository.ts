import { BaseRepository } from './base.repository.js';
import { Feed } from '../entities/feed.entity.js';
import { FindOptionsWhere } from 'typeorm';
import { UserRepository } from './user.repository.js';

export class FeedRepository extends BaseRepository<Feed> {
    constructor() {
        super(Feed);
    }
    
    async findAllFeeds() {
        const feeds = await this.repository
            .createQueryBuilder("feed")
            .leftJoinAndSelect("feed.user", "user")
            .select([
                "feed.id",
                "feed.content",
                "feed.createdAt",
                "feed.updatedAt",
                "user.id",
                "user.username",
                "user.fullName",
                "user.profilePhotoPath",
            ])
            .orderBy("feed.createdAt", "DESC").cache(true)
            .getMany();
     
        const uniqueFeeds = Array.from(
            new Set(feeds.map(feed => feed.content))
        ).map(content => 
            feeds.find(feed => feed.content === content)
        );
     
        console.log("Unique feeds found:", uniqueFeeds.length);
        console.log(uniqueFeeds);
        return uniqueFeeds;
     }

    async findFeedsByUserId(userId: string) {
        const feeds = await this.repository
            .createQueryBuilder("feed")
            .leftJoinAndSelect("feed.user", "user")
            .where("user.id = :userId", { userId })
            .orderBy("feed.createdAt", "DESC")
            .getMany();
    
        // Remove duplicates client-side using Set or filter
        const uniqueFeeds = Array.from(
            new Set(feeds.map(feed => feed.content))
        ).map(content => 
            feeds.find(feed => feed.content === content)
        );
    
        return uniqueFeeds;
    }

    async findPostById(postId: string) {
        return this.repository
          .createQueryBuilder("feed")
          .leftJoinAndSelect("feed.user", "user")
          .select([
            "feed.id",
            "feed.content",
            "feed.createdAt",
            "feed.updatedAt",
            "user.id",
            "user.username",
            "user.profilePhotoPath",
            "user.fullName",
          ])
          .where("feed.id = :postId", { postId })
          .getOne();
      }      
    
    async createPost(userId: string, content: string) {
        const userRepository = new UserRepository();
        const user = await userRepository.findUserById(userId);
        if (!user) {
            return null; // User not found
        }
        console.log("USER FOUND: ", user);
        const post = this.repository.create({
            user: user, // Set user relationship
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("POST CREATED: ", post);
        return this.repository.save(post);
    }

    async updatePost(postId: string, userId: string, content: string) {
        const post = await this.repository.findOne({
            where: { id: postId, user: { id: userId } }, // Ensure post belongs to the user
        });

        if (!post) {
            return null; // Post not found or unauthorized
        }

        post.content = content;
        post.updatedAt = new Date();
        return this.repository.save(post);
    }

    async deletePost(postId: string, userId: string) {
        const post = await this.repository.findOne({
          where: { id: postId, user: { id: userId } }, // Ensure post belongs to the user
        });
      
        if (!post) {
          return false; // Post not found or unauthorized
        }
      
        await this.repository.remove(post); // Remove the post
        return true;
    }
    
    async findPaginatedFeeds(cursor: number | null, limit: number, userId?: string) {
        const query = this.repository
          .createQueryBuilder("feed")
          .leftJoinAndSelect("feed.user", "user")
          .select([
            "feed.id",
            "feed.content",
            "feed.createdAt",
            "feed.updatedAt",
            "user.id",
            "user.username",
            "user.fullName",
            "user.profilePhotoPath",
          ])
          .orderBy("feed.updatedAt", "DESC")
          .take(limit)
          .distinct(true);
      
        if (cursor) {
          query.where("feed.id < :cursor", { cursor });
        }
        return query.getMany();
      }

}
