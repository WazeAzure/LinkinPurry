import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { RegisterDto, LoginDto } from '../models/auth.model.js';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    async register(
        request: FastifyRequest<{ Body: RegisterDto }>,
        reply: FastifyReply
    ) {
        const response = await this.authService.register(request.body);

        // Set the cookie with the token
        reply.setCookie('authToken', response.body.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            path: '/',
            maxAge: 3600
        });
        
        return reply.code(201).send(response);
    }

    async login(
        request: FastifyRequest<{ Body: LoginDto }>,
        reply: FastifyReply
    ) {
        const response = await this.authService.login(request.body);

        console.log(response);

        // Set the cookie with the token
        reply.setCookie('authToken', response.body.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            path: '/',
            maxAge: 3600
        });

        return reply.code(200).send(response);
    }
}