
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SupabaseModule } from './supabase/supabase.module';
import { HealthModule } from './health/health.module';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module'; // <-- هل هو مستورد؟
import { PaymentsModule } from './payments/payments.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CustomersModule } from './customers/customers.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtMiddleware } from './auth/jwt.middleware';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
      cache: true,
    }),
    // إعداد Throttler بثلاثة ملفات تعريف: افتراضي 1000، عام 100، مصدق 20 في الدقيقة
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 1000 },
      {
        name: 'public',
        ttl: 60_000,
        limit: 100,
        skipIf: (ctx) => {
          try {
            const req: any = ctx.switchToHttp().getRequest();
            return Boolean(req?.user?.user_id);
          } catch (_) {
            return false;
          }
        },
      },
      {
        name: 'auth',
        ttl: 60_000,
        limit: 20,
        skipIf: (ctx) => {
          try {
            const req: any = ctx.switchToHttp().getRequest();
            return !Boolean(req?.user?.user_id);
          } catch (_) {
            return true;
          }
        },
      },
    ]),
    // استخدام Supabase بدلاً من TypeORM
    SupabaseModule,
    HealthModule,
    PropertiesModule,
    PaymentsModule,
    MaintenanceModule,
    WhatsAppModule,
    OnboardingModule,
    AnalyticsModule,
    CustomersModule,
    AppointmentsModule,
    AuthModule, // <-- ✅ يجب أن يكون AuthModule هنا
  ],
  providers: [
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_INTERCEPTOR, useClass: ActivityLogInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})

export class AppModule{/* implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // تطبيق وسيط JWT على جميع المسارات باستثناء /health
    consumer
      .apply(JwtMiddleware)
      .exclude({ path: 'health', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }*/
}
