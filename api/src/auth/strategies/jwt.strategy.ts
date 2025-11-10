import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Strategy for validating access tokens
 * 
 * This strategy will be used by JwtAuthGuard to validate
 * the JWT access token sent in the Authorization header
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-change-in-production',
    });
  }

  /**
   * Validate the JWT payload and attach user to request
   * 
   * @param payload - Decoded JWT payload
   * @returns User object to be attached to request.user
   */
  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('رمز الدخول غير صالح');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      officeId: payload.officeId,
    };
  }
}
