import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service.js';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.model.js';
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export class UserController {
  constructor(private userService: UserService) {}

  // async getProfile(request: FastifyRequest, reply: FastifyReply) {
  //   const userId = request.user.id; // Set by auth middleware
  //   const response = await this.userService.getProfile(userId);
  //   console.log(response)
  //   return reply.code(200).send(response);
  // }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      let accessLevel: 'public' | 'owner' | 'connected' | 'notConnected';

      const token = request.cookies.authToken;

      if (!token) {
        accessLevel = 'public';
      }

      let authUserId: string | null = null;
      if (token) {
        const decoded = decodeToken(token);
        authUserId = decoded?.userId || null;
      }

      const requestedUserId = request.params['user_id'];
  
      if (!requestedUserId) {
        return reply.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }
  
      console.log('Auth user id: ', authUserId)
      console.log('Requested user id: ', requestedUserId)
  
      if (!authUserId) {
        // Public access if not logged in
        accessLevel = 'public';
      } else if (authUserId.toString() === requestedUserId.toString()) {
        // Owner access
        accessLevel = 'owner';
      } else {
        // Check connection
        const isConnected = await this.userService.checkConnection(
          authUserId,
          requestedUserId
        );
        accessLevel = isConnected ? 'connected' : 'notConnected';
      }
  
      console.log('Access level:', accessLevel);
      // console.log('Auth user id: ', authUserId)
      // console.log('Requested user id: ', requestedUserId)
      const profile = await this.userService.getProfile(requestedUserId, accessLevel);
  
      console.log('Profile:', profile);
      return reply.status(200).send(profile);
      // return reply.status(200).send({
      //     success: true,
      //     profile,
      //     accessLevel
      // });
    } catch (error) {
      console.error("Error fetching profile:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  }

  async getPublicProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requestedUserId = request.params['user_id'];
  
      if (!requestedUserId) {
        return reply.status(400).send({
          success: false,
          message: 'User ID is required',
        });
      }
  
      const profile = await this.userService.getProfile(requestedUserId, 'public');
      console.log('Public profile:', profile);
      return reply.status(200).send(profile);
    } catch (error) {
      console.error('Error fetching public profile:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch public profile',
      });
    }
  }  
  

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("DEBUG: Received request to update profile");
      const { username, name, workHistory, skills, profile_photo } = request.body as {
        username?: string;
        name?: string; // 'name' comes from the client
        workHistory?: string;
        skills?: string;
        profile_photo?: string; // Base64-encoded string
      };
  
      console.log("DEBUG: Parsed request body", { username, name, workHistory, skills, profile_photo });
  
      const token = request.cookies.authToken;
      console.log("DEBUG: Retrieved authToken:", token);
  
      let userId: string | null = null;
      if (token) {
        const decoded = decodeToken(token);
        console.log("DEBUG: Decoded token:", decoded);
        userId = decoded?.userId || null;
      }
  
      if (!userId) {
        console.warn("DEBUG: Unauthorized request, no valid userId found");
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }
  
      console.log("DEBUG: Authenticated userId:", userId);
  
      let photoPath = null;
  
      // If profile_photo is provided as base64, validate and save it as a file
      if (profile_photo) {
        console.log("DEBUG: Processing base64 profile photo");
  
        const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;
        if (!base64Regex.test(profile_photo)) {
          console.warn("DEBUG: Invalid base64 format for profile_photo");
          return reply.status(400).send({
            success: false,
            message: "Invalid base64 format for profile_photo",
          });
        }
  
        const base64Data = profile_photo.replace(base64Regex, ""); // Remove base64 prefix
        console.log("DEBUG: Extracted base64 data length:", base64Data.length);
  
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `profile_${userId}_${Date.now()}.png`;
        
        const uploadDir = path.join(__dirname, "..", "uploads");

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log(`DEBUG: Created directory at ${uploadDir}`);
        }
        
        const filePath = path.join(uploadDir, fileName);
  
        console.log("DEBUG: Saving file to:", filePath);
  
        // Save the file
        try {
          fs.writeFileSync(filePath, buffer);
          console.log("DEBUG: File saved successfully");
          photoPath = `/uploads/${fileName}`;
        } catch (fileError) {
          console.error("ERROR: Failed to save file:", fileError);
          return reply.status(500).send({
            success: false,
            message: "Failed to save profile photo",
          });
        }
      }
  
      console.log("DEBUG: Preparing to update user profile in database");
  
      const updatedData: any = {
        username,
        fullName: name,
        workHistory,
        skills,
        profilePhotoPath: photoPath || undefined,
      };
  
      console.log("DEBUG: Final data to update:", updatedData);
  
      // Update user profile
      const updatedProfile = await this.userService.update(userId, updatedData);
  
      console.log("DEBUG: Successfully updated profile:", updatedProfile);
  
      return reply.status(200).send({
        success: true,
        message: "Profile updated successfully",
        body: updatedProfile,
      });
    } catch (error) {
      console.error("ERROR: Exception during profile update:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }
  
  
}