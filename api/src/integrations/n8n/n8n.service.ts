import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class N8nService {
  constructor(private readonly supabase: SupabaseService) {}

  async triggerWebhook(url: string, payload: any): Promise<{ ok: boolean } | null> {
    if (!url) return null;

    let attempt = 0;
    let delay = 500;
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
          await this.supabase.getClient()
            .from('activity_logs')
            .insert({
              office_id: payload?.office_id ?? null,
              user_phone: null,
              user_role: null,
              activity_type: 'n8n_webhook',
              entity_type: 'maintenance',
              entity_id: payload?.request_id ?? null,
              request_data: payload,
              response_data: { status: res.status },
              status: String(res.status),
              processing_time: null,
            });
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
      await this.supabase.getClient()
        .from('activity_logs')
        .insert({
          office_id: payload?.office_id ?? null,
          user_phone: null,
          user_role: null,
          activity_type: 'n8n_webhook_error',
          entity_type: 'maintenance',
          entity_id: payload?.request_id ?? null,
          request_data: payload,
          response_data: { error: String(lastError) },
          status: 'error',
          processing_time: null,
        });
    } catch (_) {}

    return { ok: false };
  }
}
