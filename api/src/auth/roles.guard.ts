import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip authentication if SKIP_AUTH is true
    if (process.env.SKIP_AUTH === 'true') {
      const request: any = context.switchToHttp().getRequest();
      // Add mock user with REAL office_id from Supabase
      if (!request.user) {
        request.user = {
          user_id: 'dev-user-123',
          office_id: '94d768f1-2bcb-4a2a-9782-6f1e4bc9440c',  // ← Real office ID!
          officeId: '94d768f1-2bcb-4a2a-9782-6f1e4bc9440c',   // ← Both formats
          role: 'manager'
        };
      }
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<AppRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request: any = context.switchToHttp().getRequest();
    
    // للتطوير: إضافة user وهمي
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment && !request.user) {
      request.user = {
        user_id: 'dev-user-123',
        office_id: '94d768f1-2bcb-4a2a-9782-6f1e4bc9440c',
        officeId: '94d768f1-2bcb-4a2a-9782-6f1e4bc9440c',
        role: 'manager'
      };
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const userRole: string | undefined = request?.user?.role;

    if (!userRole) {
      throw new UnauthorizedException('غير مصرح: تحتاج لتسجيل الدخول للوصول إلى هذه العملية');
    }

    if (!requiredRoles.includes(userRole as AppRole)) {
      throw new ForbiddenException('ليس لديك الصلاحية اللازمة لتنفيذ هذه العملية');
    }

    return true;
  }
}
