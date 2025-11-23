import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret', 'default-secret-change-in-production'),
    });
  }

  /**
   * Validate the JWT payload and attach user to request
   * 
   * @param payload - Decoded JWT payload
   * @returns User object to be attached to request.user
   */
  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('رمز الدخول غير صالح');
    }

    return {
      id: payload.sub,
      phone: payload.phone,
      email: payload.email,
      role: payload.role,
      officeId: payload.officeId,
    };
  }
}
