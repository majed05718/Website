import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { RentalPayment } from './rental-payment.entity';
import { PaymentAlert } from './payment-alert.entity';
import { Contract } from './rental.contract.entity';
import { FilterPaymentsDto } from './dto/filter-payments.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(RentalPayment) private readonly paymentsRepo: Repository<RentalPayment>,
    @InjectRepository(PaymentAlert) private readonly alertsRepo: Repository<PaymentAlert>,
    @InjectRepository(Contract) private readonly contractsRepo: Repository<Contract>,
  ) {}

  async findPayments(officeId: string, filters: FilterPaymentsDto) {
    const where: FindOptionsWhere<RentalPayment> = { officeId };
    if (filters.status) where.status = filters.status;
    if (filters.contract_id) where.contractId = filters.contract_id;
    if (filters.tenant_phone) where.tenantPhone = filters.tenant_phone;

    if (filters.due_from && filters.due_to) {
      (where as any).dueDate = Between(filters.due_from, filters.due_to);
    } else if (filters.due_from) {
      (where as any).dueDate = MoreThanOrEqual(filters.due_from);
    } else if (filters.due_to) {
      (where as any).dueDate = LessThan(filters.due_to);
    }

    const items = await this.paymentsRepo.find({
      where,
      order: { dueDate: 'ASC' },
      relations: ['contract'],
    });

    return items;
  }

  async findByContract(officeId: string, contractId: string) {
    const items = await this.paymentsRepo.find({
      where: { officeId, contractId },
      order: { dueDate: 'ASC' },
      relations: ['contract'],
    });
    return items;
  }

  async markPaid(officeId: string, id: string, dto: MarkPaidDto) {
    const payment = await this.paymentsRepo.findOne({ where: { id, officeId }, relations: ['contract'] });
    if (!payment) throw new NotFoundException('الدفعة غير موجودة');
    if (payment.status === 'paid') throw new BadRequestException('تم سداد هذه الدفعة مسبقاً');

    const contract = payment.contract;
    const rate = Number(contract?.officeCommissionRate ?? 0) / 100;
    const amountPaid = Number(dto.amount_paid);
    if (isNaN(amountPaid) || amountPaid <= 0) throw new BadRequestException('قيمة السداد غير صحيحة');

    const officeCommission = round2(amountPaid * rate);
    const ownerAmount = round2(amountPaid - officeCommission);

    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.amountPaid = amountPaid.toFixed(2);
    payment.paymentMethod = dto.payment_method ?? null;
    payment.paymentReference = dto.payment_reference ?? null;
    payment.officeCommission = officeCommission.toFixed(2);
    payment.ownerAmount = ownerAmount.toFixed(2);

    const saved = await this.paymentsRepo.save(payment);

    // إلغاء التنبيهات المرتبطة
    await this.alertsRepo.delete({ paymentId: payment.id } as any);

    return saved;
  }

  async getOverdue(officeId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const items = await this.paymentsRepo.find({ where: { officeId, status: 'pending', dueDate: LessThan(today) }, relations: ['contract'] });

    // إنشاء/تحديث تنبيهات
    for (const p of items) {
      const days = daysBetween(p.dueDate, today);
      const { alertType, level } = classifyAlert(days);
      if (!alertType) continue;

      const existing = await this.alertsRepo.findOne({ where: { paymentId: p.id, alertType } });
      if (!existing) {
        const alert = this.alertsRepo.create({
          officeId,
          contractId: p.contractId,
          paymentId: p.id,
          alertType,
          alertLevel: level,
          dueDate: p.dueDate,
          amount: p.amountDue,
          daysOverdue: days,
          isSent: false,
          tenantPhone: p.tenantPhone ?? null,
          tenantName: p.tenantName ?? null,
        });
        await this.alertsRepo.save(alert);
      } else {
        existing.alertLevel = level;
        existing.daysOverdue = days;
        await this.alertsRepo.save(existing);
      }
    }

    // إعادة مع التنبيهات
    const alerts = await this.alertsRepo.find({ where: { officeId } });
    return { items, alerts };
  }

  async sendReminder(officeId: string, paymentId: string, message?: string) {
    const payment = await this.paymentsRepo.findOne({ where: { id: paymentId, officeId }, relations: ['contract'] });
    if (!payment) throw new NotFoundException('الدفعة غير موجودة');

    const alert = this.alertsRepo.create({
      officeId,
      contractId: payment.contractId,
      paymentId: payment.id,
      alertType: 'manual_reminder',
      alertLevel: 0,
      dueDate: payment.dueDate,
      amount: payment.amountDue,
      daysOverdue: null,
      isSent: true,
      sentDate: new Date(),
      tenantPhone: payment.tenantPhone ?? null,
      tenantName: payment.tenantName ?? null,
    });
    await this.alertsRepo.save(alert);

    // استدعاء webhook إن وُجد
    const url = process.env.N8N_WEBHOOK_URL;
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_reminder',
            paymentId: payment.id,
            officeId,
            message: message ?? undefined,
            tenantPhone: payment.tenantPhone ?? undefined,
            tenantName: payment.tenantName ?? undefined,
            dueDate: payment.dueDate,
            amount: payment.amountDue,
          }),
        });
      } catch (_) {}
    }

    return { success: true };
  }
}

function classifyAlert(daysOverdue: number): { alertType: string | null; level: number } {
  if (daysOverdue < 0) {
    if (daysOverdue === -7) return { alertType: 'reminder', level: 0 };
    if (daysOverdue === 0) return { alertType: 'due', level: 0 };
    return { alertType: null, level: 0 };
  }
  if (daysOverdue >= 14) return { alertType: 'overdue_14', level: 3 };
  if (daysOverdue >= 7) return { alertType: 'overdue_7', level: 2 };
  if (daysOverdue >= 3) return { alertType: 'overdue_3', level: 1 };
  return { alertType: null, level: 0 };
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00Z');
  const d2 = new Date(date2 + 'T00:00:00Z');
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
