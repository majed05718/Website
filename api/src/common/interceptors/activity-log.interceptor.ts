import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: any = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method as string;
    const path = (request.route?.path || request.url || '').toString();

    const isHealth = path.startsWith('/health') || path === 'health';
    const isGet = method.toUpperCase() === 'GET';

    if (isHealth || isGet) {
      return next.handle();
    }

    const start = Date.now();

    const baseLog = {
      office_id: request?.user?.office_id ?? null,
      user_phone: request?.user?.phone ?? null,
      user_role: request?.user?.role ?? null,
      activity_type: `${method} ${path}`,
      entity_type: request?.params?.entity || null,
      entity_id: request?.params?.id || null,
      request_data: safeJson(request?.body),
    };

    return next.handle().pipe(
      tap(async (data) => {
        const processingTime = Date.now() - start;
        try {
          await this.supabaseService.getClient()
            .from('activity_logs')
            .insert({
              ...baseLog,
              response_data: safeJson(data),
              status: String(response.statusCode || 200),
              processing_time: processingTime,
            });
        } catch (_) {
        }
      }),
      catchError(async (err) => {
        const processingTime = Date.now() - start;
        try {
          await this.supabaseService.getClient()
            .from('activity_logs')
            .insert({
              ...baseLog,
              response_data: safeJson({ message: err?.message, name: err?.name }),
              status: String(err?.status || 500),
              processing_time: processingTime,
            });
        } catch (_) {}
        throw err;
      }) as any,
    );
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
