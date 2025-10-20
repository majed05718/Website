import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة المواعيد مع filters' })
  async findAll(@Req() req: any, @Query() filters: FilterAppointmentsDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findAll(officeId, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات المواعيد' })
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getStats(officeId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'مواعيد التقويم (startDate, endDate)' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-10-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-10-31' })
  async getCalendar(
    @Req() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getCalendar(officeId, startDate, endDate);
  }

  @Get('today')
  @ApiOperation({ summary: 'مواعيد اليوم' })
  async getToday(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getToday(officeId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'المواعيد القادمة' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getUpcoming(@Req() req: any, @Query('limit') limit?: number) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getUpcoming(officeId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل موعد' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findOne(officeId, id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة موعد جديد' })
  @Roles('manager', 'staff')
  async create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.create(officeId, userId, dto);
    return { success: true, appointment };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل موعد' })
  @Roles('manager', 'staff')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.update(officeId, id, dto);
    return { success: true, appointment };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف موعد' })
  @Roles('manager')
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.remove(officeId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تحديث حالة الموعد' })
  @Roles('manager', 'staff')
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.updateStatus(officeId, id, userId, dto);
    return { success: true, appointment };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'إلغاء موعد' })
  @Roles('manager', 'staff')
  async cancel(@Req() req: any, @Param('id') id: string, @Body() dto: CancelAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.cancel(officeId, id, userId, dto);
    return { success: true, appointment };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'إتمام موعد' })
  @Roles('manager', 'staff')
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.complete(officeId, id, dto);
    return { success: true, appointment };
  }

  @Post(':id/remind')
  @ApiOperation({ summary: 'إرسال تذكير للموعد' })
  @Roles('manager', 'staff')
  async sendReminder(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.sendReminder(officeId, id);
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'التحقق من توفر موعد' })
  @Roles('manager', 'staff')
  async checkAvailability(@Req() req: any, @Body() dto: CheckAvailabilityDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.checkAvailability(officeId, dto);
  }
}
