import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './properties.entity';
import { PropertyImage } from './property-image.entity';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PublicController } from './public.controller';
import { ExcelController } from './excel.controller';
import { MediaController } from './media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage])],
  controllers: [PropertiesController, PublicController, ExcelController, MediaController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
