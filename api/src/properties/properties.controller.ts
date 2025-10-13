import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
@UseGuards(RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  async list(@Req() req: any, @Query() query: FilterPropertiesDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى قائمة العقارات');
    return this.propertiesService.findAll(officeId, query);
  }

  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى تفاصيل العقار');
    return this.propertiesService.findOneWithImages(officeId, id);
  }

  @Post()
  @Roles('manager', 'staff')
  async create(@Req() req: any, @Body() dto: CreatePropertyDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    const created = await this.propertiesService.create(officeId, userId, dto);
    return { success: true, property: created };
  }

  @Patch(':id')
  @Roles('manager', 'staff')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.propertiesService.update(officeId, id, dto);
    return { success: true, property: updated };
  }

  @Delete(':id')
  @Roles('manager')
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    const res = await this.propertiesService.softDelete(officeId, id);
    return res;
  }
}
