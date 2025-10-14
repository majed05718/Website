import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import slugify from 'slugify';

@Injectable()
export class OnboardingService {
  constructor(private readonly supabase: SupabaseService) {}

  async verifyCodeAvailable(code: string) {
    const { data } = await this.supabase.getClient()
      .from('offices')
      .select('id')
      .eq('office_code', code)
      .single();

    return { available: !data };
  }

  private generateOfficeCode(name: string): string {
    const eng = slugify(name, { lower: true, strict: true });
    return eng;
  }

  async createOffice(body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    if (!body.office_name || !body.manager_email) throw new BadRequestException('بيانات المكتب غير مكتملة');
    const code = this.generateOfficeCode(body.office_name);
    const available = await this.verifyCodeAvailable(code);
    if (!available.available) throw new BadRequestException('رمز المكتب مستخدم');

    const { data: savedOffice, error: officeError } = await this.supabase.getClient()
      .from('offices')
      .insert({
        office_code: code,
        office_name: body.office_name,
        max_properties: 1000,
        max_users: 50,
        subscription_plan: 'free',
        whatsapp_phone_number: body.whatsapp_number ?? null,
      })
      .select()
      .single();

    if (officeError) throw officeError;

    const { data: manager, error: managerError } = await this.supabase.getClient()
      .from('user_permissions')
      .insert({
        office_id: savedOffice.id,
        user_id: 'pending',
        role: 'manager',
        status: 'active',
        permissions: { all: true },
      })
      .select()
      .single();

    if (managerError) throw managerError;

    const { data, error } = await this.supabase.getClient().auth.admin.createUser({
      email: body.manager_email,
      email_confirm: true,
      user_metadata: { name: body.manager_name, phone: body.manager_phone },
      app_metadata: { office_id: savedOffice.id, role: 'manager' },
    });
    if (error) throw new BadRequestException('تعذر إنشاء المستخدم: ' + error.message);

    await this.supabase.getClient()
      .from('user_permissions')
      .update({ user_id: data.user?.id || manager.user_id })
      .eq('id', manager.id);

    return { office_id: savedOffice.id, office_code: savedOffice.office_code, access_token: null };
  }

  async complete(body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    const { data: office } = await this.supabase.getClient()
      .from('offices')
      .select('*')
      .eq('id', body.office_id)
      .single();

    if (!office) throw new BadRequestException('المكتب غير موجود');

    const updates: any = { onboarding_completed: true };
    if (body.subscription_plan) updates.subscription_plan = body.subscription_plan;
    if (body.whatsapp_config?.access_token) {
      updates.whatsapp_api_token = encrypt(body.whatsapp_config.access_token);
    }
    if (body.whatsapp_config?.api_base_url) updates.whatsapp_api_url = body.whatsapp_config.api_base_url;
    if (body.whatsapp_config?.phone_number) updates.whatsapp_phone_number = body.whatsapp_config.phone_number;
    if (body.whatsapp_config?.phone_number_id) updates.whatsapp_phone_number_id = body.whatsapp_config.phone_number_id;

    const { error } = await this.supabase.getClient()
      .from('offices')
      .update(updates)
      .eq('id', body.office_id);

    if (error) throw error;
    return { success: true };
  }
}

function encrypt(plain: string): string {
  const crypto = require('crypto');
  const key = process.env.SECRET_KEY || 'default_secret_key_32_chars________';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', crypto.createHash('sha256').update(key).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return iv.toString('base64') + ':' + encrypted.toString('base64');
}
