import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request, Response, NextFunction } from "express";
import { User } from "src/users/schemas/user.schema";
import { UsersService } from "src/users/users.service";

declare global {
    namespace Express {
        interface Request {
            currentUser?: User;
        }
    }
}
@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    private readonly logger = new Logger(CurrentUserMiddleware.name, { timestamp: true });
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Middleware to extract and verify JWT from the request header.
     * If valid, it attaches the authenticated user to `req.currentUser`.
     * @param req - Express request object.
     * @param res - Express response object.
     * @param next - Callback function to pass control to the next middleware.
     */
    async use(req: Request, res: Response, next: NextFunction) {
        const token = this.extractTokenFromHeader(req);
        if (token) {
            try {
                // Verify JWT and extract payload
                const payload = await this.jwtService.verifyAsync(
                    token,
                    {
                        secret: this.configService.get<string>('JWT_SECRET')
                    }
                );
                // Ensure payload contains email before querying the database
                if (!payload.email) {
                    this.logger.warn("JWT payload missing email.", { token });
                    req.currentUser = null;
                    return next();
                }
                // Fetch the user from the database
                const user = await this.usersService.findOneByEmail(payload.email);
                req.currentUser = user ?? null;
            }
            catch (err) {
                this.logger.error(`JWT verification failed: ${err.message}`, err.stack);
                req.currentUser = null;
            }
        }
        next();
    }

    /**
     * Extracts the JWT token from the Authorization header.
     * @param request - Express request object.
     * @returns The JWT token if present, otherwise 'undefined'.
     */
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
