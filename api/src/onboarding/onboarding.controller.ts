import { BadRequestException, Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post('office')
  async createOffice(@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    return this.onboarding.createOffice(body);
  }

  @Get('verify-code')
  async verify(@Query('office_code') officeCode: string) {
    if (!officeCode) throw new BadRequestException('office_code مفقود');
    const res = await this.onboarding.verifyCodeAvailable(officeCode);
    return res;
  }

  @Post('complete')
  async complete(@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    return this.onboarding.complete(body);
  }
}
