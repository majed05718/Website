import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

/**
 * Authentication Module
 * 
 * Provides JWT-based authentication with refresh token support
 * 
 * TODO: Once TypeORM entities are integrated:
 * 1. Import TypeOrmModule.forFeature([RefreshToken, User])
 * 2. Update AuthService to inject repositories
 * 3. Implement full authentication logic
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
    }),
    // TODO: Add TypeORM repositories when ready
    // TypeOrmModule.forFeature([RefreshToken, User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    JwtAuthGuard,
    RefreshAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RefreshAuthGuard],
})
export class AuthModule {}
