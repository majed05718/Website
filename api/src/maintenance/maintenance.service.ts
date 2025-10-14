import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { PublicCreateMaintenanceDto } from './dto/public-create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';
import { N8nService } from '../integrations/n8n/n8n.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly n8n: N8nService,
  ) {}

  async list(officeId: string, filters: any) {
    let query = this.supabase.getClient()
      .from('maintenance_requests')
      .select('*, property:properties(*)')
      .eq('office_id', officeId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.issue_type) query = query.eq('issue_type', filters.issue_type);
    if (filters.property_id) query = query.eq('property_id', filters.property_id);
    if (filters.tenant_phone) query = query.eq('tenant_phone', filters.tenant_phone);
    if (filters.assigned_technician) query = query.eq('assigned_technician', filters.assigned_technician);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async getOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .select('*, property:properties(*)')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (error || !data) throw new NotFoundException('سجل الصيانة غير موجود');
    return data;
  }

  async createInternal(officeId: string, officeCode: string, userId: string | null, dto: CreateMaintenanceDto) {
    const cleanedPhone = sanitizePhone(dto.tenant_phone);
    const requestNumber = await this.generateRequestNumber(officeCode);

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .insert({
        office_id: officeId,
        property_id: dto.property_id ?? null,
        tenant_phone: cleanedPhone ?? null,
        tenant_name: dto.tenant_name ?? null,
        issue_type: dto.issue_type,
        priority: dto.priority,
        description: dto.description ?? null,
        before_images: dto.before_images ?? null,
        status: 'new',
        request_number: requestNumber,
      })
      .select()
      .single();

    if (error) throw error;

    const payload = {
      request_id: saved.id,
      office_id: officeId,
      property_id: saved.property_id,
      tenant_phone: saved.tenant_phone,
      tenant_name: saved.tenant_name,
      issue_type: saved.issue_type,
      priority: saved.priority,
      description: saved.description,
      status: saved.status,
      created_at: saved.created_at,
    };
    const url = process.env.N8N_MAINTENANCE_WEBHOOK_URL || '';
    await this.n8n.triggerWebhook(url, payload);

    return saved;
  }

  async createPublic(officeId: string, officeCode: string, dto: PublicCreateMaintenanceDto) {
    if (!dto.property_id && !dto.title) {
      throw new BadRequestException('يجب تحديد العقار أو عنوان البلاغ');
    }
    const cleanedPhone = sanitizePhone(dto.tenant_phone);
    const requestNumber = await this.generateRequestNumber(officeCode);

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .insert({
        office_id: officeId,
        property_id: dto.property_id ?? null,
        tenant_phone: cleanedPhone ?? null,
        tenant_name: dto.tenant_name ?? null,
        issue_type: dto.issue_type,
        priority: dto.priority,
        description: dto.description ?? dto.title ?? null,
        before_images: dto.before_images ?? null,
        status: 'new',
        request_number: requestNumber,
      })
      .select()
      .single();

    if (error) throw error;

    const payload = {
      request_id: saved.id,
      office_id: officeId,
      property_id: saved.property_id,
      tenant_phone: saved.tenant_phone,
      tenant_name: saved.tenant_name,
      issue_type: saved.issue_type,
      priority: saved.priority,
      description: saved.description,
      status: saved.status,
      created_at: saved.created_at,
    };
    const url = process.env.N8N_MAINTENANCE_WEBHOOK_URL || '';
    await this.n8n.triggerWebhook(url, payload);

    return saved;
  }

  async update(officeId: string, id: string, dto: UpdateMaintenanceDto) {
    const item = await this.getOne(officeId, id);

    const nextStatus = dto.status ?? item.status;
    if (!isValidTransition(item.status, nextStatus)) {
      throw new BadRequestException('انتقال حالة غير مسموح');
    }

    const updates: any = { status: nextStatus };
    if (dto.assigned_technician) updates.assigned_technician = dto.assigned_technician;
    if (dto.technician_name) updates.technician_name = dto.technician_name;
    if (dto.scheduled_date) updates.scheduled_date = new Date(dto.scheduled_date).toISOString();
    if (dto.estimated_cost) updates.estimated_cost = dto.estimated_cost;
    if (dto.actual_cost) updates.actual_cost = dto.actual_cost;
    if (dto.who_pays) updates.who_pays = dto.who_pays;
    if (dto.before_images) updates.before_images = dto.before_images;
    if (dto.after_images) updates.after_images = dto.after_images;
    if (dto.technician_notes) updates.technician_notes = dto.technician_notes;

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return saved;
  }

  async complete(officeId: string, id: string, dto: CompleteMaintenanceDto) {
    const item = await this.getOne(officeId, id);
    
    const updates: any = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      actual_cost: dto.actual_cost,
    };
    if (dto.after_images) updates.after_images = dto.after_images;
    if (dto.technician_notes) updates.technician_notes = dto.technician_notes;
    if (dto.tenant_rating) updates.tenant_rating = Number(dto.tenant_rating);
    if (dto.tenant_feedback) updates.tenant_feedback = dto.tenant_feedback;

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return saved;
  }

  private async generateRequestNumber(officeCode: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MNT-${officeCode}-${year}-`;
    
    const { data: last } = await this.supabase.getClient()
      .from('maintenance_requests')
      .select('request_number')
      .like('request_number', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let seq = 1;
    if (last) {
      const m = last.request_number.match(/(\d+)$/);
      if (m) seq = Number(m[1]) + 1;
    }
    return `${prefix}${String(seq).padStart(4, '0')}`;
  }
}

function sanitizePhone(p?: string | null): string | null {
  if (!p) return null;
  return p.replace(/[^0-9+]/g, '');
}

function isValidTransition(current: string, next: string): boolean {
  const order = ['new', 'in_progress', 'completed', 'closed'];
  const ci = order.indexOf(current);
  const ni = order.indexOf(next);
  if (ci === -1 || ni === -1) return false;
  return ni >= ci;
}
