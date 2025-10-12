import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppController } from './whatsapp.controller';
import { Conversation } from './conversation.entity';
import { Office } from '../entities/office.entity';
import { MetaApiService } from './meta-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Office])],
  controllers: [WhatsAppController],
  providers: [MetaApiService],
})
export class WhatsAppModule {}
