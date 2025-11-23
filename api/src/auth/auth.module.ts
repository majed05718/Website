import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { SupabaseModule } from '../supabase/supabase.module';
import { LocalStrategy } from './strategies/local.strategy'; // <-- استيراد جديد

/**
 * Authentication Module
 * 
 * Provides JWT-based authentication with refresh token support
 * Uses centralized ConfigService for all JWT settings
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret', 'default-secret-change-in-production'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwt.expiresIn', '15m'),
        },
      }),
    }),
    SupabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    LocalStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
