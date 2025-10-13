import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PaymentsService } from './payments.service';
import { FilterPaymentsDto } from './dto/filter-payments.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { SendReminderDto } from './dto/send-reminder.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller()
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payments')
  async list(@Req() req: any, @Query() filters: FilterPaymentsDto) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findPayments(officeId, filters);
  }

  @Get('contracts/:contractId/payments')
  async byContract(@Req() req: any, @Param('contractId') contractId: string) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findByContract(officeId, contractId);
  }

  @Patch('payments/:id/mark-paid')
  @Roles('manager', 'staff', 'accountant')
  async markPaid(@Req() req: any, @Param('id') id: string, @Body() dto: MarkPaidDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.paymentsService.markPaid(officeId, id, dto);
    return { success: true, payment: updated };
  }

  @Get('payments/overdue')
  async overdue(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.getOverdue(officeId);
  }

  @Post('payments/:id/send-reminder')
  @Roles('manager', 'staff')
  async sendReminder(@Req() req: any, @Param('id') id: string, @Body() body: SendReminderDto) {
    const officeId = req?.user?.office_id;
    const res = await this.paymentsService.sendReminder(officeId, id, body?.message);
    return res;
  }
}
