import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { MetaApiService } from './meta-api.service';

@Module({
  controllers: [WhatsAppController],
  providers: [MetaApiService],
})
export class WhatsAppModule {}
