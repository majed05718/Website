import { BadRequestException, Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/roles.decorator';

/**
 * Onboarding Controller
 * 
 * Handles office registration and setup
 * - Office creation is public (new user signup)
 * - Complete setup requires SystemAdmin role
 */
@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  /**
   * Create new office - PUBLIC endpoint for registration
   */
  @Public()
  @Post('office')
  async createOffice(@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    return this.onboarding.createOffice(body);
  }

  /**
   * Verify office code availability - PUBLIC for registration flow
   */
  @Public()
  @Get('verify-code')
  async verify(@Query('office_code') officeCode: string) {
    if (!officeCode) throw new BadRequestException('office_code مفقود');
    const res = await this.onboarding.verifyCodeAvailable(officeCode);
    return res;
  }

  /**
   * Complete office setup - Requires SystemAdmin
   */
  @Roles('SystemAdmin')
  @Post('complete')
  async complete(@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    return this.onboarding.complete(body);
  }
}
