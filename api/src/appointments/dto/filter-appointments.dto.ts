import { IsOptional, IsString, IsEnum, IsInt, Min, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAppointmentsDto {
  @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'معاينة', description: 'البحث في العنوان/الوصف' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'], description: 'نوع الموعد' })
  @IsOptional()
  @IsEnum(['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'])
  type?: string;

  @ApiPropertyOptional({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], description: 'حالة الموعد' })
  @IsOptional()
  @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
  status?: string;

  @ApiPropertyOptional({ example: '2025-10-20', description: 'التاريخ المحدد' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: '2025-10-01', description: 'من تاريخ' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ example: '2025-10-31', description: 'إلى تاريخ' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'معرف العقار' })
  @IsOptional()
  @IsUUID()
  property_id?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'معرف العميل' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف' })
  @IsOptional()
  @IsUUID()
  assigned_staff_id?: string;

  @ApiPropertyOptional({ enum: ['date', 'created_at', 'start_time'], example: 'date', description: 'ترتيب حسب' })
  @IsOptional()
  @IsString()
  order_by?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc', description: 'اتجاه الترتيب' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: string;
}
