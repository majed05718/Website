import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SupabaseService } from '../supabase/supabase.service';
import { MetaApiService } from './meta-api.service';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@Controller('whatsapp')
@UseGuards(RolesGuard)
export class WhatsAppController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly meta: MetaApiService,
  ) {}

  @Get('webhook')
  async verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    if (mode === 'subscribe' && token && challenge) {
      if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return challenge;
      }
      throw new ForbiddenException('رمز التحقق غير صحيح');
    }
    throw new BadRequestException('معلمات التحقق غير صحيحة');
  }

  @Post('webhook')
  async webhook(@Body() payload: any) {
    // تمرير كما هو إلى n8n
    const url = process.env.N8N_WHATSAPP_WEBHOOK_URL || '';
    if (url) {
      try {
        await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } catch (_) {}
    }

    // استخراج البيانات الأساسية
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const fromPhone = messages?.[0]?.from;
    const text = messages?.[0]?.text?.body ?? null;
    const phoneNumberId = value?.metadata?.phone_number_id;

    let officeId = 'unknown';
    if (phoneNumberId) {
      const { data: office } = await this.supabaseService.getClient()
        .from('offices')
        .select('id')
        .eq('whatsapp_phone_number_id', phoneNumberId)
        .single();
      if (office) officeId = office.id;
    }

    await this.supabaseService.getClient()
      .from('conversations')
      .insert({
        office_id: officeId,
        user_phone: fromPhone ?? null,
        message_text: text,
        direction: 'incoming',
        message_type: messages?.[0]?.type ?? null,
        session_id: value?.contacts?.[0]?.wa_id ?? null,
        conversation_context: payload,
      });

    return { ok: true };
  }

  @Post('connect')
  @Roles('manager')
  async connect(@Req() req: any, @Body() body: { phone_number_id: string; access_token: string; api_base_url?: string; phone_display?: string }) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    
    const { data: office, error } = await this.supabaseService.getClient()
      .from('offices')
      .select('*')
      .eq('id', officeId)
      .single();
    
    if (error || !office) throw new BadRequestException('المكتب غير موجود');

    if (!body?.phone_number_id || !body?.access_token) throw new BadRequestException('بيانات غير مكتملة');

    await this.supabaseService.getClient()
      .from('offices')
      .update({
        whatsapp_phone_number_id: body.phone_number_id,
        whatsapp_api_token: encrypt(body.access_token),
        whatsapp_api_url: (body.api_base_url || 'https://graph.facebook.com/v18.0').replace(/\/$/, ''),
        whatsapp_phone_number: body.phone_display ?? office.whatsapp_phone_number,
      })
      .eq('id', officeId);

    try {
      await this.meta.sendTemplate(officeId, {
        to: req?.user?.phone || office.whatsapp_phone_number || '',
        template_name: 'hello_world',
        language: 'en_US',
        components: [],
      });
    } catch (err) {
      throw new BadRequestException('تعذر إتمام الاتصال: ' + (err as any)?.message);
    }

    return { success: true };
  }

  @Post('send-template')
  @Roles('manager', 'staff')
  async sendTemplate(@Req() req: any, @Body() body: { to: string; template_name: string; language: string; components?: any[] }) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');

    const res = await this.meta.sendTemplate(officeId, body);

    await this.supabaseService.getClient()
      .from('conversations')
      .insert({
        office_id: officeId,
        user_phone: body.to,
        message_text: `[TEMPLATE:${body.template_name}]`,
        direction: 'outgoing',
        message_type: 'template',
        session_id: null,
        conversation_context: res,
      });

    return { message_id: res?.messages?.[0]?.id ?? null };
  }

  @Get('templates')
  async templates(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const data = await this.meta.fetchTemplates(officeId);
    return data;
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
