import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, config.JWT_SECRET) as { userId: number };
}