import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { N8nService } from '../integrations/n8n/n8n.service';

@Module({
  controllers: [MaintenanceController],
  providers: [MaintenanceService, N8nService],
})
export class MaintenanceModule {}
