import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

// Middleware لاستخراج JWT والتحقق عبر Supabase، ثم حقن بيانات المستخدم في الطلب
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private supabase: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): SupabaseClient | null {
    if (this.supabase) return this.supabase;
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) {
      return null;
    }
    this.supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    return this.supabase;
  }

  async use(req: Request & { user?: any }, _res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'] as string | undefined;
      if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return next();
      }

      const token = authHeader.split(' ')[1];
      const client = this.getClient();
      if (!client) {
        // عدم توفر إعدادات Supabase، نمرر الطلب بدون مصادقة
        return next();
      }

      const { data, error } = await client.auth.getUser(token);
      if (error || !data?.user) {
        return next();
      }

      const supaUser = data.user as any;
      const appMeta = (supaUser.app_metadata || {}) as Record<string, any>;
      const userMeta = (supaUser.user_metadata || {}) as Record<string, any>;

      const officeId = appMeta.office_id ?? userMeta.office_id ?? null;
      const role = appMeta.role ?? userMeta.role ?? null;
      const phone = supaUser.phone ?? userMeta.phone ?? null;

      req.user = {
        office_id: officeId ?? null,
        role: role ?? null,
        user_id: supaUser.id ?? null,
        phone: phone ?? null,
      };
    } catch (_err) {
      // نتجاهل أي أخطاء في الوسيط ونُمرر الطلب
    } finally {
      next();
    }
  }
}
