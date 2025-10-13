import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator';

// حارس للتحقق من صلاحيات الدور باستخدام @Roles()
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // لا توجد أدوار مطلوبة
    }

    const request: any = context.switchToHttp().getRequest();
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
