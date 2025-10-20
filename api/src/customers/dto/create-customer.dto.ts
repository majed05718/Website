import { IsString, IsEmail, IsOptional, IsEnum, IsInt, Min, Max, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'محمد أحمد', description: 'اسم العميل' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+966501234567', description: 'رقم الهاتف' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'mohamed@example.com', description: 'البريد الإلكتروني' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'رقم الهوية الوطنية' })
  @IsString()
  @IsOptional()
  national_id?: string;

  @ApiProperty({ enum: ['buyer', 'seller', 'renter', 'landlord', 'both'], example: 'buyer', description: 'نوع العميل' })
  @IsEnum(['buyer', 'seller', 'renter', 'landlord', 'both'])
  type: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'blocked'], example: 'active', description: 'حالة العميل' })
  @IsEnum(['active', 'inactive', 'blocked'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'شارع الملك فهد، الرياض', description: 'العنوان' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'الرياض', description: 'المدينة' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ enum: ['phone', 'email', 'whatsapp'], example: 'whatsapp', description: 'طريقة التواصل المفضلة' })
  @IsEnum(['phone', 'email', 'whatsapp'])
  @IsOptional()
  preferred_contact_method?: string;

  @ApiPropertyOptional({ example: 'عميل مميز', description: 'ملاحظات' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: { interests: ['villa', 'apartment'] }, description: 'الوسوم' })
  @IsObject()
  @IsOptional()
  tags?: any;

  @ApiPropertyOptional({ example: 'website', description: 'مصدر العميل' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5, description: 'التقييم' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 'uuid-staff-id', description: 'معرف الموظف المسؤول' })
  @IsUUID()
  @IsOptional()
  assigned_staff_id?: string;
}
