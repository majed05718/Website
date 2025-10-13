import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard')
  @Roles('manager', 'accountant')
  async dashboard(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.dashboard(officeId);
  }

  @Get('properties')
  async properties(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.propertiesBreakdown(officeId);
  }

  @Get('financials')
  @Roles('manager', 'accountant')
  async financials(@Req() req: any, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.financials(officeId, reportPeriod);
  }

  @Get('kpis')
  @Roles('manager')
  async kpis(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.kpis(officeId);
  }

  @Get('staff-performance')
  @Roles('manager')
  async staffPerf(@Req() req: any, @Query('staff_phone') staffPhone?: string, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.staffPerformance(officeId, staffPhone, reportPeriod);
  }
}
