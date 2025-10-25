import { Body, Controller, Get, Post, Query, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import { PropertiesService } from './properties.service';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Response } from 'express';

@ApiTags('Excel')
@ApiBearerAuth()
@Controller()
@UseGuards(RolesGuard)
export class ExcelController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post('properties/import')
  @Roles('manager', 'staff')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async importExcel(@Req() req: any, @UploadedFile() file?: any) {
    if (!file) {
      return { valid: [], invalid: [{ row: 0, errors: ['ملف الإكسل مفقود'] }] };
    }
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const valid: any[] = [];
    const invalid: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];
      if (!row.property_code) errors.push('property_code مطلوب');
      if (!row.property_type) errors.push('property_type مطلوب');
      if (!row.listing_type) errors.push('listing_type مطلوب');
      if (!row.title) errors.push('title مطلوب');

      if (errors.length) {
        invalid.push({ row: i + 2, errors });
      } else {
        valid.push(row);
      }
    }

    return { valid, invalid };
  }

  @Post('properties/import/confirm')
  @Roles('manager', 'staff')
  async importConfirm(@Req() req: any, @Body() body: { rows: any[] }) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!Array.isArray(body?.rows)) {
      throw new Error('صيغة بيانات غير صحيحة');
    }

    const created: string[] = [];
    for (const row of body.rows) {
      const createdProp = await this.propertiesService.create(officeId, userId, row);
      created.push(createdProp.id);
    }

    return { success: created.length, errors: [] };
  }

  @Get('properties/export')
  @Roles('manager', 'staff')
  async exportExcel(@Req() req: any, @Query() filters: FilterPropertiesDto, @Res({ passthrough: true }) res: Response) {
    const officeId = req?.user?.office_id;
    const result = await this.propertiesService.findAll(officeId, filters);

    const data = result.data.map((p) => ({
      id: p.id,
      office_id: p.officeId,
      property_code: p.propertyCode,
      property_type: p.propertyType,
      listing_type: p.listingType,
      city: p.locationCity,
      district: p.locationDistrict,
      street: p.locationStreet,
      price: p.price,
      currency: p.currency,
      area_sqm: p.areaSqm,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      title: p.title,
      status: p.status,
      is_featured: p.isFeatured,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'properties');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="properties.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return new StreamableFile(buf);
  }
}
