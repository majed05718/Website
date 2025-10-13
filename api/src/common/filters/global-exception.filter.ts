import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';

// فلتر استثناءات عام لتوحيد صيغة الأخطاء وتسجيلها
@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
  ) {
    super();
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { user?: any }>();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = isHttp
      ? (exception as HttpException).getResponse()
      : { message: 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً' };

    const payload = {
      ok: false,
      status,
      path: request.url,
      method: request.method,
      message: typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message,
      errors: typeof errorResponse === 'object' ? errorResponse : undefined,
      timestamp: new Date().toISOString(),
    } as const;

    try {
      const log: Partial<ActivityLog> = {
        officeId: (request as any)?.user?.office_id ?? null,
        userPhone: (request as any)?.user?.phone ?? null,
        userRole: (request as any)?.user?.role ?? null,
        activityType: `ERROR ${request.method} ${request.url}`,
        entityType: (request as any)?.params?.entity || null,
        entityId: (request as any)?.params?.id || null,
        requestData: safeJson((request as any)?.body),
        responseData: safeJson(payload),
        status: String(status),
        processingTime: null,
      };
      await this.activityRepo.insert(log);
    } catch (_) {
      // لا نعرقل مسار الخطأ إذا فشل تسجيل النشاط
    }

    response.status(status).json(payload);
  }
}

function safeJson(input: any): any {
  try {
    if (input === undefined) return null;
    return JSON.parse(JSON.stringify(input));
  } catch (_) {
    return null;
  }
}
