import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FilterPaymentsDto } from './dto/filter-payments.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findPayments(officeId: string, filters: FilterPaymentsDto & { page?: number; limit?: number }) {
    const page: number = Math.max(1, Number(filters?.page ?? 1));
    const limit: number = Math.min(100, Math.max(1, Number(filters?.limit ?? 50)));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)', { count: 'exact' })
      .eq('office_id', officeId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters.tenant_phone) query = query.eq('tenant_phone', filters.tenant_phone);
    if (filters.due_from) query = query.gte('due_date', filters.due_from);
    if (filters.due_to) query = query.lt('due_date', filters.due_to);

    query = query.order('due_date', { ascending: true }).range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0, page, limit };
  }

  async findByContract(officeId: string, contractId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('office_id', officeId)
      .eq('contract_id', contractId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async markPaid(officeId: string, id: string, dto: MarkPaidDto) {
    const { data: payment } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (!payment) throw new NotFoundException('الدفعة غير موجودة');
    if (payment.status === 'paid') throw new BadRequestException('تم سداد هذه الدفعة مسبقاً');

    const contract = payment.contract;
    const rate = Number(contract?.office_commission_rate ?? 0) / 100;
    const amountPaid = Number(dto.amount_paid);
    if (isNaN(amountPaid) || amountPaid <= 0) throw new BadRequestException('قيمة السداد غير صحيحة');

    const officeCommission = round2(amountPaid * rate);
    const ownerAmount = round2(amountPaid - officeCommission);

    const { data: saved, error } = await this.supabase.getClient()
      .from('rental_payments')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        amount_paid: amountPaid.toFixed(2),
        payment_method: dto.payment_method ?? null,
        payment_reference: dto.payment_reference ?? null,
        office_commission: officeCommission.toFixed(2),
        owner_amount: ownerAmount.toFixed(2),
      })
      .eq('id', id)
      .select('*, contract:rental_contracts(*)')
      .single();

    if (error) throw error;

    await this.supabase.getClient()
      .from('payment_alerts')
      .delete()
      .eq('payment_id', payment.id);

    return saved;
  }

  async getOverdue(officeId: string) {
    const today = new Date().toISOString().slice(0, 10);
    
    const { data: items, error } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('office_id', officeId)
      .eq('status', 'pending')
      .lt('due_date', today);

    if (error) throw error;

    for (const p of items || []) {
      const days = daysBetween(p.due_date, today);
      const { alertType, level } = classifyAlert(days);
      if (!alertType) continue;

      const { data: existing } = await this.supabase.getClient()
        .from('payment_alerts')
        .select('*')
        .eq('payment_id', p.id)
        .eq('alert_type', alertType)
        .single();

      if (!existing) {
        await this.supabase.getClient()
          .from('payment_alerts')
          .insert({
            office_id: officeId,
            contract_id: p.contract_id,
            payment_id: p.id,
            alert_type: alertType,
            alert_level: level,
            due_date: p.due_date,
            amount: p.amount_due,
            days_overdue: days,
            is_sent: false,
            tenant_phone: p.tenant_phone ?? null,
            tenant_name: p.tenant_name ?? null,
          });
      } else {
        await this.supabase.getClient()
          .from('payment_alerts')
          .update({
            alert_level: level,
            days_overdue: days,
          })
          .eq('id', existing.id);
      }
    }

    const { data: alerts } = await this.supabase.getClient()
      .from('payment_alerts')
      .select('*')
      .eq('office_id', officeId);

    return { data: items || [], alerts: alerts || [] };
  }

  async sendReminder(officeId: string, paymentId: string, message?: string) {
    const { data: payment } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('id', paymentId)
      .eq('office_id', officeId)
      .single();

    if (!payment) throw new NotFoundException('الدفعة غير موجودة');

    await this.supabase.getClient()
      .from('payment_alerts')
      .insert({
        office_id: officeId,
        contract_id: payment.contract_id,
        payment_id: payment.id,
        alert_type: 'manual_reminder',
        alert_level: 0,
        due_date: payment.due_date,
        amount: payment.amount_due,
        days_overdue: null,
        is_sent: true,
        sent_date: new Date().toISOString(),
        tenant_phone: payment.tenant_phone ?? null,
        tenant_name: payment.tenant_name ?? null,
      });

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
            tenantPhone: payment.tenant_phone ?? undefined,
            tenantName: payment.tenant_name ?? undefined,
            dueDate: payment.due_date,
            amount: payment.amount_due,
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
