import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PublicController } from './public.controller';
import { ExcelController } from './excel.controller';
import { MediaController } from './media.controller';

@Module({
  controllers: [PropertiesController, PublicController, ExcelController, MediaController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
