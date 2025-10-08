import { UserRepository } from '../repositories/user.repository.js';
import { hash, compare } from '../utils/password.util.js';
import { generateToken } from '../utils/jwt.util.js';
import { LoginDto, RegisterDto, AuthResponse } from '../models/auth.model.js';
import { User } from '../entities/user.entity.js';


export class AuthService {
  constructor(private userRepository: UserRepository) {}

  private async checkExistingUser(email: string, username: string): Promise<void> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(email),
      this.userRepository.findByUsername(username)
    ]);

    if (existingEmail) {
      throw new Error('Email already registered');
    }

    if (existingUsername) {
      throw new Error('Username already registered');
    }
  }

  async register(data: RegisterDto) {

    await this.checkExistingUser(data.email, data.username);

    const password_hash = await hash(data.password);
    const user = await this.userRepository.create({
      ...data,
      password: password_hash,
      workHistory: '[]',
      skills: '[]',
      profilePhotoPath: '/default-avatar.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = generateToken(parseInt(user.id), user.email);
    return this.formatAuthResponse(user, token);
  }

  async login(data: LoginDto) {
    const user = await this.userRepository.findByEmail(data.identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await compare(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(parseInt(user.id), user.email);

    // save to redis
    
    return this.formatAuthResponse(user, token);
  }

  private formatAuthResponse(user: User, token: string): AuthResponse {
    return {
      success: true,
      message: "succeed",
      body: {
          token: token
      }
    };
  }
}