import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], example: 'confirmed', description: 'الحالة الجديدة' })
  @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
  status: string;

  @ApiPropertyOptional({ example: 'تم تأكيد الموعد مع العميل', description: 'ملاحظات' })
  @IsString()
  @IsOptional()
  notes?: string;
}
