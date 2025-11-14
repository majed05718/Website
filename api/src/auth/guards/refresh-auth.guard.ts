import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Refresh Token Authentication Guard
 * 
 * Uses the 'jwt-refresh' strategy to validate refresh tokens
 * Apply this guard to the token refresh endpoint
 * 
 * @example
 * @UseGuards(RefreshAuthGuard)
 * @Post('auth/refresh')
 * refresh(@Req() req) {
 *   return this.authService.refreshTokens(req.user.id, req.user.refreshToken);
 * }
 */
@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('رمز التحديث منتهي أو غير صالح');
    }

    return user;
  }
}
