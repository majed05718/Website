import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MaintenanceService } from './maintenance.service';
import { FilterMaintenanceDto } from './dto/filter-maintenance.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { PublicCreateMaintenanceDto } from './dto/public-create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller()
@UseGuards(RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('maintenance')
  @Roles('manager', 'staff', 'technician')
  async list(@Req() req: any, @Query() filters: FilterMaintenanceDto) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.list(officeId, filters);
  }

  @Get('maintenance/:id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.getOne(officeId, id);
  }

  @Post('maintenance')
  @Roles('manager', 'staff', 'technician')
  async create(@Req() req: any, @Body() dto: CreateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const officeCode = req?.user?.office_id; // بافتراض أن office_id هو نفسه code
    const userId = req?.user?.user_id ?? null;
    const created = await this.maintenanceService.createInternal(officeId, officeCode, userId, dto);
    return { success: true, request: created };
  }

  @Post('public/maintenance')
  async createPublic(@Req() req: any, @Body() dto: PublicCreateMaintenanceDto) {
    const officeId = req?.user?.office_id ?? dto?.property_id ?? 'public';
    const officeCode = req?.user?.office_id ?? 'public';
    const created = await this.maintenanceService.createPublic(officeId, officeCode, dto);
    return { success: true, request: created };
  }

  @Patch('maintenance/:id')
  @Roles('manager', 'staff', 'technician')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.update(officeId, id, dto);
    return { success: true, request: updated };
  }

  @Post('maintenance/:id/complete')
  @Roles('technician', 'manager')
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.complete(officeId, id, dto);
    return { success: true, request: updated };
  }
}
