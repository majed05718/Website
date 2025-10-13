import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Office } from '../entities/office.entity';
import { MetaApiService } from './meta-api.service';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@Controller('whatsapp')
@UseGuards(RolesGuard)
export class WhatsAppController {
  constructor(
    @InjectRepository(Conversation) private readonly convRepo: Repository<Conversation>,
    @InjectRepository(Office) private readonly officeRepo: Repository<Office>,
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

    // تحديد المكتب عبر رقم الهاتف المعرف
    let office: Office | null = null;
    if (phoneNumberId) {
      office = await this.officeRepo.findOne({ where: { whatsappPhoneNumberId: phoneNumberId } });
    }

    const conversation = this.convRepo.create({
      officeId: office?.id ?? 'unknown',
      userPhone: fromPhone ?? null,
      messageText: text,
      direction: 'incoming',
      messageType: messages?.[0]?.type ?? null,
      sessionId: value?.contacts?.[0]?.wa_id ?? null,
      conversationContext: payload,
    });
    await this.convRepo.save(conversation);

    return { ok: true };
  }

  @Post('connect')
  @Roles('manager')
  async connect(@Req() req: any, @Body() body: { phone_number_id: string; access_token: string; api_base_url?: string; phone_display?: string }) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const office = await this.officeRepo.findOne({ where: { id: officeId } });
    if (!office) throw new BadRequestException('المكتب غير موجود');

    if (!body?.phone_number_id || !body?.access_token) throw new BadRequestException('بيانات غير مكتملة');

    office.whatsappPhoneNumberId = body.phone_number_id;
    office.whatsappApiToken = encrypt(body.access_token);
    office.whatsappApiUrl = (body.api_base_url || 'https://graph.facebook.com/v18.0').replace(/\/$/, '');
    office.whatsappPhoneNumber = body.phone_display ?? office.whatsappPhoneNumber;

    await this.officeRepo.save(office);

    // اختبار الإرسال برسالة Template (اختبارية)
    try {
      await this.meta.sendTemplate(office.id, {
        to: req?.user?.phone || office.whatsappPhoneNumber || '',
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

    // تسجيل المحادثة كإرسال
    const office = await this.officeRepo.findOne({ where: { id: officeId } });
    await this.convRepo.insert({
      officeId,
      userPhone: body.to,
      messageText: `[TEMPLATE:${body.template_name}]`,
      direction: 'outgoing',
      messageType: 'template',
      sessionId: null,
      conversationContext: res,
    } as any);

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
