// /api/src/auth/strategies/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // قم بتكوين الاستراتيجية هنا
    super({
      usernameField: 'phone', // <-- أخبر Passport أن حقل "اسم المستخدم" هو في الواقع "phone"
    });
  }

  /**
   * Passport سيستدعي هذه الدالة تلقائيًا عندما يتم استخدام AuthGuard('local')
   * @param phone - القيمة من حقل 'phone' في الطلب
   * @param password - القيمة من حقل 'password' في الطلب
   * @returns كائن المستخدم إذا كانت بيانات الاعتماد صالحة
   */
  async validate(phone: string, password: string): Promise<any> {
    // استدعاء دالة التحقق المثالية الموجودة لديك بالفعل في AuthService
    const user = await this.authService.validateUser(phone, password);
    
    // إذا لم يتم العثور على مستخدم أو كلمة المرور خاطئة، ارمِ استثناءً
    if (!user) {
      throw new UnauthorizedException('رقم الجوال أو كلمة المرور غير صحيحة');
    }

    // إذا كان كل شيء صحيحًا، أرجع المستخدم. Passport سيقوم بإرفاقه بـ request.user
    return user;
  }
}