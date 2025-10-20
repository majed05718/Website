import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelAppointmentDto {
  @ApiProperty({ example: 'العميل طلب إلغاء الموعد', description: 'سبب الإلغاء' })
  @IsString()
  cancellation_reason: string;
}
