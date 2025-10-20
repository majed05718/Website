import { IsString, IsEnum, IsOptional, IsUUID, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'معاينة عقار', description: 'عنوان الموعد' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'معاينة شقة في حي النرجس', description: 'الوصف' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'], example: 'viewing', description: 'نوع الموعد' })
  @IsEnum(['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'])
  type: string;

  @ApiProperty({ example: '2025-10-20', description: 'التاريخ (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00:00', description: 'وقت البداية (HH:MM:SS)' })
  @IsString()
  start_time: string;

  @ApiProperty({ example: '11:00:00', description: 'وقت النهاية (HH:MM:SS)' })
  @IsString()
  end_time: string;

  @ApiPropertyOptional({ example: 60, description: 'المدة بالدقائق' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 'uuid-property-id', description: 'معرف العقار' })
  @IsUUID()
  @IsOptional()
  property_id?: string;

  @ApiPropertyOptional({ example: 'uuid-customer-id', description: 'معرف العميل' })
  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @ApiProperty({ example: 'uuid-staff-id', description: 'معرف الموظف المسؤول' })
  @IsUUID()
  assigned_staff_id: string;

  @ApiPropertyOptional({ example: 'شارع الملك فهد، الرياض', description: 'الموقع' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij', description: 'رابط الاجتماع عبر الإنترنت' })
  @IsString()
  @IsOptional()
  meeting_link?: string;

  @ApiPropertyOptional({ example: 'يُرجى إحضار الهوية الوطنية', description: 'ملاحظات' })
  @IsString()
  @IsOptional()
  notes?: string;
}
