import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { Office } from '../entities/office.entity';
import { UserPermission } from '../entities/user-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Office, UserPermission])],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
