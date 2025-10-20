import { IsString, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerInteractionDto {
  @ApiProperty({ enum: ['call', 'meeting', 'email', 'whatsapp', 'visit'], example: 'call', description: 'نوع التعامل' })
  @IsEnum(['call', 'meeting', 'email', 'whatsapp', 'visit'])
  type: string;

  @ApiProperty({ example: 'تم الاتصال لمتابعة طلب العميل', description: 'وصف التعامل' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2025-10-20T10:00:00Z', description: 'تاريخ التعامل' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'uuid-property-id', description: 'معرف العقار المرتبط' })
  @IsUUID()
  @IsOptional()
  property_id?: string;

  @ApiPropertyOptional({ example: 'uuid-contract-id', description: 'معرف العقد المرتبط' })
  @IsUUID()
  @IsOptional()
  contract_id?: string;

  @ApiPropertyOptional({ example: 'العميل مهتم ويريد زيارة العقار', description: 'نتيجة التعامل' })
  @IsString()
  @IsOptional()
  outcome?: string;

  @ApiPropertyOptional({ example: '2025-10-25T14:00:00Z', description: 'تاريخ المتابعة القادمة' })
  @IsDateString()
  @IsOptional()
  next_follow_up?: string;

  @ApiPropertyOptional({ example: 'uuid-staff-id', description: 'معرف الموظف' })
  @IsUUID()
  @IsOptional()
  staff_id?: string;
}
