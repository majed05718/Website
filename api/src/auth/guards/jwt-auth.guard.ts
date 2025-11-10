import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 * 
 * Global authentication guard that validates JWT tokens on all routes
 * except those marked with @Public() decorator
 * 
 * @example
 * // Protected route (default)
 * @Get('profile')
 * getProfile(@Req() req) {
 *   return req.user; // user is populated by JWT strategy
 * }
 * 
 * @example
 * // Public route (exempt from auth)
 * @Public()
 * @Post('login')
 * async login() { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip authentication for public routes
    }

    // Skip authentication if SKIP_AUTH is true (development only)
    if (process.env.SKIP_AUTH === 'true') {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Skip authentication if SKIP_AUTH is true (development only)
    if (process.env.SKIP_AUTH === 'true') {
      const request = context.switchToHttp().getRequest();
      // Attach mock user for development with proper structure
      request.user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'SystemAdmin',
        officeId: '94d768f1-2bcb-4a2a-9782-6f1e4bc9440c',
        office_id: '94d768f1-2bcb-4a2a-9782-6f1e4bc9440c',
      };
      return request.user;
    }

    if (err || !user) {
      throw err || new UnauthorizedException('رمز الدخول منتهي أو غير صالح');
    }

    return user;
  }
}
