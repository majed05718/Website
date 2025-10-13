
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { PropertiesModule } from './properties/properties.module';
import { PaymentsModule } from './payments/payments.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FinancialAnalytics } from './analytics/entities/financial-analytics.entity';
import { KpiTracking } from './analytics/entities/kpi-tracking.entity';
import { StaffPerformance } from './analytics/entities/staff-performance.entity';
import { UsageStatistics } from './analytics/entities/usage-statistics.entity';
import { OwnerReports } from './analytics/entities/owner-reports.entity';
import { Office } from './entities/office.entity';
import { Conversation } from './whatsapp/conversation.entity';
import { UserPermission } from './entities/user-permission.entity';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtMiddleware } from './auth/jwt.middleware';
import { ActivityLog } from './entities/activity-log.entity';
import { Property } from './properties/properties.entity';
import { PropertyImage } from './properties/property-image.entity';
import { RentalPayment } from './payments/rental-payment.entity';
import { PaymentAlert } from './payments/payment-alert.entity';
import { Contract } from './payments/rental.contract.entity';
import { MaintenanceRequest } from './maintenance/maintenance-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
    // إعداد TypeORM مع Postgres
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const url = config.get<string>('DATABASE_URL');
        if (url) {
          return {
            type: 'postgres',
            url,
            autoLoadEntities: true,
            ssl: config.get<string>('PG_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
            synchronize: !isProd,
          } as any;
        }
        return {
          type: 'postgres',
          host: config.get<string>('PGHOST', 'localhost'),
          port: parseInt(config.get<string>('PGPORT', '5432'), 10),
          username: config.get<string>('PGUSER', 'postgres'),
          password: config.get<string>('PGPASSWORD', ''),
          database: config.get<string>('PGDATABASE', 'postgres'),
          autoLoadEntities: true,
          ssl: config.get<string>('PG_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
          synchronize: !isProd,
        } as any;
      },
    }),
    // توفير المستودعات للكيانات المطلوبة
    TypeOrmModule.forFeature([ActivityLog, Property, PropertyImage, RentalPayment, PaymentAlert, Contract, MaintenanceRequest, Office, Conversation, UserPermission, FinancialAnalytics, KpiTracking, StaffPerformance, UsageStatistics, OwnerReports]),
    HealthModule,
    PropertiesModule,
    PaymentsModule,
    MaintenanceModule,
    WhatsAppModule,
    OnboardingModule,
    AnalyticsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_INTERCEPTOR, useClass: ActivityLogInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // تطبيق وسيط JWT على جميع المسارات باستثناء /health
    consumer
      .apply(JwtMiddleware)
      .exclude({ path: 'health', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
