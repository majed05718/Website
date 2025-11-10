import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 * 
 * Uses the 'jwt' strategy to validate access tokens
 * Apply this guard to routes that require authentication
 * 
 * @example
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Req() req) {
 *   return req.user;
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
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
      // Attach mock user for development
      request.user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin',
        officeId: 'dev-office-id',
      };
      return request.user;
    }

    if (err || !user) {
      throw err || new UnauthorizedException('رمز الدخول منتهي أو غير صالح');
    }

    return user;
  }
}
