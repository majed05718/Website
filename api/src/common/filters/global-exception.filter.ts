import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { SupabaseService } from '../../supabase/supabase.service';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  constructor(
    private readonly supabaseService: SupabaseService,
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
      await this.supabaseService.getClient()
        .from('activity_logs')
        .insert({
          office_id: (request as any)?.user?.office_id ?? null,
          user_phone: (request as any)?.user?.phone ?? null,
          user_role: (request as any)?.user?.role ?? null,
          activity_type: `ERROR ${request.method} ${request.url}`,
          entity_type: (request as any)?.params?.entity || null,
          entity_id: (request as any)?.params?.id || null,
          request_data: safeJson((request as any)?.body),
          response_data: safeJson(payload),
          status: String(status),
          processing_time: null,
        });
    } catch (_) {
    }

    if (!response.headersSent) {
      response.status(status).json(payload);
    }
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
