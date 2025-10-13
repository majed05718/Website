import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { FilterPropertiesDto } from './dto/filter-properties.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('offices/:officeCode/listings')
  async listings(@Param('officeCode') officeCode: string, @Query() query: FilterPropertiesDto) {
    const res = await this.propertiesService.getPublicListings(officeCode, query);
    return res;
  }

  @Get('offices/:officeCode/properties/:slug')
  async bySlug(@Param('officeCode') officeCode: string, @Param('slug') slug: string) {
    const property = await this.propertiesService.getPublicBySlug(officeCode, slug);
    return property;
  }
}
