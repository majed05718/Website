import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Office } from '../entities/office.entity';
import { UserPermission } from '../entities/user-permission.entity';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Office) private readonly officeRepo: Repository<Office>,
    @InjectRepository(UserPermission) private readonly permRepo: Repository<UserPermission>,
  ) {}

  async verifyCodeAvailable(code: string) {
    const exists = await this.officeRepo.exists({ where: { officeCode: code } as any });
    return { available: !exists };
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

    const office = this.officeRepo.create({
      officeCode: code,
      officeName: body.office_name,
      maxProperties: 1000,
      maxUsers: 50,
      subscriptionPlan: 'free',
      whatsappPhoneNumber: body.whatsapp_number ?? null,
    });
    const savedOffice = await this.officeRepo.save(office);

    // إنشاء مدير في user_permissions
    const manager = this.permRepo.create({
      officeId: savedOffice.id,
      userId: 'pending',
      role: 'manager',
      status: 'active',
      permissions: { all: true },
    });
    await this.permRepo.save(manager);

    // Supabase Auth
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) throw new BadRequestException('إعدادات Supabase غير متوفرة');
    const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data, error } = await client.auth.admin.createUser({
      email: body.manager_email,
      email_confirm: true,
      user_metadata: { name: body.manager_name, phone: body.manager_phone },
      app_metadata: { office_id: savedOffice.id, role: 'manager' },
    });
    if (error) throw new BadRequestException('تعذر إنشاء المستخدم: ' + error.message);

    // تحديث userId الحقيقي
    manager.userId = data.user?.id || manager.userId;
    await this.permRepo.save(manager);

    return { office_id: savedOffice.id, office_code: savedOffice.officeCode, access_token: null };
  }

  async complete(body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    const office = await this.officeRepo.findOne({ where: { id: body.office_id } });
    if (!office) throw new BadRequestException('المكتب غير موجود');

    if (body.subscription_plan) office.subscriptionPlan = body.subscription_plan;
    if (body.whatsapp_config?.access_token) {
      office.whatsappApiToken = encrypt(body.whatsapp_config.access_token);
    }
    if (body.whatsapp_config?.api_base_url) office.whatsappApiUrl = body.whatsapp_config.api_base_url;
    if (body.whatsapp_config?.phone_number) office.whatsappPhoneNumber = body.whatsapp_config.phone_number;
    if (body.whatsapp_config?.phone_number_id) office.whatsappPhoneNumberId = body.whatsapp_config.phone_number_id;

    office.onboardingCompleted = true;

    await this.officeRepo.save(office);
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
