import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCustomersDto {
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

  @ApiPropertyOptional({ example: 'محمد', description: 'البحث في الاسم/البريد/الهاتف' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['buyer', 'seller', 'renter', 'landlord', 'both'], description: 'نوع العميل' })
  @IsOptional()
  @IsEnum(['buyer', 'seller', 'renter', 'landlord', 'both'])
  type?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'blocked'], description: 'حالة العميل' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'blocked'])
  status?: string;

  @ApiPropertyOptional({ example: 'الرياض', description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'website', description: 'المصدر' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 5, description: 'التقييم' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rating?: number;

  @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف المسؤول' })
  @IsOptional()
  @IsString()
  assigned_staff_id?: string;

  @ApiPropertyOptional({ enum: ['created_at', 'updated_at', 'name', 'last_contact_date'], example: 'created_at', description: 'ترتيب حسب' })
  @IsOptional()
  @IsString()
  order_by?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc', description: 'اتجاه الترتيب' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: string;
}
