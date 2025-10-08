import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '@fastify/jwt';

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
}

export interface Feed {
    id: number;
    content: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface Chat {
    id: number;
    from_id: number;
    to_id: number;
    message: string;
    timestamp: Date;
}

export interface Connection {
    from_id: number;
    to_id: number;
    created_at: Date;
}

export interface PushSubscription {
    endpoint: string;
    user_id: number | null;
    keys: Record<string, string>;
    created_at: Date;
}

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: () => void;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: JWTPayload & { id: number };
        user: { id: number };
    }
}