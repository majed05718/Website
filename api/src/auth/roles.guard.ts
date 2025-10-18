import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
        office_id: 'dev-office-456',
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
