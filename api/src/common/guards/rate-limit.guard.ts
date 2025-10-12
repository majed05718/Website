import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// حارس يعتمد إعدادات ThrottlerModule المعرّفة بأسماء (default/auth/public)
// ويُعدل المُعرِّف ليتتبع المستخدم المصادق عليه بدلاً من عنوان IP.
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId: string | undefined = req?.user?.user_id;
    return userId ?? (await super.getTracker(req));
  }
}
