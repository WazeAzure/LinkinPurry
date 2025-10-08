import { FastifyReply, FastifyRequest } from 'fastify';
import { FeedService } from '../services/feed.service.js';

interface DecodedToken {
    userId: string;
    email: string;
    exp: number;
  }
  
const decodeToken = (token: string): DecodedToken | null => {
try {
    if (!token) {
    console.warn("No token provided");
    return null;
    }

    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
    throw new Error("Invalid token format");
    }

    const paddedPayload = payloadBase64 + 
    '=='.slice(0, (4 - payloadBase64.length % 4) % 4);

    const decodedPayload = JSON.parse(
    decodeURIComponent(
        atob(paddedPayload)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    );

    return {
    userId: decodedPayload.userId,
    email: decodedPayload.email,
    exp: decodedPayload.exp,
    };
} catch (err) {
    console.error("Failed to decode token:", err);
    return null;
}
};

export class FeedController {
    private feedService: FeedService;

    constructor(feedService: FeedService) {
        this.feedService = feedService;
    }

    async getPublicFeeds(request: FastifyRequest<{ Querystring: { cursor?: string, limit?: string } }>, reply: FastifyReply) {
        try {
            const cursor = request.query.cursor ? parseInt(request.query.cursor) : null;
            const limit = request.query.limit ? parseInt(request.query.limit) : 10;
    
            const feeds = await this.feedService.getPaginatedFeeds(cursor, limit);
            const nextCursor = feeds.length > 0 ? feeds[feeds.length - 1].id : null;
    
            return reply.send({
                success: true,
                message: 'Feeds fetched successfully',
                body: {
                    cursor: nextCursor,
                    feeds: feeds,
                },
            });
        } catch (error) {
            return reply.status(500).send({ success: false, message: 'Failed to fetch feeds.' });
        }
    }
    

    async getAuthenticatedFeeds(request: FastifyRequest<{ Querystring: { cursor?: string, limit?: string } }>, reply: FastifyReply) {
        try {
            const token = request.cookies.authToken;
            const decoded = decodeToken(token);
            const userId = decoded?.userId;
    
            if (!userId) {
                return reply.status(401).send({ success: false, message: 'Unauthorized' });
            }
    
            const cursor = request.query.cursor ? parseInt(request.query.cursor) : null;
            const limit = request.query.limit ? parseInt(request.query.limit) : 10;
    
            const feeds = await this.feedService.getPaginatedFeeds(cursor, limit, userId);
            const nextCursor = feeds.length > 0 ? feeds[feeds.length - 1].id : null;
    

            return reply.send({
                success: true,
                message: 'Feeds fetched successfully',
                body: {
                    cursor: nextCursor,
                    feeds: feeds.map(feed => ({
                        ...feed,
                        isEditable: feed.user.id.toString() === userId.toString(),
                    })),
                },
            });
        } catch (error) {
            return reply.status(500).send({ success: false, message: 'Failed to fetch feeds.' });
        }
    }       

    async getFeedsByUserId(request: FastifyRequest<{ Params: { user_id: string } }>, reply: FastifyReply) {
        const { user_id } = request.params;
        try {
            const feeds = await this.feedService.getFeedsByUserId(user_id);
            if (!feeds || feeds.length === 0) {
                reply.status(404).send({ success: false, error: 'Feeds not found for the user.' });
                return;
            }
            return reply.send({ success: true, data: feeds });
        } catch (error) {
            return reply.status(500).send({ success: false, error: 'Failed to fetch feeds.' });
        }
    }

    async addNewPost(request: FastifyRequest<{ Body: { content: string } }>, reply: FastifyReply) {
        try {

            const token = request.cookies.authToken;

            let userId: string | null = null;
            if (token) {
                const decoded = decodeToken(token);
                userId = decoded?.userId || null;
            }

            console.log('User ID in ADD NEW POST:', userId);

            const { content } = request.body;

            if (!userId) {
                return reply.status(401).send({ success: false, message: 'Unauthorized' });
            }

            const newPost = await this.feedService.addNewPost(userId, content);
            if (!newPost) {
                return reply.status(500).send({ success: false, message: "Failed to create post" });
              }

            const fullPost = await this.feedService.getPostById(newPost.id);

            // return reply.status(201).send({ success: true, data: newPost });
            return reply.status(201).send({ success: true, data: fullPost });
        } catch (error) {
            return reply.status(500).send({ success: false, message: 'Failed to create post' });
        }
    }

    async editPost( request: FastifyRequest<{ Params: { post_id: string }; Body: { content: string } }>, reply: FastifyReply) {
        try {
            const { post_id } = request.params;
            const { content } = request.body;
        
            const token = request.cookies.authToken;

            let userId: string | null = null;
            if (token) {
                const decoded = decodeToken(token);
                userId = decoded?.userId || null;
            }
      
            if (!userId) {
                return reply.status(401).send({ success: false, message: "Unauthorized" });
            }
        
            const updatedPost = await this.feedService.editPost(post_id, userId, content);
            if (!updatedPost) {
                return reply.status(404).send({ success: false, message: "Post not found or unauthorized" });
            }
        
            return reply.status(200).send({
                success: true,
                data: {
                id: updatedPost.id,
                content: updatedPost.content,
                updatedAt: updatedPost.updatedAt,
                createdAt: updatedPost.createdAt,
                },
            });
        } catch (error) {
          return reply.status(500).send({ success: false, message: "Failed to update post" });
        }
      }    
      
    async deletePost( request: FastifyRequest<{ Params: { post_id: string } }>, reply: FastifyReply) {
    try {
        const { post_id } = request.params;
    
        const token = request.cookies.authToken;
    
        let userId: string | null = null;
        if (token) {
        const decoded = decodeToken(token);
        userId = decoded?.userId || null;
        }
    
        if (!userId) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
        }
    
        const isDeleted = await this.feedService.deletePost(post_id, userId);
        if (!isDeleted) {
        return reply
            .status(404)
            .send({ success: false, message: "Post not found or unauthorized" });
        }
    
        return reply.status(200).send({ success: true, message: "Post deleted" });
    } catch (error) {
        return reply.status(500).send({ success: false, message: "Failed to delete post" });
    }
    }
      

}
