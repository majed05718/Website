import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from '../entities/office.entity';

interface SendTemplatePayload {
  to: string;
  template_name: string;
  language: string;
  components?: any[];
}

@Injectable()
export class MetaApiService {
  private templatesCache: Map<string, { data: any; expiresAt: number }> = new Map();

  constructor(
    @InjectRepository(Office) private readonly officeRepo: Repository<Office>,
  ) {}

  private async requestWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    let attempt = 0;
    let delay = 500;
    let lastError: any = null;
    while (attempt < retries) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return res;
        lastError = new Error('HTTP ' + res.status);
      } catch (err) {
        lastError = err;
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
      attempt++;
    }
    throw lastError ?? new Error('Meta API request failed');
  }

  async sendTemplate(officeId: string, payload: SendTemplatePayload) {
    const office = await this.officeRepo.findOne({ where: { id: officeId } });
    if (!office?.whatsappApiUrl || !office?.whatsappApiToken || !office?.whatsappPhoneNumberId) {
      throw new Error('إعدادات واتساب غير مكتملة');
    }

    const url = `${office.whatsappApiUrl}/${office.whatsappPhoneNumberId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to: payload.to,
      type: 'template',
      template: {
        name: payload.template_name,
        language: { code: payload.language },
        components: payload.components ?? [],
      },
    };
    const res = await this.requestWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${decrypt(office.whatsappApiToken)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  }

  async fetchTemplates(officeId: string) {
    const office = await this.officeRepo.findOne({ where: { id: officeId } });
    if (!office?.whatsappApiUrl || !office?.whatsappApiToken || !office?.whatsappPhoneNumberId) {
      throw new Error('إعدادات واتساب غير مكتملة');
    }

    const cacheKey = `${officeId}:templates`;
    const cached = this.templatesCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) return cached.data;

    const url = `${office.whatsappApiUrl}/${office.whatsappPhoneNumberId}/message_templates`;
    const res = await this.requestWithRetry(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decrypt(office.whatsappApiToken)}`,
      },
    });
    const data = await res.json();
    this.templatesCache.set(cacheKey, { data, expiresAt: now + 60 * 60 * 1000 });
    return data;
  }
}

function decrypt(cipher: string | null): string {
  if (!cipher) return '';
  try {
    const key = process.env.SECRET_KEY || 'default_secret_key_32_chars________';
    const [ivB64, dataB64] = cipher.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const encryptedData = Buffer.from(dataB64, 'base64');
    const crypto = require('crypto');
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.createHash('sha256').update(key).digest(), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (_) {
    return '';
  }
}
