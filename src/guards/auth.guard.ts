import { ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';

export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        if (request.currentUser) {
            return true;
        }
        throw new UnauthorizedException('Unauthorized access');
    }
}
