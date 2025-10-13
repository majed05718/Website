import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MaintenanceRequest } from './maintenance-request.entity';
import { Property } from '../properties/properties.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { PublicCreateMaintenanceDto } from './dto/public-create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';
import { N8nService } from '../integrations/n8n/n8n.service';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest) private readonly repo: Repository<MaintenanceRequest>,
    @InjectRepository(Property) private readonly propRepo: Repository<Property>,
    private readonly n8n: N8nService,
  ) {}

  async list(officeId: string, filters: any) {
    const where: any = { officeId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.issue_type) where.issueType = filters.issue_type;
    if (filters.property_id) where.propertyId = filters.property_id;
    if (filters.tenant_phone) where.tenantPhone = filters.tenant_phone;
    if (filters.assigned_technician) where.assignedTechnician = filters.assigned_technician;

    const items = await this.repo.find({ where, relations: ['property'], order: { createdAt: 'DESC' } });
    return items;
  }

  async getOne(officeId: string, id: string) {
    const item = await this.repo.findOne({ where: { id, officeId }, relations: ['property'] });
    if (!item) throw new NotFoundException('سجل الصيانة غير موجود');
    return item;
  }

  async createInternal(officeId: string, officeCode: string, userId: string | null, dto: CreateMaintenanceDto) {
    const cleanedPhone = sanitizePhone(dto.tenant_phone);
    const requestNumber = await this.generateRequestNumber(officeCode);

    const entity = this.repo.create({
      officeId,
      propertyId: dto.property_id ?? null,
      tenantPhone: cleanedPhone ?? null,
      tenantName: dto.tenant_name ?? null,
      issueType: dto.issue_type,
      priority: dto.priority,
      description: dto.description ?? null,
      beforeImages: dto.before_images ?? null,
      status: 'new',
      requestNumber,
    });

    const saved = await this.repo.save(entity);

    const payload = {
      request_id: saved.id,
      office_id: officeId,
      property_id: saved.propertyId,
      tenant_phone: saved.tenantPhone,
      tenant_name: saved.tenantName,
      issue_type: saved.issueType,
      priority: saved.priority,
      description: saved.description,
      status: saved.status,
      created_at: saved.createdAt,
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

    const entity = this.repo.create({
      officeId,
      propertyId: dto.property_id ?? null,
      tenantPhone: cleanedPhone ?? null,
      tenantName: dto.tenant_name ?? null,
      issueType: dto.issue_type,
      priority: dto.priority,
      description: dto.description ?? dto.title ?? null,
      beforeImages: dto.before_images ?? null,
      status: 'new',
      requestNumber,
    });

    const saved = await this.repo.save(entity);

    const payload = {
      request_id: saved.id,
      office_id: officeId,
      property_id: saved.propertyId,
      tenant_phone: saved.tenantPhone,
      tenant_name: saved.tenantName,
      issue_type: saved.issueType,
      priority: saved.priority,
      description: saved.description,
      status: saved.status,
      created_at: saved.createdAt,
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

    item.status = nextStatus;
    item.assignedTechnician = dto.assigned_technician ?? item.assignedTechnician;
    item.technicianName = dto.technician_name ?? item.technicianName;
    item.scheduledDate = dto.scheduled_date ? new Date(dto.scheduled_date) : item.scheduledDate;
    item.estimatedCost = dto.estimated_cost ?? item.estimatedCost;
    item.actualCost = dto.actual_cost ?? item.actualCost;
    item.whoPays = dto.who_pays ?? item.whoPays;
    item.beforeImages = dto.before_images ?? item.beforeImages;
    item.afterImages = dto.after_images ?? item.afterImages;
    item.technicianNotes = dto.technician_notes ?? item.technicianNotes;

    const saved = await this.repo.save(item);
    return saved;
  }

  async complete(officeId: string, id: string, dto: CompleteMaintenanceDto) {
    const item = await this.getOne(officeId, id);
    item.status = 'completed';
    item.completedAt = new Date();
    item.actualCost = dto.actual_cost;
    item.afterImages = dto.after_images ?? item.afterImages;
    item.technicianNotes = dto.technician_notes ?? item.technicianNotes;
    if (dto.tenant_rating) item.tenantRating = Number(dto.tenant_rating);
    if (dto.tenant_feedback) item.tenantFeedback = dto.tenant_feedback;

    const saved = await this.repo.save(item);
    return saved;
  }

  private async generateRequestNumber(officeCode: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MNT-${officeCode}-${year}-`;
    const last = await this.repo.find({ where: { requestNumber: Like(`${prefix}%`) }, order: { createdAt: 'DESC' }, take: 1 });
    let seq = 1;
    if (last.length > 0) {
      const m = last[0].requestNumber.match(/(\d+)$/);
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
  return ni >= ci; // يسمح بالتقدم للأمام فقط
}
