import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceRequest } from './maintenance-request.entity';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { Property } from '../properties/properties.entity';
import { N8nService } from '../integrations/n8n/n8n.service';
import { ActivityLog } from '../entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRequest, Property, ActivityLog])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, N8nService],
})
export class MaintenanceModule {}
