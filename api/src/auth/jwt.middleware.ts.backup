import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Skip authentication for health check endpoint
    if (req.path === '/health' || req.path === '/api/health') {
      next();
      return;
    }

    // Skip authentication for Swagger in development
    if (
      process.env.NODE_ENV !== 'production' &&
      (req.path.startsWith('/api/docs') || req.path.startsWith('/api-json'))
    ) {
      next();
      return;
    }

    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'يجب تسجيل الدخول للوصول إلى هذا المورد',
      );
    }

    try {
      // Extract and verify token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Attach user info to request
      req.user = {
        id: decoded.id || decoded.sub,
        email: decoded.email,
        role: decoded.role,
        officeId: decoded.officeId,
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('رمز الدخول منتهي الصلاحية');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('رمز الدخول غير صالح');
      } else {
        throw new UnauthorizedException('فشل التحقق من رمز الدخول');
      }
    }
  }
}
