import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';

@Injectable()
export class N8nService {
  constructor(
    @InjectRepository(ActivityLog) private readonly activityRepo: Repository<ActivityLog>,
  ) {}

  async triggerWebhook(url: string, payload: any): Promise<{ ok: boolean } | null> {
    if (!url) return null;

    let attempt = 0;
    let delay = 500; // ms
    let lastError: any = null;

    while (attempt < 3) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const ok = res.ok;

        try {
          await this.activityRepo.insert({
            officeId: payload?.office_id ?? null,
            userPhone: null,
            userRole: null,
            activityType: 'n8n_webhook',
            entityType: 'maintenance',
            entityId: payload?.request_id ?? null,
            requestData: payload,
            responseData: { status: res.status },
            status: String(res.status),
            processingTime: null,
          } as any);
        } catch (_) {}

        if (ok) return { ok: true };
        lastError = new Error('HTTP ' + res.status);
      } catch (err) {
        lastError = err;
      }

      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      attempt++;
    }

    try {
      await this.activityRepo.insert({
        officeId: payload?.office_id ?? null,
        userPhone: null,
        userRole: null,
        activityType: 'n8n_webhook_error',
        entityType: 'maintenance',
        entityId: payload?.request_id ?? null,
        requestData: payload,
        responseData: { error: String(lastError) },
        status: 'error',
        processingTime: null,
      } as any);
    } catch (_) {}

    return { ok: false };
  }
}
