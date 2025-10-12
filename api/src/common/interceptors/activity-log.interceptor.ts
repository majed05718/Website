import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';

// إنترسيبتور لتسجيل الأنشطة (يستثني GET و /health)
@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
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
      officeId: request?.user?.office_id ?? null,
      userPhone: request?.user?.phone ?? null,
      userRole: request?.user?.role ?? null,
      activityType: `${method} ${path}`,
      entityType: request?.params?.entity || null,
      entityId: request?.params?.id || null,
      requestData: safeJson(request?.body),
    } as Partial<ActivityLog>;

    return next.handle().pipe(
      tap(async (data) => {
        const processingTime = Date.now() - start;
        try {
          await this.activityRepo.insert({
            ...baseLog,
            responseData: safeJson(data),
            status: String(response.statusCode || 200),
            processingTime,
          });
        } catch (_) {
          // نتجاهل أخطاء التسجيل حتى لا تؤثر على الاستجابة
        }
      }),
      catchError(async (err) => {
        const processingTime = Date.now() - start;
        try {
          await this.activityRepo.insert({
            ...baseLog,
            responseData: safeJson({ message: err?.message, name: err?.name }),
            status: String(err?.status || 500),
            processingTime,
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
