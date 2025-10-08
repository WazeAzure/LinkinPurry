import { FastifyInstance } from 'fastify';
import { ResponseUserDto, UpdateUserDTO } from "../models/user.model.js";
import { UserRepository } from "../repositories/user.repository.js";
import { User } from "../entities/user.entity.js";

export class UserService {
    constructor(private userRepository: UserRepository) {}

    // async getProfile(userId: string | number) {
    //     const user = await this.userRepository.findById(userId);
    //     return this.formatAuthResponse(user);
    // }

    async getProfile(userId: string | number, accessLevel: string) {
        const user = await this.userRepository.findUserById(userId.toString());
        if (!user) {
          throw new Error('User not found');
        }
      
        const connectionCount = await this.userRepository.getConnectionCount(userId.toString());
      
        // Format response based on access level
        if (accessLevel === 'public') {
          return {
            success: true,
            message: "Profile retrieved successfully",
            body: {
              username: user.username,
              name: user.fullName,
              work_history: user.workHistory,
              skills: user.skills,
              connection_count: connectionCount,
              profile_photo: user.profilePhotoPath,
              accessLevel: accessLevel
            },
          };
        }

        // TO-DO-DENISE:: FIX GETTING POSTS OF EACH USER
      
        
        const posts = await this.userRepository.getRelevantPosts(userId.toString());
        console.log("POSTS: ", posts);

        const relevantPosts = accessLevel !== 'public'
          ? await this.userRepository.getRelevantPosts(userId.toString())
          : [];
      
        // const relevantPosts = accessLevel !== 'notConnected'
        //   ? []
        //   : [];

        const formattedPosts = relevantPosts.map(post => ({
            id: post.id, // Ensure the post ID is included
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            content: post.content,
            user: {
              id: post.user.id, // Ensure the user ID is included
              username: post.user.username,
              profile_photo: post.user.profilePhotoPath,
            },
          }));
          
          
        return {
          success: true,
          message: "Profile retrieved successfully",
          body: {
            username: user.username,
            name: user.fullName,
            work_history: user.workHistory,
            skills: user.skills,
            connection_count: connectionCount,
            profile_photo: user.profilePhotoPath,
            relevant_posts: formattedPosts,
            accessLevel: accessLevel
          },
        };
    }
      
    async checkConnection(authUserId: string, requestedUserId: string): Promise<boolean> {
        return this.userRepository.checkConnection(authUserId, requestedUserId);
    } 

    async update(userId: string | number, data: { username?: string; name?: string; workHistory?: string; skills?: string; profile_photo?: string;}) {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
          throw new Error("User not found");
        }
      
        const updatedData = { ...existingUser, ...data };
        const updatedUser = await this.userRepository.update(userId, updatedData);
        if (!updatedUser) {
          throw new Error("Failed to update user");
        }
      
        return updatedUser;
    }

    private formatAuthResponse(user: User): ResponseUserDto {
        return {
            success: true,
            message: "get profile succeed",
            body: {
                username: user.username,
                name: user.fullName,
                work_history: user.workHistory,
                skills: user.skills,
                connection_count: 1, // TODO: add count
                profile_photo: user.profilePhotoPath,
                relevant_posts: [], // TODO: add feeds
            }
        };
      }
}