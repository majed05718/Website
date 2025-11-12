import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Authentication Service
 * 
 * Handles user authentication, token generation, and refresh token management
 * Uses Supabase for database operations until TypeORM migration is complete
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate user credentials
   * 
   * @param phone - User phone number
   * @param password - User password (plain text)
   * @returns User object if valid, null otherwise
   */
  async validateUser(phone: string, password: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    
    // Find user by phone
    const { data: user, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      return null;
    }

    // Check if user is active
    if (user.is_active !== true) {
      throw new UnauthorizedException('حساب المستخدم غير نشط');
    }

    // Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password field
    const { password_hash, ...result } = user;
    return result;
  }

  /**
   * Login user and generate tokens
   * 
   * @param user - User object
   * @param deviceInfo - Optional device information
   * @returns Access token and refresh token
   */
  async login(user: any, deviceInfo?: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.getTokenPayload(user);
    
    // Generate access token (15 minutes)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.expiresIn', '15m'),
    });
    
    // Generate refresh token (7 days)
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get<string>('app.jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('app.jwt.refreshExpiresIn', '7d'),
      }
    );
    
    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken, deviceInfo);
    
    return { accessToken, refreshToken };
  }

  /**
   * Generate new access token using refresh token
   * 
   * @param userId - User ID
   * @param refreshToken - Current refresh token
   * @returns New access token and refresh token
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token is valid and not expired
    const isValid = await this.verifyRefreshToken(userId, refreshToken);
    
    if (!isValid) {
      throw new UnauthorizedException('رمز التحديث غير صالح أو منتهي الصلاحية');
    }
    
    // Get user details
    const supabase = this.supabaseService.getClient();
    const { data: user, error } = await supabase
      .from('user_permissions')
      .select('id, user_id, email, phone, role, office_id, is_active')
      .eq('user_id', userId)
      .single();
      
    if (error || !user || user.is_active !== true) {
      throw new UnauthorizedException('المستخدم غير موجود أو غير نشط');
    }
    
    // Revoke old refresh token
    await this.revokeRefreshToken(userId, refreshToken);
    
    // Generate new tokens
    const payload = this.getTokenPayload(user);
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.expiresIn', '15m'),
    });
    
    const newRefreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get<string>('app.jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('app.jwt.refreshExpiresIn', '7d'),
      }
    );
    
    // Store new refresh token
    await this.storeRefreshToken(user.id, newRefreshToken);
    
    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout user by revoking refresh token
   * 
   * @param userId - User ID
   * @param refreshToken - Optional refresh token to revoke (if not provided, revoke all)
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific token
      await this.revokeRefreshToken(userId, refreshToken);
    } else {
      // Revoke all tokens for user
      await this.revokeAllRefreshTokens(userId);
    }
  }

  /**
   * Revoke a specific refresh token
   * 
   * @param userId - User ID
   * @param refreshToken - Refresh token to revoke
   */
  private async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const tokenHash = this.hashToken(refreshToken);
    
    await supabase
      .from('refresh_tokens')
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('token_hash', tokenHash);
  }

  /**
   * Revoke all refresh tokens for a user
   * 
   * @param userId - User ID
   */
  private async revokeAllRefreshTokens(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    await supabase
      .from('refresh_tokens')
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_revoked', false);
  }

  /**
   * Store refresh token in database
   * 
   * @param userId - User ID
   * @param refreshToken - Refresh token to store
   * @param deviceInfo - Optional device information
   */
  private async storeRefreshToken(userId: string, refreshToken: string, deviceInfo?: any): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const tokenHash = this.hashToken(refreshToken);
    
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await supabase
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        device_info: deviceInfo || {},
        ip_address: deviceInfo?.ip || null,
        user_agent: deviceInfo?.userAgent || null,
      });
  }

  /**
   * Verify refresh token is valid
   * 
   * @param userId - User ID
   * @param refreshToken - Refresh token to verify
   * @returns True if valid, false otherwise
   */
  private async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const tokenHash = this.hashToken(refreshToken);
    
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('token_hash', tokenHash)
      .eq('is_revoked', false)
      .gte('expires_at', new Date().toISOString())
      .single();
      
    return !error && !!data;
  }

  /**
   * Generate hash for refresh token storage
   * 
   * @param token - Refresh token to hash
   * @returns Hashed token
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate JWT payload for user
   * 
   * @param user - User object
   * @returns JWT payload
   */
  private getTokenPayload(user: any) {
    return {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      officeId: user.office_id,
    };
  }
}
