import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

/**
 * Refresh Token Strategy for validating refresh tokens
 * 
 * This strategy will be used by RefreshAuthGuard to validate
 * the JWT refresh token sent in cookies or request body
 */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Try to extract from HttpOnly cookie first
          let token = request?.cookies?.refreshToken;
          
          // Fallback to request body
          if (!token && request?.body?.refreshToken) {
            token = request.body.refreshToken;
          }
          
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default-refresh-secret',
      passReqToCallback: true,
    });
  }

  /**
   * Validate the refresh token payload
   * 
   * @param req - Express request object
   * @param payload - Decoded JWT payload
   * @returns User object with refresh token to be attached to request.user
   */
  async validate(req: Request, payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('رمز التحديث غير صالح');
    }

    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    return {
      id: payload.sub,
      refreshToken,
    };
  }
}
