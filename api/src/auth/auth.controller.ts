import { Controller, Post, Body, Req, Res, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authentication Controller
 * 
 * Handles authentication endpoints:
 * - POST /auth/login - User login (PUBLIC)
 * - POST /auth/refresh - Refresh access token (PUBLIC)
 * - POST /auth/logout - User logout (PROTECTED)
 * - POST /auth/profile - Get user profile (PROTECTED)
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Login endpoint - PUBLIC (no authentication required)
   * 
   * @param loginDto - Login credentials
   * @param req - Express request for device info
   * @param res - Express response for setting HttpOnly cookies
   * @returns Access token and user info
   */
  @Public() // Exempt from global JWT guard
  @UseGuards(AuthGuard('local')) // <-- هذا هو السلك الحاسم الذي يربط كل شيء!
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. Validate user credentials
    const user = await this.authService.validateUser(loginDto.phone, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('رقم الجوال أو كلمة المرور غير صحيحة');
    }
    
    // 2. Generate access and refresh tokens
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    
    const { accessToken, refreshToken } = await this.authService.login(user, deviceInfo);
    
    // 3. Set refresh token as HttpOnly cookie (7 days)
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
    
    // 4. Return access token and user info
    return {
      success: true,
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        officeId: user.office_id,
      },
      message: 'تم تسجيل الدخول بنجاح',
    };
  }

  /**
   * Refresh token endpoint - PUBLIC (uses RefreshAuthGuard instead of JWT)
   * 
   * @param req - Express request containing refresh token
   * @param res - Express response for setting new HttpOnly cookies
   * @returns New access token
   */
  @Public() // Exempt from global JWT guard (uses RefreshAuthGuard instead)
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // 1. Extract user ID and refresh token from request (populated by RefreshAuthGuard)
    const userId = req.user['sub'];
    const oldRefreshToken = req.cookies['refreshToken'];
    
    if (!oldRefreshToken) {
      throw new UnauthorizedException('رمز التحديث مفقود');
    }
    
    // 2. Generate new access and refresh tokens
    const { accessToken, refreshToken } = await this.authService.refreshTokens(userId, oldRefreshToken);
    
    // 3. Set new refresh token as HttpOnly cookie
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
    
    // 4. Return new access token
    return {
      success: true,
      accessToken,
      message: 'تم تحديث الجلسة بنجاح',
    };
  }

  /**
   * Logout endpoint
   * 
   * @param req - Express request containing user info
   * @param logoutDto - Logout options
   * @param res - Express response for clearing cookies
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Body() logoutDto: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. Extract user ID from request
    const userId = req.user['sub'] || req.user['user_id'] || req.user['id'];
    
    // 2. Revoke refresh token(s) based on logoutDto.logoutFrom
    const refreshToken = logoutDto.logoutFrom === 'current' ? req.cookies['refreshToken'] : undefined;
    
    await this.authService.logout(userId, refreshToken);
    
    // 3. Clear refresh token cookie
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });
    
    // 4. Return success message
    return {
      success: true,
      message: logoutDto.logoutFrom === 'all' 
        ? 'تم تسجيل الخروج من جميع الأجهزة بنجاح'
        : 'تم تسجيل الخروج بنجاح',
    };
  }

  /**
   * Get current user profile
   * 
   * @param req - Express request containing user info
   * @returns User profile
   */
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    // User info is populated by JwtAuthGuard
    const user = req.user;
    
    return {
      success: true,
      user: {
        id: user['sub'] || user['id'],
        phone: user['phone'],
        email: user['email'],
        role: user['role'],
        officeId: user['officeId'] || user['office_id'],
      },
    };
  }
}
