import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomersDto } from './dto/filter-customers.dto';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto';
import { CreateCustomerInteractionDto } from './dto/create-customer-interaction.dto';
import { LinkPropertyDto } from './dto/link-property.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة العملاء مع filters' })
  async findAll(@Req() req: any, @Query() filters: FilterCustomersDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findAll(officeId, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات العملاء' })
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getStats(officeId);
  }

  @Get('search')
  @ApiOperation({ summary: 'البحث السريع عن عملاء' })
  @ApiQuery({ name: 'q', required: true, description: 'كلمة البحث' })
  async search(@Req() req: any, @Query('q') searchTerm: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.search(officeId, searchTerm);
  }

  @Get('export')
  @ApiOperation({ summary: 'تصدير العملاء إلى Excel' })
  @Roles('manager', 'staff')
  async exportExcel(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');

    const data = await this.customersService.exportExcel(officeId);
    
    const exportData = data.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      national_id: c.national_id,
      type: c.type,
      status: c.status,
      city: c.city,
      address: c.address,
      source: c.source,
      rating: c.rating,
      total_spent: c.total_spent,
      total_earned: c.total_earned,
      outstanding_balance: c.outstanding_balance,
      created_at: c.created_at,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'customers');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="customers.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return buf;
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل عميل' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findOne(officeId, id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة عميل جديد' })
  @Roles('manager', 'staff')
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.create(officeId, userId, dto);
    return { success: true, customer };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل عميل' })
  @Roles('manager', 'staff')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.update(officeId, id, dto);
    return { success: true, customer };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عميل' })
  @Roles('manager')
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.remove(officeId, id);
  }

  // Customer Notes
  @Get(':id/notes')
  @ApiOperation({ summary: 'قائمة ملاحظات العميل' })
  async getNotes(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getNotes(officeId, customerId);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'إضافة ملاحظة للعميل' })
  @Roles('manager', 'staff')
  async createNote(@Req() req: any, @Param('id') customerId: string, @Body() dto: CreateCustomerNoteDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const note = await this.customersService.createNote(officeId, customerId, userId, dto);
    return { success: true, note };
  }

  @Patch(':id/notes/:noteId')
  @ApiOperation({ summary: 'تعديل ملاحظة' })
  @Roles('manager', 'staff')
  async updateNote(
    @Req() req: any,
    @Param('id') customerId: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateCustomerNoteDto
  ) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const note = await this.customersService.updateNote(officeId, customerId, noteId, dto);
    return { success: true, note };
  }

  @Delete(':id/notes/:noteId')
  @ApiOperation({ summary: 'حذف ملاحظة' })
  @Roles('manager', 'staff')
  async removeNote(@Req() req: any, @Param('id') customerId: string, @Param('noteId') noteId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.removeNote(officeId, customerId, noteId);
  }

  // Customer Interactions
  @Get(':id/interactions')
  @ApiOperation({ summary: 'قائمة تعاملات العميل' })
  async getInteractions(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getInteractions(officeId, customerId);
  }

  @Post(':id/interactions')
  @ApiOperation({ summary: 'إضافة تعامل للعميل' })
  @Roles('manager', 'staff')
  async createInteraction(
    @Req() req: any,
    @Param('id') customerId: string,
    @Body() dto: CreateCustomerInteractionDto
  ) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const interaction = await this.customersService.createInteraction(officeId, customerId, userId, dto);
    return { success: true, interaction };
  }

  // Property Relationships
  @Post(':id/properties')
  @ApiOperation({ summary: 'ربط عقار بالعميل' })
  @Roles('manager', 'staff')
  async linkProperty(@Req() req: any, @Param('id') customerId: string, @Body() dto: LinkPropertyDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const relationship = await this.customersService.linkProperty(officeId, customerId, dto);
    return { success: true, relationship };
  }

  @Delete(':id/properties/:propertyId')
  @ApiOperation({ summary: 'إلغاء ربط عقار بالعميل' })
  @Roles('manager', 'staff')
  async unlinkProperty(
    @Req() req: any,
    @Param('id') customerId: string,
    @Param('propertyId') propertyId: string
  ) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.unlinkProperty(officeId, customerId, propertyId);
  }
}
