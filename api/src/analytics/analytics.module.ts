import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Property } from '../properties/properties.entity';
import { RentalPayment } from '../payments/rental-payment.entity';
import { MaintenanceRequest } from '../maintenance/maintenance-request.entity';
import { FinancialAnalytics } from './entities/financial-analytics.entity';
import { KpiTracking } from './entities/kpi-tracking.entity';
import { StaffPerformance } from './entities/staff-performance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, RentalPayment, MaintenanceRequest, FinancialAnalytics, KpiTracking, StaffPerformance])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
