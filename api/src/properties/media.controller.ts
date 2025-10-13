import { BadRequestException, Body, Controller, Delete, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { PropertiesService } from './properties.service';

@ApiTags('Media')
@ApiBearerAuth()
@Controller()
export class MediaController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post('media/signed-url')
  async signedUrl(@Req() req: any, @Body() body: { property_id: string; filename: string; contentType: string }) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const { property_id, filename, contentType } = body || ({} as any);

    if (!property_id || !filename || !contentType) throw new BadRequestException('بيانات غير مكتملة');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) throw new BadRequestException('نوع الملف غير مسموح');

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) throw new BadRequestException('إعدادات Supabase غير متوفرة');

    const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const bucket = 'properties';
    const path = `${officeId}/${property_id}/${uuidv4()}-${sanitize(filename)}`;
    const expiresIn = 60 * 10; // 10 دقائق

    const { data, error } = await client.storage.from(bucket).createSignedUploadUrl(path, { upsert: false });
    if (error) throw new BadRequestException('تعذر توليد رابط الرفع');

    return { uploadUrl: data?.signedUrl, path, expiresIn };
  }

  @Post('properties/:id/images')
  async addImage(@Req() req: any, @Param('id') id: string, @Body() body: { url: string; fileName?: string; fileSize?: number; isFeatured?: boolean }) {
    const userId = req?.user?.user_id;
    const { url, fileName, fileSize, isFeatured } = body || ({} as any);
    if (!url) throw new BadRequestException('رابط الصورة مطلوب');
    const image = await this.propertiesService.addImage(id, url, userId, fileName, fileSize, isFeatured);
    return { success: true, image };
  }

  @Patch('properties/:propertyId/images/:imageId')
  async setFeatured(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const image = await this.propertiesService.setFeaturedImage(propertyId, imageId);
    return { success: true, image };
  }

  @Delete('properties/:propertyId/images/:imageId')
  async removeImage(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const res = await this.propertiesService.removeImage(propertyId, imageId);
    return res;
  }
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
